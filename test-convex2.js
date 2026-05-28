import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function test() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const res = await client.query("appointments:getAvailableSlots", { date: today });
    console.log("Success:", res);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
