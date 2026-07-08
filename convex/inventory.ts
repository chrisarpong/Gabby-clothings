import { mutation, action, query, internalQuery, internalAction } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";


const RESERVE_TIME_MS = 15 * 60 * 1000; // 15 minutes

export const getActiveReserves = query({
  args: { productId: v.id("products"), variantSku: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const reserves = await ctx.db
      .query("activeCheckouts")
      .filter((q) => q.gt(q.field("expiresAt"), now))
      .collect();

    let count = 0;
    for (const r of reserves) {
      for (const item of r.items) {
        if (item.productId === args.productId && item.variantSku === args.variantSku) {
          count += item.quantity;
        }
      }
    }
    return count;
  },
});

export const softReserveItems = mutation({
  args: {
    userId: v.string(), // clerkId or anonymous sessionId
    items: v.array(
      v.object({
        productId: v.id("products"),
        variantSku: v.optional(v.string()),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Clean up old reserves for this user
    const existing = await ctx.db
      .query("activeCheckouts")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    for (const res of existing) {
      await ctx.db.delete(res._id);
    }

    // Check stock before reserving
    for (const item of args.items) {
      if (item.variantSku === "custom") continue;
      
      const product: any = await ctx.db.get(item.productId as any);
      if (!product) throw new Error("Product not found");

      let availableStock = 0;
      if (product.variants && product.variants.length > 0) {
        const variant = product.variants.find((v: any) => v.sku === item.variantSku);
        availableStock = variant ? variant.stock : 0;
      } else {
        availableStock = product.stock ?? 0;
      }

      // Check against other active reserves
      const otherReserves = await ctx.db
        .query("activeCheckouts")
        .filter((q) => q.gt(q.field("expiresAt"), now))
        .collect();

      let reservedCount = 0;
      for (const r of otherReserves) {
        if (r.userId === args.userId) continue;
        for (const rItem of r.items) {
          if (rItem.productId === item.productId && rItem.variantSku === item.variantSku) {
            reservedCount += rItem.quantity;
          }
        }
      }

      if (availableStock - reservedCount < item.quantity) {
        throw new ConvexError(`Not enough stock for ${product.name}`);
      }
    }

    await ctx.db.insert("activeCheckouts", {
      userId: args.userId,
      items: args.items,
      expiresAt: now + RESERVE_TIME_MS,
    });
  },
});

export const decrementStock = mutation({
  args: {
    items: v.array(
      v.object({
        productId: v.id("products"),
        variantSku: v.optional(v.string()),
        quantity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      if (item.variantSku === "custom") continue;

      const product = await ctx.db.get(item.productId);
      if (!product) continue;

      if (product.variants && product.variants.length > 0) {
        const updatedVariants = product.variants.map((v) => {
          if (v.sku === item.variantSku) {
            return { ...v, stock: Math.max(0, v.stock - item.quantity) };
          }
          return v;
        });
        await ctx.db.patch(product._id, { variants: updatedVariants });
      } else if (product.stock !== undefined) {
        await ctx.db.patch(product._id, { stock: Math.max(0, product.stock - item.quantity) });
      }
    }
  },
});

export const getLowStockCarts = internalQuery({
  args: {},
  handler: async (ctx) => {
    const carts = await ctx.db.query("carts").collect();
    const alertsToSend = [];

    for (const cart of carts) {
      if (!cart.userId) continue;
      
      const user = await ctx.db.query("users").withIndex("by_clerkId", q => q.eq("clerkId", cart.userId)).first();
      if (!user || !user.email) continue;

      for (const item of cart.items) {
        if (item.variantSku === "custom") continue;
        const product: any = await ctx.db.get(item.productId as any);
        if (!product) continue;

        let stock = 0;
        if (product.variants && product.variants.length > 0) {
           const variant = product.variants.find((v: any) => v.sku === item.variantSku);
           stock = variant ? variant.stock : 0;
        } else {
           stock = product.stock ?? 0;
        }

        if (stock > 0 && stock <= 5) {
          // Avoid sending multiple alerts for the same user/product combo if possible,
          // but for simplicity we'll just push them.
          alertsToSend.push({
            email: user.email,
            name: user.firstName || "Customer",
            productName: product.name,
            stock: stock,
          });
        }
      }
    }
    
    // Deduplicate by email and productName
    const uniqueAlerts = [];
    const seen = new Set();
    for (const a of alertsToSend) {
       const key = `${a.email}-${a.productName}`;
       if (!seen.has(key)) {
         seen.add(key);
         uniqueAlerts.push(a);
       }
    }
    
    return uniqueAlerts;
  }
});

export const sendLowStockAlerts = internalAction({
  args: {},
  handler: async (ctx) => {
    const alerts = await ctx.runQuery(internal.inventory.getLowStockCarts);
    for (const alert of alerts) {
      await ctx.runAction(internal.email.sendLowStockAlertEmail, alert);
    }
  }
});
