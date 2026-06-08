import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/getFile",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("storageId") as Id<"_storage">;
    
    if (!storageId) {
      return new Response("Missing storageId parameter", { status: 400 });
    }

    const blob = await ctx.storage.get(storageId);
    if (blob === null) {
      return new Response("Image not found", { status: 404 });
    }
    
    return new Response(blob);
  }),
});

export default http;
