import { NodeIO } from '@gltf-transform/core';
import fs from 'fs';

async function colorize() {
  const io = new NodeIO();
  const document = await io.read('public/assets/mannequin.glb');
  
  // Create a beautiful rich dark brown material
  const material = document.createMaterial('DarkSkin')
    .setBaseColorFactor([0.15, 0.08, 0.05, 1.0])
    .setRoughnessFactor(0.8)
    .setMetallicFactor(0.1);

  // Apply to all meshes
  const root = document.getRoot();
  for (const mesh of root.listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      prim.setMaterial(material);
    }
  }

  // Save the file
  await io.write('public/assets/mannequin.glb', document);
  console.log('Successfully colored the mannequin!');
}

colorize().catch(console.error);
