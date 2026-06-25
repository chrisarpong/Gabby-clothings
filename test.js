const fs = require('fs');
const model = fs.readFileSync('public/assets/mannequin.glb');
console.log("File loaded, size: ", model.length);
