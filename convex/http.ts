import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/paystack",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (body.event === "charge.success") {
      const reference = body.data.reference;
      await ctx.runMutation(api.orders.markOrderProcessing, { reference });
    }
    return new Response(null, { status: 200 });
  }),
});

export default http;
