import { checkAdmin } from "./authHelper";
import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

export const searchProducts = query({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db.query("products").filter((q) => q.eq(q.field("status"), "active")).collect();
    const query = args.q.toLowerCase();
    return all.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
  }
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category_status", (q) => q.eq("category", args.category).eq("status", "active"))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByIds = query({
  args: { ids: v.array(v.id("products")) },
  handler: async (ctx, args) => {
    const products = [];
    for (const id of args.ids) {
      const p = await ctx.db.get(id);
      if (p) products.push(p);
    }
    return products;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    basePrice: v.number(),
    description: v.string(),
    images: v.array(v.string()),
    category: v.string(),
    type: v.string(),
    status: v.string(),
    stock: v.optional(v.number()),
    fabricRequirement: v.optional(v.string()),
    catalogIds: v.optional(v.array(v.id("catalogs"))),
    seo: v.optional(v.object({
      metaTitle: v.optional(v.string()),
      metaDescription: v.optional(v.string()),
    })),
    variants: v.optional(
      v.array(
        v.object({
          sku: v.string(),
          size: v.string(),
          color: v.string(),
          stock: v.number(),
          priceTotal: v.optional(v.number()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);
    return await ctx.db.insert("products", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    basePrice: v.optional(v.number()),
    description: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    stock: v.optional(v.number()),
    fabricRequirement: v.optional(v.string()),
    catalogIds: v.optional(v.array(v.id("catalogs"))),
    seo: v.optional(v.object({
      metaTitle: v.optional(v.string()),
      metaDescription: v.optional(v.string()),
    })),
    variants: v.optional(
      v.array(
        v.object({
          sku: v.string(),
          size: v.string(),
          color: v.string(),
          stock: v.number(),
          priceTotal: v.optional(v.number()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);
    
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const updateVariantStock = mutation({
  args: {
    productId: v.id("products"),
    sku: v.string(),
    quantityToDecrease: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    if (!product.variants) return; 

    const updatedVariants = product.variants.map((v) => {
      if (v.sku === args.sku) {
        if (v.stock < args.quantityToDecrease) {
          throw new Error(`Insufficient stock for SKU: ${args.sku}`);
        }
        return { ...v, stock: v.stock - args.quantityToDecrease };
      }
      return v;
    });

    return await ctx.db.patch(args.productId, {
      variants: updatedVariants,
    });
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Danger: Seed mutation is strictly disabled in production environments.");
    }
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    await checkAdmin(ctx, identity);

    const existing = await ctx.db.query("products").collect();
    
    // Fallbacks for existing dummy data that might not have images
    const fallbackImages = [
      "/assets/1.jpg",
      "/assets/2.webp",
      "/assets/3.jpg",
      "/assets/kaftan.jpeg"
    ];

    // Update missing images & migrate old schema
    for (let i = 0; i < existing.length; i++) {
        const p = existing[i];
        const patchData: any = {};
        if (!p.images || p.images.length === 0) {
            patchData.images = [fallbackImages[i % fallbackImages.length]];
        }
        if (p.basePrice === undefined) {
             patchData.basePrice = (p as any).price || 1000;
        }
        if (!p.type) patchData.type = 'physical';
        if (!p.status) patchData.status = 'active';
        if (!p.category) patchData.category = 'Suiting';
        
        if (Object.keys(patchData).length > 0) {
            await ctx.db.patch(p._id, patchData);
        }
    }

    const demoProducts = [
      { name: "Emerald Embroidered Agbada", basePrice: 4200, category: "Agbadas", images: ["/assets/agbada 2.jpeg"], description: "A meticulously crafted three-piece agbada with deep emerald embroidery.", type: "physical", status: "active" },
      { name: "Royal Onyx Kaftan", basePrice: 12500, category: "Kaftans", images: ["/assets/kaftan.jpeg"], description: "Master tailors constructed this sleek onyx kaftan, perfect for high-profile events.", type: "physical", status: "active" },
      { name: "Tailored Camel Overcoat", basePrice: 3800, category: "Suiting", images: ["/assets/Royalty .jpeg"], description: "Classic tailored camel overcoat, cut from the finest cashmere wool blend.", type: "physical", status: "active" },
      { name: "Midnight Blue Senator Set", basePrice: 15000, category: "Agbadas", images: ["/assets/3.jpg"], description: "Traditional Senator silhouette perfected with hand-stitched detailing.", type: "physical", status: "active" },
      { name: "Classic Linen Kaftan Set", basePrice: 5500, category: "Kaftans", images: ["/assets/4.jpg"], description: "An airy oversized Kaftan made from raw artisanal linen. Lightweight and bold.", type: "physical", status: "active" },
      { name: "Bespoke Navy Two-Piece", basePrice: 18200, category: "Suiting", images: ["/assets/5.jpg"], description: "Custom-fitted navy suit tailored to exact measurements.", type: "physical", status: "active" },
      { name: "Heritage Jacquard Agbada", basePrice: 9800, category: "Agbadas", images: ["/assets/6.jpg"], description: "A tailored set featuring custom woven jacquard motifs inspired by heritage textiles.", type: "physical", status: "active" },
      { name: "Ivory Silk Kaftan", basePrice: 11200, category: "Kaftans", images: ["/assets/7.jpg"], description: "Exquisite ivory kaftan offering a tailored silhouette and unmatched elegance.", type: "physical", status: "active" },
      { name: "Crimson Velvet Kaftan", basePrice: 8500, category: "Kaftans", images: ["/assets/agbada 2.jpeg"], description: "A bold crimson velvet kaftan for special traditional events.", type: "physical", status: "active" },
      { name: "Charcoal Pinstripe Suit", basePrice: 14000, category: "Suiting", images: ["/assets/kaftan.jpeg"], description: "Classic charcoal pinstripe suit, single-breasted with sharp peak lapels.", type: "physical", status: "active" },
      { name: "Sahara Linen Trousers", basePrice: 2200, category: "Suiting", images: ["/assets/Royalty .jpeg"], description: "Breathable, wide-leg linen trousers for relaxed elegance.", type: "physical", status: "active" },
      { name: "Golden Embroidery Agbada", basePrice: 21000, category: "Agbadas", images: ["/assets/3.jpg"], description: "Luxurious agbada featuring hand-woven gold thread embroidery.", type: "physical", status: "active" },
      { name: "Modern Minimalist Tunic", basePrice: 4800, category: "Kaftans", images: ["/assets/4.jpg"], description: "A minimalist approach to the traditional tunic, featuring a concealed placket.", type: "physical", status: "active" },
      { name: "Double-Breasted Wool Blazer", basePrice: 7500, category: "Suiting", images: ["/assets/5.jpg"], description: "Structured double-breasted blazer cut from premium Italian wool.", type: "physical", status: "active" },
      { name: "Onyx Senator Style Suit", basePrice: 9200, category: "Kaftans", images: ["/assets/6.jpg"], description: "Contemporary Senator style suit in pitch-black onyx fabric.", type: "physical", status: "active" },
      { name: "Regal White Agbada Set", basePrice: 17500, category: "Agbadas", images: ["/assets/7.jpg"], description: "Pristine white agbada set meant for royalty and grand celebrations.", type: "physical", status: "active" },
      { name: "Earth Tone Cotton Kaftan", basePrice: 3200, category: "Kaftans", images: ["/assets/agbada 2.jpeg"], description: "A comfortable, everyday cotton kaftan in muted earth tones.", type: "physical", status: "active" },
      { name: "Textured Silk Pocket Square", basePrice: 800, category: "Accessories", images: ["/assets/kaftan.jpeg"], description: "Hand-rolled silk pocket square to complement any bespoke suit.", type: "physical", status: "active" },
      { name: "Leather Monk Strap Shoes", basePrice: 4500, category: "Accessories", images: ["/assets/Royalty .jpeg"], description: "Hand-polished leather monk straps, the ultimate gentleman's footwear.", type: "physical", status: "active" },
      { name: "Velvet Loafers with Crest", basePrice: 5200, category: "Accessories", images: ["/assets/3.jpg"], description: "Premium velvet loafers featuring a custom embroidered crest.", type: "physical", status: "active" }
    ];

    const variants = [
      { sku: "VAR-M", size: "M", color: "Original", stock: 10 },
      { sku: "VAR-L", size: "L", color: "Original", stock: 15 },
      { sku: "VAR-XL", size: "XL", color: "Original", stock: 5 },
    ];

    let count = 0;
    for (const p of demoProducts) {
      const match = existing.find(e => e.name === p.name);
      if (!match) {
        const pId = await ctx.db.insert("products", { ...p, variants } as any);
        // Add 2 reviews per product roughly
        await ctx.db.insert("reviews", {
           productId: pId,
           userId: "guest",
           rating: 5,
           comment: "Amazing craftsmanship and the fit is incredibly precise. Worth every penny.",
           status: "approved"
        });
        await ctx.db.insert("reviews", {
           productId: pId,
           userId: "guest2",
           rating: 4,
           comment: "Beautiful piece. The fabric feels luxurious but the delivery took a bit long.",
           status: "approved"
        });
        count++;
      } else {
        // Sync category just in case it was incorrectly seeded earlier
        const patchData: any = {};
        if (match.category !== p.category) patchData.category = p.category;
        if (match.status !== "active") patchData.status = "active";
        if (match.basePrice === undefined) patchData.basePrice = p.basePrice || 1000;
        if (!match.type) patchData.type = "physical";
        patchData.images = p.images;
        
        if (Object.keys(patchData).length > 0) {
           await ctx.db.patch(match._id, patchData);
        }
      }
    }
    return `Seeded ${count} products.`;
  }
});

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated: You must be signed in to upload.");
  await checkAdmin(ctx, identity);
  return await ctx.storage.generateUploadUrl();
});

