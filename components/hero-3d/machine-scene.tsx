"use client";

import { useRef, useState, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import type { HeroStage } from "./stages";
import {
  detectLowTier,
  useInView,
  usePageVisible,
  usePointer,
  useReducedMotion,
  useSiteTheme,
  type SiteTheme,
} from "./environment-hooks";
import { useMachineMaterials } from "./materials";
import { Machine } from "./machine";

export type MachineSceneProps = {
  steps: readonly HeroStage[];
  /** Element whose visibility gates the render loop. */
  containerRef: RefObject<HTMLElement | null>;
  legendEls: RefObject<(HTMLElement | null)[]>;
  onReady: () => void;
};

/**
 * WebGL scene for the hero machine. Loaded only on the client via next/dynamic
 * (see hero-machine.tsx). Transparent canvas — the section background shows through.
 */
export default function MachineScene({ steps, containerRef, legendEls, onReady }: MachineSceneProps) {
  const theme = useSiteTheme();
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const inView = useInView(containerRef);
  const pointer = usePointer();
  const [lowTier] = useState(detectLowTier);
  const [skipIntro, setSkipIntro] = useState(false);
  const [maxDpr, setMaxDpr] = useState(() =>
    Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, lowTier ? 1.5 : 2),
  );

  const animate = !reducedMotion && inView && pageVisible;

  return (
    <Canvas
      frameloop={animate ? "always" : "demand"}
      dpr={[1, maxDpr]}
      camera={{ position: [0, 3, 10], fov: 26, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMappingExposure = 1.05;
        // transmission renders the opaque scene into a buffer; it doesn't need full res
        gl.transmissionResolutionScale = lowTier ? 0.5 : 0.75;
      }}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <PerformanceMonitor
        onDecline={() => {
          setMaxDpr(1);
          setSkipIntro(true);
        }}
      />
      <Studio theme={theme} />
      <SceneBody
        steps={steps}
        theme={theme}
        lowTier={lowTier}
        animate={!reducedMotion}
        playing={animate}
        skipIntro={skipIntro}
        legendEls={legendEls}
        pointer={pointer}
      />
      <ReadySignal onReady={onReady} />
    </Canvas>
  );
}

function SceneBody({
  steps,
  theme,
  lowTier,
  animate,
  playing,
  skipIntro,
  legendEls,
  pointer,
}: {
  steps: readonly HeroStage[];
  theme: SiteTheme;
  lowTier: boolean;
  animate: boolean;
  playing: boolean;
  skipIntro: boolean;
  legendEls: RefObject<(HTMLElement | null)[]>;
  pointer: RefObject<{ x: number; y: number }>;
}) {
  const mats = useMachineMaterials(theme, lowTier);
  return (
    <Machine
      steps={steps}
      mats={mats}
      theme={theme}
      animate={animate}
      playing={playing}
      skipIntro={skipIntro}
      capsuleCount={lowTier ? 3 : 6}
      lowTier={lowTier}
      legendEls={legendEls}
      pointer={pointer}
    />
  );
}

/**
 * Studio lighting built from Lightformer softboxes rendered once into a cube map.
 * No presets / HDR files — those are fetched from a CDN and blocked by the CSP.
 */
function Studio({ theme }: { theme: SiteTheme }) {
  const dark = theme === "dark";
  return (
    <>
      <Environment key={theme} resolution={256} frames={1}>
        {/* dark studio walls so metal gets contrast; softboxes do the lighting */}
        <color attach="background" args={[dark ? "#26282d" : "#3a3d43"]} />
        {/* overhead softbox */}
        <Lightformer form="rect" intensity={dark ? 2.2 : 2.6} position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[10, 4, 1]} />
        {/* key — large, camera left, slightly front */}
        <Lightformer form="rect" intensity={dark ? 5 : 6} position={[-7, 3, 4]} rotation={[0, Math.PI / 3, 0]} scale={[4, 4, 1]} />
        {/* rim — narrow hard strip, back right: crisp edge highlights on bevels */}
        <Lightformer form="rect" intensity={dark ? 7 : 6} position={[6, 2.5, -4]} rotation={[0, -Math.PI / 1.6, 0]} scale={[0.6, 6, 1]} />
        {/* second rim, back left */}
        <Lightformer form="rect" intensity={dark ? 3 : 2.5} position={[-6, 2, -5]} rotation={[0, Math.PI / 1.4, 0]} scale={[0.5, 5, 1]} />
        {/* frontal catchlight strip for the glass and clearcoat */}
        <Lightformer form="rect" intensity={1.6} position={[0, 2.5, 9]} rotation={[0, Math.PI, 0]} scale={[9, 0.5, 1]} />
        {/* floor bounce */}
        <Lightformer form="rect" intensity={dark ? 0.3 : 0.7} position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[14, 14, 1]} />
      </Environment>
      {/* a soft directional key for form definition; shadows come from ContactShadows */}
      <directionalLight position={[-4, 7, 5]} intensity={dark ? 0.8 : 1.1} />
      <hemisphereLight args={[dark ? "#2a2e36" : "#ffffff", dark ? "#07080c" : "#d9d9d6", dark ? 0.15 : 0.3]} />
    </>
  );
}

function ReadySignal({ onReady }: { onReady: () => void }) {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    // let the first frame reach the screen before fading the canvas in
    window.setTimeout(onReady, 60);
  });
  return null;
}
