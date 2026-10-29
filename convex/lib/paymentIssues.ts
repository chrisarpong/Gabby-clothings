export async function recordPaymentIssue(ctx: any, args: { reference?: string; kind: string; details: string; amountPesewas?: number; relatedId?: any }) {
  if (args.reference) {
    const existing = await ctx.db.query("paymentIssues").withIndex("by_reference", (q: any) => q.eq("reference", args.reference)).collect();
    if (existing.some((issue: any) => issue.kind === args.kind && !issue.resolved)) return existing.find((issue: any) => issue.kind === args.kind && !issue.resolved)?._id;
  }
  return await ctx.db.insert("paymentIssues", { ...args, resolved: false, createdAt: Date.now() });
}
