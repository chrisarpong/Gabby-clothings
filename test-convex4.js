import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function test() {
  try {
    const res = await client.query("settings:getByKey", { key: "availability" });
    console.log("Availability Setting:", JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
