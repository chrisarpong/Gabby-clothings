const fs = require('fs');

const authenticImages = [
  "/assets/3.jpg",
  "/assets/5.jpg",
  "/assets/6.jpg",
  "/assets/7.jpg",
  "/assets/agbada 2.jpeg",
  "/assets/kaftan.jpeg",
  "/assets/Royalty .jpeg",
  "/assets/3.jpg",
  "/assets/5.jpg",
  "/assets/6.jpg",
  "/assets/7.jpg",
  "/assets/agbada 2.jpeg",
  "/assets/kaftan.jpeg",
  "/assets/Royalty .jpeg",
  "/assets/3.jpg",
  "/assets/5.jpg",
  "/assets/6.jpg",
  "/assets/7.jpg",
  "/assets/agbada 2.jpeg",
  "/assets/kaftan.jpeg",
  "/assets/Royalty .jpeg"
];

let convexProducts = fs.readFileSync('convex/products.ts', 'utf8');
let matchIdx = 0;
convexProducts = convexProducts.replace(/images:\s*\["[^"]+"\]/g, () => {
  const img = authenticImages[matchIdx % authenticImages.length];
  matchIdx++;
  return `images: ["${img}"]`;
});
fs.writeFileSync('convex/products.ts', convexProducts);

let dataProducts = fs.readFileSync('src/data/products.ts', 'utf8');
matchIdx = 0;
dataProducts = dataProducts.replace(/image:\s*"[^"]+"/g, () => {
  const img = authenticImages[matchIdx % authenticImages.length];
  matchIdx++;
  return `image: "${img}"`;
});
fs.writeFileSync('src/data/products.ts', dataProducts);

console.log("Images updated successfully.");
