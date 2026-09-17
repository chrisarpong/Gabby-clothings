import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedTailorDashboard = mutation({
  args: {
    userEmail: v.string(), // e.g. "kynovasystems.africa@gmail.com"
  },
  handler: async (ctx, args) => {
    // 1. Get the user (the tailor)
    const user = await ctx.db.query("users").first();

    if (!user) throw new Error("User not found in DB");

    // Make sure they have a tailor role so they appear in Admin Tailors tab
    const tailorRole = await ctx.db
      .query("roles")
      .filter(q => q.eq(q.field("name"), "tailor"))
      .first();
    
    if (tailorRole) {
      await ctx.db.patch(user._id, { roleId: tailorRole._id });
    }

    // 2. Create some mock orders assigned to this user
    await ctx.db.insert("orders", {
      orderId: "GB-TEST-001",
      userId: user.clerkId,
      customerDetails: {
        email: "client1@example.com",
        firstName: "Michael",
        lastName: "Appiah",
        phone: "0501234567"
      },
      items: [
        {
          productName: "Bespoke Suit - Navy Blue",
          quantity: 1,
          priceAtPurchase: 2500,
          measurements: {
            chest: 42,
            waist: 34,
            shoulders: 19
          }
        }
      ],
      totalAmount: 2500,
      status: "processing",
      productionStatus: "cutting",
      assignedDesignerId: user._id,
      paymentStatus: "paid"
    });

    await ctx.db.insert("orders", {
      orderId: "GB-TEST-002",
      userId: user.clerkId,
      customerDetails: {
        email: "client2@example.com",
        firstName: "Sarah",
        lastName: "Mensah",
        phone: "0249876543"
      },
      items: [
        {
          productName: "Bridal Gown Custom",
          quantity: 1,
          priceAtPurchase: 8000,
          measurements: {
            bust: 36,
            waist: 28,
            hips: 40
          }
        }
      ],
      totalAmount: 8000,
      status: "processing",
      productionStatus: "fitting",
      assignedDesignerId: user._id,
      paymentStatus: "partial"
    });

    // 3. Add a mock client to the DB
    await ctx.db.insert("users", {
      clerkId: "mock_clerk_id_client1",
      email: "mockclient@example.com",
      firstName: "James",
      lastName: "Osei",
      role: "client",
      phone: "0556667777",
      address: {
        residentialAddress: "123 Spintex Road",
        city: "Accra",
        region: "Greater Accra"
      },
      savedMeasurements: {
        neck: 16,
        chest: 40,
        waist: 32,
        sleeves: 25
      }
    });

    return "Successfully seeded tailor dashboard and client mock data";
  }
});
