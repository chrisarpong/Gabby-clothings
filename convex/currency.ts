import { internalAction, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const TARGET_CURRENCIES = ["USD", "GBP", "EUR"];

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
    
    const manualRates: Record<string, number | undefined> = {
      USD: manualUSD && manualUSD.value ? parseFloat(manualUSD.value) : undefined,
      GBP: manualGBP && manualGBP.value ? parseFloat(manualGBP.value) : undefined,
      EUR: manualEUR && manualEUR.value ? parseFloat(manualEUR.value) : undefined,
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
