import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated: You must be logged in to upload files.");
  }
  
  return await ctx.storage.generateUploadUrl();
});
