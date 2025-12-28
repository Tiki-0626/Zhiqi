
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '../constants';
import { MorphState } from '../types';

const NEEDLE_COUNT = 4000;
const BALL_COUNT = 60;
const BOX_COUNT = 15;

// Helper to get random point in cone (tree shape)
const getTreePoint = (height: number, maxRadius: number) => {
  const h = Math.random() * height;
  const radius = (1 - h / height) * maxRadius;
  const angle = Math.random() * Math.PI * 2;
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    h,
    Math.sin(angle) * radius
  );
};

const NeedleLayer = ({ morphProgress }: { morphProgress: React.MutableRefObject<number> }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  
  const data = useMemo(() => {
    const scatterPositions = new Float32Array(NEEDLE_COUNT * 3);
    const treePositions = new Float32Array(NEEDLE_COUNT * 3);
    const weights = new Float32Array(NEEDLE_COUNT);

    for (let i = 0; i < NEEDLE_COUNT; i++) {
      // Scatter positions: large cloud
      scatterPositions[i * 3] = (Math.random() - 0.5) * 15;
      scatterPositions[i * 3 + 1] = (Math.random() - 0.5) * 15 + 5;
      scatterPositions[i * 3 + 2] = (Math.random() - 0.5) * 15;

      // Tree positions: conical distribution
      const tp = getTreePoint(5, 2.2);
      treePositions[i * 3] = tp.x;
      treePositions[i * 3 + 1] = tp.y;
      treePositions[i * 3 + 2] = tp.z;

      // Weight for jitter/movement speed
      weights[i] = 0.5 + Math.random();
    }
    return { scatterPositions, treePositions, weights };
  }, []);

  const tempPos = new THREE.Vector3();
  const scatterVec = new THREE.Vector3();
  const treeVec = new THREE.Vector3();

  useFrame((state) => {
    const attr = pointsRef.current.geometry.attributes.position;
    const p = morphProgress.current;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < NEEDLE_COUNT; i++) {
      scatterVec.set(data.scatterPositions[i * 3], data.scatterPositions[i * 3 + 1], data.scatterPositions[i * 3 + 2]);
      treeVec.set(data.treePositions[i * 3], data.treePositions[i * 3 + 1], data.treePositions[i * 3 + 2]);

      // Lerp position
      tempPos.lerpVectors(scatterVec, treeVec, p);

      // Add jitter/breathing when in tree shape
      if (p > 0.1) {
        const jitter = Math.sin(time * 2 + data.weights[i] * 10) * 0.02 * p;
        tempPos.x += jitter;
        tempPos.y += jitter;
      }

      attr.setXYZ(i, tempPos.x, tempPos.y, tempPos.z);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={NEEDLE_COUNT} array={new Float32Array(NEEDLE_COUNT * 3)} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={COLORS.EMERALD_PRIMARY}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
};

const InstancedOrnaments = ({ 
  count, 
  geometry, 
  color, 
  weightMultiplier, 
  isBox,
  morphProgress 
}: { 
  count: number, 
  geometry: THREE.BufferGeometry, 
  color: string, 
  weightMultiplier: number,
  isBox?: boolean,
  morphProgress: React.MutableRefObject<number> 
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  
  const data = useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      const scatterPos = new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12 + 5,
        (Math.random() - 0.5) * 12
      );
      const treePos = getTreePoint(4.5, isBox ? 1.8 : 2.0);
      const weight = (0.2 + Math.random() * 0.8) * weightMultiplier;
      items.push({ scatterPos, treePos, weight, scatterRot: new THREE.Euler(Math.random()*Math.PI, Math.random()*Math.PI, 0) });
    }
    return items;
  }, [count, weightMultiplier, isBox]);

  const mat = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const rot = new THREE.Euler();
  const scale = new THREE.Vector3();

  useFrame((state) => {
    const p = morphProgress.current;
    const time = state.clock.elapsedTime;
    
    data.forEach((item, i) => {
      // Weight influences how fast this specific item reaches the target
      // Heavier items (lower multiplier) lag slightly
      const individualP = Math.min(1, Math.max(0, p * item.weight * 1.5));
      
      pos.lerpVectors(item.scatterPos, item.treePos, individualP);
      
      // Rotation logic
      rot.x = THREE.MathUtils.lerp(item.scatterRot.x, 0, individualP);
      rot.y = THREE.MathUtils.lerp(item.scatterRot.y, time * 0.5, individualP);
      rot.z = THREE.MathUtils.lerp(item.scatterRot.z, 0, individualP);

      const sBase = isBox ? 0.25 : 0.12;
      const s = THREE.MathUtils.lerp(0.01, sBase, individualP);
      scale.set(s, s, s);

      mat.compose(pos, new THREE.Quaternion().setFromEuler(rot), scale);
      meshRef.current.setMatrixAt(i, mat);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]} castShadow>
      <meshStandardMaterial 
        color={color} 
        metalness={0.9} 
        roughness={0.1} 
        emissive={color}
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
};

const ChristmasTree = ({ state }: { state: MorphState }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const morphProgress = useRef(0);

  const ballGeo = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []);
  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  useFrame((_, delta) => {
    const target = state === 'ASSEMBLED' ? 1 : 0;
    morphProgress.current = THREE.MathUtils.lerp(morphProgress.current, target, delta * 2.0);
    
    if (groupRef.current && state === 'ASSEMBLED') {
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Foliage Layer (Particles) */}
      <NeedleLayer morphProgress={morphProgress} />

      {/* 2. Ornament System (Instanced) */}
      <InstancedOrnaments 
        count={BALL_COUNT} 
        geometry={ballGeo} 
        color={COLORS.GOLD_METALLIC} 
        weightMultiplier={1.2} 
        morphProgress={morphProgress} 
      />
      <InstancedOrnaments 
        count={BOX_COUNT} 
        geometry={boxGeo} 
        color={COLORS.GOLD_ROSE} 
        weightMultiplier={0.6} 
        isBox={true} 
        morphProgress={morphProgress} 
      />

      {/* 3. Extra Light Points (Stars/Glow) */}
      <InstancedOrnaments 
        count={30} 
        geometry={ballGeo} 
        color={COLORS.GOLD_BRIGHT} 
        weightMultiplier={2.0} 
        morphProgress={morphProgress} 
      />

      {/* Tree Topper */}
      <Float speed={4} rotationIntensity={1.5}>
        <Topper morphProgress={morphProgress} />
      </Float>

      <Sparkles 
        count={state === 'ASSEMBLED' ? 80 : 20} 
        scale={6} 
        size={4} 
        speed={0.3} 
        color={COLORS.GOLD_BRIGHT} 
      />
    </group>
  );
};

const Topper = ({ morphProgress }: { morphProgress: React.MutableRefObject<number> }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const scatterPos = useMemo(() => new THREE.Vector3(0, 10, 0), []);
  const treePos = new THREE.Vector3(0, 5.2, 0);

  useFrame(() => {
    const p = morphProgress.current;
    meshRef.current.position.lerpVectors(scatterPos, treePos, p);
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(0.01, 1, p));
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial 
        color={COLORS.GOLD_BRIGHT} 
        emissive={COLORS.GOLD_BRIGHT} 
        emissiveIntensity={4}
        metalness={1}
      />
      <pointLight color={COLORS.GOLD_BRIGHT} intensity={8} distance={12} />
    </mesh>
  );
};

export default ChristmasTree;
