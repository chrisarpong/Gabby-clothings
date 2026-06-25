const fs = require('fs');

async function run() {
  try {
    // Dynamic import for gltf-pipeline or just edit the JSON chunk
    const buffer = fs.readFileSync('public/assets/mannequin.glb');
    
    // A quick hacky way to find and replace the material color if it's in the JSON chunk
    // But better to just install a glTF library to do it cleanly.
  } catch (e) {
    console.error(e);
  }
}
run();
