"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { HERO_STAGES, describeHeroStages, type HeroStage, type HeroStageKind } from "./stages";

// WebGL is client-only; ssr:false must live inside a Client Component (App Router).
const MachineScene = dynamic(() => import("./machine-scene"), { ssr: false, loading: () => null });

export type HeroMachineProps = {
  steps?: readonly HeroStage[];
  /** Classes for the outer wrapper (width / margins). The stage box is centred vertically in the wrapper. */
  className?: string;
  /** Aspect class for the stage box. The machine is ~3:1, so wide bands should use a wide aspect (e.g. `aspect-[12/5]`). */
  stageAspect?: string;
  /** Mono legend row of the five stage names under the scene; the active stage is highlighted. */
  showLegend?: boolean;
};

/**
 * Studio-rendered business-automation workflow graph: five glossy node tiles with relief
 * icons, curved n8n-style connections, lead cards and envelopes flowing through, an approval
 * step that badges work as approved, and a retry edge looping back to enrichment.
 *
 * Progressive enhancement: the placeholder and legend render on the server; the poster stays
 * if WebGL is unavailable or the scene throws. The canvas mounts after load + idle and fades in.
 */
export function HeroMachine({
  steps = HERO_STAGES,
  className = "w-full",
  stageAspect = "aspect-[16/9]",
  showLegend = true,
}: HeroMachineProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const legendEls = useRef<(HTMLElement | null)[]>([]);
  const [armed, setArmed] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const stages = useMemo(() => normaliseSteps(steps), [steps]);
  const live = ready && !failed;

  useEffect(() => {
    if (!supportsWebGL()) return;
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const arm = () => {
      if (w.requestIdleCallback) idleId = w.requestIdleCallback(() => setArmed(true), { timeout: 2500 });
      else timeoutId = window.setTimeout(() => setArmed(true), 600);
    };
    // wait for the load event so the 3D bundle never competes with LCP
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return () => {
      window.removeEventListener("load", arm);
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className={`flex h-full flex-col justify-center ${className}`} data-hero-machine={live ? "webgl" : "poster"}>
      <div ref={rootRef} className={`relative w-full ${stageAspect}`}>
        {/* studio sweep: a soft floor pool that fades into the page background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(62% 50% at 50% 58%, color-mix(in oklab, var(--on-surface) 7%, transparent), transparent 72%)",
          }}
        />
        <MachinePoster hidden={live} />
        {armed && !failed ? (
          <SceneBoundary onError={() => setFailed(true)}>
            <div
              aria-hidden="true"
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${ready ? "opacity-100" : "opacity-0"}`}
            >
              <MachineScene
                steps={stages}
                containerRef={rootRef}
                legendEls={legendEls}
                onReady={() => setReady(true)}
              />
            </div>
          </SceneBoundary>
        ) : null}
      </div>
      {showLegend ? (
        // ≥sm: each label is placed under its tile (left set in px by the render loop; the
        // inline % is the even-spaced fallback before WebGL). <sm: compact even grid.
        <ol
          aria-hidden="true"
          className="relative mx-auto mt-2 w-full list-none p-0 max-sm:grid max-sm:w-[92%] max-sm:grid-cols-5 max-sm:gap-x-2 sm:h-10"
        >
          {stages.map((stage, i) => (
            <li
              key={stage.id}
              ref={(el) => {
                legendEls.current[i] = el;
              }}
              data-active="false"
              className="group text-center font-mono text-[10px] leading-[1.35] text-balance text-[color:var(--on-surface-faint)] transition-colors duration-500 data-[active=true]:text-[color:var(--on-surface)] sm:absolute sm:top-0 sm:-translate-x-1/2 sm:whitespace-nowrap sm:text-[11px]"
              style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace", left: `${12 + i * 19}%` }}
            >
              <span className="mx-auto mb-2 block h-[5px] w-[5px] rounded-full bg-[color:var(--outline)] transition-colors duration-500 group-data-[active=true]:bg-[color:var(--accent)]" />
              {stage.label}
            </li>
          ))}
        </ol>
      ) : null}
      <p className="sr-only">{describeHeroStages(stages)}</p>
    </div>
  );
}

const KIND_ORDER: HeroStageKind[] = ["trigger", "enrich", "ai", "human", "action"];

/** Always five modules in canonical order; caller-supplied labels win per kind. */
function normaliseSteps(steps: readonly HeroStage[]): HeroStage[] {
  return KIND_ORDER.map(
    (kind) => steps.find((s) => s.kind === kind) ?? HERO_STAGES.find((s) => s.kind === kind)!,
  );
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Server-rendered stand-in: a silhouette of the workflow graph — five rounded tiles joined
 * by one connecting line on a soft floor pool. Same box as the canvas, so no layout shift.
 * TODO(poster): swap for public/images/hero-machine-poster{,-dark}.webp once captured
 * from the production build.
 */
function MachinePoster({ hidden }: { hidden: boolean }) {
  const ink = (pct: number) => `color-mix(in oklab, var(--on-surface) ${pct}%, transparent)`;
  const offsets = ["-4%", "-9%", "2%", "-6%", "6%"]; // echoes the scene's gentle zig-zag
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out ${hidden ? "opacity-0" : "opacity-100"}`}
    >
      <div className="absolute inset-x-[12%] top-1/2 h-[2px] -translate-y-1/2" style={{ background: ink(12) }} />
      <div className="absolute inset-x-[8%] inset-y-0 flex items-center justify-between">
        {offsets.map((y, i) => (
          <div
            key={i}
            className="aspect-square w-[11%] rounded-[22%]"
            style={{
              transform: `translateY(${y})`,
              background: `linear-gradient(180deg, ${ink(9)}, ${ink(5)})`,
              boxShadow: `0 10px 24px -12px ${ink(25)}, inset 0 1px 0 ${ink(4)}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
