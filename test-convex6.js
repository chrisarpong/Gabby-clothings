import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

async function test() {
  try {
    const res = await client.query("appointments:getUpcoming");
    console.log("Appointments:", res);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
