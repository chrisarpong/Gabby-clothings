import React, { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";

type MeasurementPoint = "chest" | "waist" | "sleeve" | "inseam" | null;

interface MaleMannequin3DProps {
  activeMeasurement: MeasurementPoint;
  onHotspotClick: (point: MeasurementPoint) => void;
}

// Chocolate brown skin color
const SKIN_COLOR = 0x5c3a1e;
const SKIN_HIGHLIGHT = 0x7a4e2a;

function createMaleMannequin(scene: THREE.Scene) {
  const skinMat = new THREE.MeshStandardMaterial({
    color: SKIN_COLOR,
    roughness: 0.7,
    metalness: 0.05,
  });
  const darkSkinMat = new THREE.MeshStandardMaterial({
    color: SKIN_HIGHLIGHT,
    roughness: 0.6,
    metalness: 0.05,
  });

  const group = new THREE.Group();

  // HEAD
  const headGeo = new THREE.SphereGeometry(0.13, 24, 24);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.72, 0);
  head.scale.set(1, 1.15, 0.95);
  group.add(head);

  // NECK
  const neckGeo = new THREE.CylinderGeometry(0.055, 0.065, 0.1, 16);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.set(0, 1.58, 0);
  group.add(neck);

  // TORSO (broad chest, male proportions)
  // Upper chest
  const upperChestGeo = new THREE.CylinderGeometry(0.22, 0.2, 0.2, 16);
  const upperChest = new THREE.Mesh(upperChestGeo, skinMat);
  upperChest.position.set(0, 1.43, 0);
  upperChest.scale.set(1, 1, 0.65);
  group.add(upperChest);

  // Mid torso
  const midTorsoGeo = new THREE.CylinderGeometry(0.2, 0.17, 0.2, 16);
  const midTorso = new THREE.Mesh(midTorsoGeo, skinMat);
  midTorso.position.set(0, 1.25, 0);
  midTorso.scale.set(1, 1, 0.6);
  group.add(midTorso);

  // Lower torso / waist (narrower — V-shape)
  const waistGeo = new THREE.CylinderGeometry(0.17, 0.15, 0.15, 16);
  const waist = new THREE.Mesh(waistGeo, skinMat);
  waist.position.set(0, 1.1, 0);
  waist.scale.set(1, 1, 0.6);
  group.add(waist);

  // Hips
  const hipGeo = new THREE.CylinderGeometry(0.15, 0.16, 0.12, 16);
  const hips = new THREE.Mesh(hipGeo, skinMat);
  hips.position.set(0, 0.97, 0);
  hips.scale.set(1, 1, 0.6);
  group.add(hips);

  // SHOULDERS (rounded caps)
  const shoulderGeo = new THREE.SphereGeometry(0.07, 16, 16);
  const leftShoulder = new THREE.Mesh(shoulderGeo, skinMat);
  leftShoulder.position.set(-0.25, 1.48, 0);
  group.add(leftShoulder);

  const rightShoulder = new THREE.Mesh(shoulderGeo, skinMat);
  rightShoulder.position.set(0.25, 1.48, 0);
  group.add(rightShoulder);

  // UPPER ARMS
  const upperArmGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.3, 12);
  const leftUpperArm = new THREE.Mesh(upperArmGeo, skinMat);
  leftUpperArm.position.set(-0.28, 1.3, 0);
  leftUpperArm.rotation.z = 0.12;
  group.add(leftUpperArm);

  const rightUpperArm = new THREE.Mesh(upperArmGeo, skinMat);
  rightUpperArm.position.set(0.28, 1.3, 0);
  rightUpperArm.rotation.z = -0.12;
  group.add(rightUpperArm);

  // ELBOWS
  const elbowGeo = new THREE.SphereGeometry(0.045, 12, 12);
  const leftElbow = new THREE.Mesh(elbowGeo, darkSkinMat);
  leftElbow.position.set(-0.3, 1.15, 0);
  group.add(leftElbow);

  const rightElbow = new THREE.Mesh(elbowGeo, darkSkinMat);
  rightElbow.position.set(0.3, 1.15, 0);
  group.add(rightElbow);

  // FOREARMS
  const forearmGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.28, 12);
  const leftForearm = new THREE.Mesh(forearmGeo, skinMat);
  leftForearm.position.set(-0.32, 1.0, 0);
  leftForearm.rotation.z = 0.08;
  group.add(leftForearm);

  const rightForearm = new THREE.Mesh(forearmGeo, skinMat);
  rightForearm.position.set(0.32, 1.0, 0);
  rightForearm.rotation.z = -0.08;
  group.add(rightForearm);

  // HANDS
  const handGeo = new THREE.SphereGeometry(0.035, 12, 12);
  const leftHand = new THREE.Mesh(handGeo, darkSkinMat);
  leftHand.position.set(-0.34, 0.86, 0);
  leftHand.scale.set(0.8, 1.2, 0.5);
  group.add(leftHand);

  const rightHand = new THREE.Mesh(handGeo, darkSkinMat);
  rightHand.position.set(0.34, 0.86, 0);
  rightHand.scale.set(0.8, 1.2, 0.5);
  group.add(rightHand);

  // UPPER LEGS
  const upperLegGeo = new THREE.CylinderGeometry(0.07, 0.055, 0.4, 14);
  const leftUpperLeg = new THREE.Mesh(upperLegGeo, skinMat);
  leftUpperLeg.position.set(-0.08, 0.72, 0);
  group.add(leftUpperLeg);

  const rightUpperLeg = new THREE.Mesh(upperLegGeo, skinMat);
  rightUpperLeg.position.set(0.08, 0.72, 0);
  group.add(rightUpperLeg);

  // KNEES
  const kneeGeo = new THREE.SphereGeometry(0.05, 12, 12);
  const leftKnee = new THREE.Mesh(kneeGeo, darkSkinMat);
  leftKnee.position.set(-0.08, 0.52, 0);
  group.add(leftKnee);

  const rightKnee = new THREE.Mesh(kneeGeo, darkSkinMat);
  rightKnee.position.set(0.08, 0.52, 0);
  group.add(rightKnee);

  // LOWER LEGS
  const lowerLegGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.4, 14);
  const leftLowerLeg = new THREE.Mesh(lowerLegGeo, skinMat);
  leftLowerLeg.position.set(-0.08, 0.32, 0);
  group.add(leftLowerLeg);

  const rightLowerLeg = new THREE.Mesh(lowerLegGeo, skinMat);
  rightLowerLeg.position.set(0.08, 0.32, 0);
  group.add(rightLowerLeg);

  // FEET
  const footGeo = new THREE.BoxGeometry(0.08, 0.04, 0.15);
  const leftFoot = new THREE.Mesh(footGeo, darkSkinMat);
  leftFoot.position.set(-0.08, 0.1, 0.03);
  group.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeo.clone(), darkSkinMat);
  rightFoot.position.set(0.08, 0.1, 0.03);
  group.add(rightFoot);

  // Center the mannequin
  group.position.set(0, -0.9, 0);

  scene.add(group);
  return group;
}

