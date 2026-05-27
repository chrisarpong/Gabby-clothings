import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";

const client = new ConvexHttpClient("https://silent-albatross-823.convex.cloud");
client.query(api.products.getAll).then(res => {
  console.log("Prod DB returns:", res.length, "products");
}).catch(err => {
  console.error("Query failed:", err);
});
