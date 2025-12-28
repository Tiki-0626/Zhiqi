
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import { Bloom, EffectComposer, Noise, Vignette, DepthOfField } from '@react-three/postprocessing';
import ChristmasTree from './ChristmasTree';
import GoldParticles from './GoldParticles';
import { COLORS } from '../constants';
import { MorphState } from '../types';

const Experience = ({ treeState }: { treeState: MorphState }) => {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
      <PerspectiveCamera makeDefault position={[12, 6, 18]} fov={30} />
      
      <color attach="background" args={[COLORS.EMERALD_DARK]} />
      <fog attach="fog" args={[COLORS.EMERALD_DARK, 15, 35]} />
      
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <spotLight 
          position={[20, 30, 20]} 
          angle={0.15} 
          penumbra={1} 
          intensity={5} 
          castShadow 
          shadow-mapSize={1024}
          color="#fff4d0"
        />
        <pointLight position={[-15, 10, -15]} intensity={4} color={COLORS.GOLD_METALLIC} />
        <rectAreaLight 
          width={15} 
          height={15} 
          position={[0, 5, -10]} 
          rotation={[0, Math.PI, 0]} 
          intensity={12} 
          color={COLORS.EMERALD_LIGHT} 
        />

        <ChristmasTree state={treeState} />
        <GoldParticles count={treeState === 'ASSEMBLED' ? 150 : 600} />
        
        <ContactShadows 
          opacity={0.25} 
          scale={25} 
          blur={2.5} 
          far={6} 
          resolution={512} 
          color="#000000" 
        />

        <Environment preset="night" />
        
        <EffectComposer disableNormalPass multisampling={4}>
          <Bloom 
            luminanceThreshold={0.5} 
            mipmapBlur 
            intensity={2.5} 
            radius={0.4} 
          />
          <DepthOfField 
            focusDistance={0.015} 
            focalLength={0.04} 
            bokehScale={5} 
          />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.15} darkness={1.2} />
        </EffectComposer>
      </Suspense>

      <OrbitControls 
        enablePan={false} 
        minDistance={10} 
        maxDistance={30} 
        autoRotate={treeState === 'ASSEMBLED'}
        autoRotateSpeed={0.5}
        makeDefault
      />
    </Canvas>
  );
};

export default Experience;
