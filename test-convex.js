import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL);

client.query("appointments:getAvailableSlots", { date: "2026-05-30" }).then(console.log).catch(console.error);
