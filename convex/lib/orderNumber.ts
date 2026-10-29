export async function nextOrderNumber(ctx: any): Promise<string> {
  const counterSetting = await ctx.db.query("settings")
    .withIndex("by_key", (q: any) => q.eq("key", "orderCounter"))
    .first();

  let next = 1;
  if (counterSetting) {
    const value = counterSetting.value;
    const current = typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value.trim())
        ? Number(value.trim())
        : Number.NaN;
    if (!Number.isSafeInteger(current) || current < 0 || current >= Number.MAX_SAFE_INTEGER) {
      throw new Error("Invalid order counter stored in database.");
    }
    next = current + 1;
    await ctx.db.patch(counterSetting._id, { value: next });
  } else {
    await ctx.db.insert("settings", { key: "orderCounter", value: next });
  }

  return `GB-${String(next).padStart(3, "0")}`;
}
