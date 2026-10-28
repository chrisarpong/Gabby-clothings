import { internalAction, internalMutation, query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { requireStaff } from "./staffAuth";

const TARGET_CURRENCIES = ["USD", "GBP", "EUR", "ZAR", "NGN", "CAD", "AUD", "JPY", "AED"];

export const fetchLiveRates = internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      const resp = await fetch("https://open.er-api.com/v6/latest/GHS");
      if (!resp.ok) throw new Error("Failed to fetch rates");
      const data = await resp.json();
      
      if (data.result === "success" && data.rates) {
        const updates = TARGET_CURRENCIES.map(curr => ({
          currency: curr,
          liveRate: data.rates[curr],
        }));
        
        await ctx.runMutation(internal.currency.updateLiveRates, { updates });
      }
    } catch (e) {
      console.error("Error fetching live rates", e);
    }
  }
});

export const updateLiveRates = internalMutation({
  args: {
    updates: v.array(v.object({
      currency: v.string(),
      liveRate: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const update of args.updates) {
      const existing = await ctx.db
        .query("exchangeRates")
        .withIndex("by_currency", q => q.eq("currency", update.currency))
        .first();
        
      if (existing) {
        await ctx.db.patch(existing._id, {
          liveRate: update.liveRate,
          lastUpdated: now,
        });
      } else {
        await ctx.db.insert("exchangeRates", {
          currency: update.currency,
          liveRate: update.liveRate,
          lastUpdated: now,
        });
      }
    }
  }
});

export const getRates = query({
  args: {},
  handler: async (ctx) => {
    const rates = await ctx.db.query("exchangeRates").collect();
    const result: Record<string, number> = { GHS: 1 };
    
    const bufferSetting = await ctx.db
      .query("settings")
      .withIndex("by_key", q => q.eq("key", "safetyBufferPercentage"))
      .first();
      
    const buffer = bufferSetting ? parseFloat(bufferSetting.value) : 0;
    
    // Fetch manual rates from settings
    const manualUSD = await ctx.db.query("settings").withIndex("by_key", q => q.eq("key", "manualRateUSD")).first();
    const manualGBP = await ctx.db.query("settings").withIndex("by_key", q => q.eq("key", "manualRateGBP")).first();
    const manualEUR = await ctx.db.query("settings").withIndex("by_key", q => q.eq("key", "manualRateEUR")).first();
    const manualZAR = await ctx.db.query("settings").withIndex("by_key", q => q.eq("key", "manualRateZAR")).first();
    const manualNGN = await ctx.db.query("settings").withIndex("by_key", q => q.eq("key", "manualRateNGN")).first();
    const manualCAD = await ctx.db.query("settings").withIndex("by_key", q => q.eq("key", "manualRateCAD")).first();
    const manualAUD = await ctx.db.query("settings").withIndex("by_key", q => q.eq("key", "manualRateAUD")).first();
    const manualJPY = await ctx.db.query("settings").withIndex("by_key", q => q.eq("key", "manualRateJPY")).first();
    const manualAED = await ctx.db.query("settings").withIndex("by_key", q => q.eq("key", "manualRateAED")).first();
    
    const manualRates: Record<string, number | undefined> = {
      USD: manualUSD && manualUSD.value ? parseFloat(manualUSD.value) : undefined,
      GBP: manualGBP && manualGBP.value ? parseFloat(manualGBP.value) : undefined,
      EUR: manualEUR && manualEUR.value ? parseFloat(manualEUR.value) : undefined,
      ZAR: manualZAR && manualZAR.value ? parseFloat(manualZAR.value) : undefined,
      NGN: manualNGN && manualNGN.value ? parseFloat(manualNGN.value) : undefined,
      CAD: manualCAD && manualCAD.value ? parseFloat(manualCAD.value) : undefined,
      AUD: manualAUD && manualAUD.value ? parseFloat(manualAUD.value) : undefined,
      JPY: manualJPY && manualJPY.value ? parseFloat(manualJPY.value) : undefined,
      AED: manualAED && manualAED.value ? parseFloat(manualAED.value) : undefined,
    };
    
    const now = Date.now();
    
    for (const rate of rates) {
      if (manualRates[rate.currency]) {
        result[rate.currency] = manualRates[rate.currency]!;
      } else {
        let effectiveRate = rate.liveRate;
        if (buffer > 0) {
          effectiveRate = effectiveRate * (1 + buffer / 100);
        }
        result[rate.currency] = effectiveRate;
      }
    }
    
    return result;
  }
});

export const setManualRate = mutation({
  args: {
    staffToken: v.string(),
    currency: v.string(),
    rate: v.number(),
    manualRateExpiry: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "financials" });

    const ALLOWED_CURRENCIES = ["USD", "EUR", "GBP", "ZAR", "NGN", "CAD", "AUD", "JPY", "AED"];
    if (!ALLOWED_CURRENCIES.includes(args.currency)) {
      throw new ConvexError(`Invalid currency: ${args.currency}. Must be one of: ${ALLOWED_CURRENCIES.join(", ")}`);
    }

    if (typeof args.rate !== "number" || !Number.isFinite(args.rate) || args.rate <= 0) {
      throw new ConvexError("Rate must be a positive finite number");
    }

    if (args.manualRateExpiry !== undefined && args.manualRateExpiry <= Date.now()) {
      throw new ConvexError("Manual rate expiry must be in the future");
    }

    const existing = await ctx.db
      .query("exchangeRates")
      .withIndex("by_currency", (q) => q.eq("currency", args.currency))
      .first();

    if (existing && Number.isFinite(existing.liveRate) && existing.liveRate > 0) {
      const minRate = existing.liveRate * 0.2;
      const maxRate = existing.liveRate * 5;
      if (args.rate < minRate || args.rate > maxRate) {
        throw new ConvexError(`Rate must be between ${minRate} and ${maxRate} for ${args.currency}`);
      }
    }

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        manualRate: args.rate,
        manualRateExpiry: args.manualRateExpiry,
        lastUpdated: now,
      });
    } else {
      await ctx.db.insert("exchangeRates", {
        currency: args.currency,
        liveRate: args.rate,
        manualRate: args.rate,
        manualRateExpiry: args.manualRateExpiry,
        lastUpdated: now,
      });
    }

    // Also update settings table for backward compatibility with getRates and existing UI
    const settingKey = `manualRate${args.currency}`;
    const settingRecord = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", settingKey))
      .first();

    if (settingRecord) {
      await ctx.db.patch(settingRecord._id, { value: String(args.rate) });
    } else {
      await ctx.db.insert("settings", {
        key: settingKey,
        value: String(args.rate),
      });
    }
  },
});

export const clearManualRate = mutation({
  args: {
    staffToken: v.string(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx, args.staffToken, { permission: "financials" });

    const allowedCurrencies = ["USD", "EUR", "GBP", "ZAR", "NGN", "CAD", "AUD", "JPY", "AED"];
    if (!allowedCurrencies.includes(args.currency)) {
      throw new ConvexError(`Invalid manual-rate currency: ${args.currency}`);
    }

    const existingRate = await ctx.db
      .query("exchangeRates")
      .withIndex("by_currency", (q) => q.eq("currency", args.currency))
      .first();
    if (existingRate) {
      await ctx.db.patch(existingRate._id, {
        manualRate: undefined,
        manualRateExpiry: undefined,
      });
    }

    const settingKey = `manualRate${args.currency}`;
    const setting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", settingKey))
      .first();
    if (setting) await ctx.db.delete(setting._id);
  },
});

