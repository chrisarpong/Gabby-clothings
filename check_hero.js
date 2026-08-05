import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);
async function run() {
  const result = await client.query("content:get", { key: "home_hero" });
  console.log(JSON.stringify(result, null, 2));
}
run();
