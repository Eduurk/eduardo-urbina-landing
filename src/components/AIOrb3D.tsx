"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, OrbitControls, Sphere, Trail } from "@react-three/drei";
import * as THREE from "three";

const NEON = "#00FFB2";

function Core() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.15;
    meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.15;
  });

  return (
    <Sphere ref={meshRef} args={[1.1, 64, 64]}>
      <MeshDistortMaterial
        color={NEON}
        emissive={NEON}
        emissiveIntensity={0.4}
        roughness={0.15}
        metalness={0.3}
        distort={0.45}
        speed={1.8}
        transparent
        opacity={0.85}
      />
    </Sphere>
  );
}

function OrbitParticle({
  radius,
  speed,
  offset,
  tilt,
  size,
}: {
  radius: number;
  speed: number;
  offset: number;
  tilt: number;
  size: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed + offset;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.z = Math.sin(t) * radius;
    ref.current.position.y = Math.sin(t * 1.3) * radius * tilt;
  });

  return (
    <Trail width={1.5} length={4} color={NEON} attenuation={(t) => t * t}>
      <mesh ref={ref}>
        <sphereGeometry args={[size, 12, 12]} />
        <meshBasicMaterial color={NEON} toneMapped={false} />
      </mesh>
    </Trail>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 3]} intensity={2} color={NEON} />
      <pointLight position={[-3, -2, -3]} intensity={0.8} color="#ffffff" />

      <Core />

      <OrbitParticle radius={2.1} speed={0.6} offset={0} tilt={0.6} size={0.05} />
      <OrbitParticle radius={1.7} speed={-0.9} offset={2} tilt={0.3} size={0.04} />
      <OrbitParticle radius={2.5} speed={0.4} offset={4} tilt={0.8} size={0.035} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.6}
      />
    </>
  );
}

export default function AIOrb3D() {
  return (
    <div className="w-[320px] h-[320px] mx-auto">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}