export default function MaleMannequin3D({ activeMeasurement, onHotspotClick }: MaleMannequin3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mannequinRef = useRef<THREE.Group | null>(null);
  const frameRef = useRef<number>(0);
  const isDragging = useRef(false);
  const previousMouseX = useRef(0);
  const rotationY = useRef(0);
  const autoRotateSpeed = useRef(0.003);

  const initScene = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null; // Transparent
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 2.8);
    camera.lookAt(0, 0.2, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    keyLight.position.set(2, 3, 2);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc9b896, 0.4);
    fillLight.position.set(-2, 1, -1);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 2, -3);
    scene.add(rimLight);

    // Floor circle (subtle)
    const floorGeo = new THREE.CircleGeometry(0.5, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xd4c5a9,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0.3,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.82;
    scene.add(floor);

    // Create the mannequin
    const mannequin = createMaleMannequin(scene);
    mannequinRef.current = mannequin;

    // Animation loop
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      if (!isDragging.current) {
        rotationY.current += autoRotateSpeed.current;
      }
      if (mannequinRef.current) {
        mannequinRef.current.rotation.y = rotationY.current;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const cleanup = initScene();
    return cleanup;
  }, [initScene]);

  // Mouse drag rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    previousMouseX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - previousMouseX.current;
    rotationY.current += delta * 0.008;
    previousMouseX.current = e.clientX;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Hotspot label positions (screen-space overlays)
  const hotspots: { id: "chest" | "waist" | "sleeve" | "inseam"; label: string; top: string; left: string }[] = [
    { id: "chest", label: "Chest", top: "22%", left: "55%" },
    { id: "waist", label: "Waist", top: "36%", left: "55%" },
    { id: "sleeve", label: "Sleeve", top: "30%", left: "20%" },
    { id: "inseam", label: "Inseam", top: "55%", left: "55%" },
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Hotspot labels overlaid on top of the 3D canvas */}
      {hotspots.map((hs) => (
        <button
          key={hs.id}
          onClick={(e) => {
            e.stopPropagation();
            onHotspotClick(hs.id);
          }}
          className={`absolute z-10 px-3 py-1 text-xs font-bold font-sans uppercase tracking-widest rounded-sm transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 ${
            activeMeasurement === hs.id
              ? "bg-brand-gold text-brand-espresso scale-110"
              : "bg-brand-espresso text-brand-bone hover:bg-brand-gold hover:text-brand-espresso"
          }`}
          style={{ top: hs.top, left: hs.left }}
        >
          {hs.label}
        </button>
      ))}
    </div>
  );
}
