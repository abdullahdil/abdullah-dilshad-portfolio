"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import {
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  CubicBezierCurve3,
  MathUtils,
  RepeatWrapping,
  Vector3,
  type BufferGeometry,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from "three";
import type { HeroStage, HeroStageKind } from "./stages";
import type { SiteTheme } from "./environment-hooks";
import { ACCENT, INDICATOR_OFF, createStatusLight, type MachineMaterials } from "./materials";
import { buildIconGeometry } from "./icons";

// ---------- layout (world units; the graph lies on the XZ "canvas" plane) ----------

const SPACING = 2.05; // tile centre-to-centre
const TILE = 1.15; // tile footprint
const TILE_H = 0.3; // tile thickness
const FLOAT = 0.32; // tiles hover above the floor
const TILE_Y = FLOAT + TILE_H / 2; // tile centre height
const TILE_TOP = FLOAT + TILE_H;
const STAGGER_Z = [0.18, -0.28, 0.22, -0.24, 0.16]; // gentle zig-zag → n8n-style S-curves
const EDGE_R = 0.034;
const PORT_GAP = 0.035;
const RIDE = 0.11; // business objects ride this far above an edge

const HUMAN = 3; // index of the approval node
const RETRY_EDGE = 4; // edges 0..3 are the main path; 4 is approval → enrichment
const RETRY_EVERY = 5; // ~1 in 5 items is sent back for another pass

const TRAVEL = 1.25; // seconds per main edge
const TRAVEL_RETRY = 1.9;
const DWELL = 0.35;
const DWELL_APPROVAL = 0.95;
const POP = 0.35; // spawn / despawn scale time
// intro (wall-clock seconds, ≤ 1.6s total)
const REVEAL_STEP = 0.18; // between tiles popping in
const REVEAL_POP = 0.35;
const REVEAL_RETRY = 0.95; // retry edge starts drawing
const REVEAL_GLYPH = 1.15;
const REVEAL_END = 1.5;
const SLOW_FRAME = 0.12; // a frame slower than this during the intro → skip to the end

const BASE_YAW = -0.12;
const CAMERA_ELEV = MathUtils.degToRad(32);
const FILL_X = 0.88; // ~6% margins each side
const FILL_Y = 0.8;
const PARALLAX = MathUtils.degToRad(6);

const tileX = (i: number) => (i - 2) * SPACING;
const portOut = (i: number) => new Vector3(tileX(i) + TILE / 2 + PORT_GAP, TILE_Y, STAGGER_Z[i]);
const portIn = (i: number) => new Vector3(tileX(i) - TILE / 2 - PORT_GAP, TILE_Y, STAGGER_Z[i]);
const portBack = (i: number) => new Vector3(tileX(i), TILE_Y, STAGGER_Z[i] - TILE / 2 - PORT_GAP);

type Edge = { from: number; to: number; curve: CubicBezierCurve3; route: CatmullRomCurve3; travel: number };

function buildEdges(): Edge[] {
  const up = new Vector3(0, RIDE, 0);
  const top = (i: number) => new Vector3(tileX(i), TILE_TOP + 0.03, STAGGER_Z[i]);
  const mk = (from: number, to: number, curve: CubicBezierCurve3, a: Vector3, b: Vector3, travel: number): Edge => {
    const mid = [0.2, 0.4, 0.6, 0.8].map((t) => curve.getPoint(t).add(up));
    return {
      from,
      to,
      curve,
      travel,
      route: new CatmullRomCurve3([top(from), a.clone().add(up), ...mid, b.clone().add(up), top(to)], false, "centripetal"),
    };
  };
  const edges: Edge[] = [];
  for (let i = 0; i < 4; i++) {
    const a = portOut(i);
    const b = portIn(i + 1);
    const handle = (b.x - a.x) * 0.45;
    const curve = new CubicBezierCurve3(a, a.clone().add(new Vector3(handle, 0, 0)), b.clone().add(new Vector3(-handle, 0, 0)), b);
    edges.push(mk(i, i + 1, curve, a, b, TRAVEL));
  }
  // retry: out of the approval tile's back, arcing behind the graph, into enrichment's back
  const a = portBack(HUMAN);
  const b = portBack(1);
  const retry = new CubicBezierCurve3(
    a,
    a.clone().add(new Vector3(0, 0.3, -1.05)),
    b.clone().add(new Vector3(0, 0.3, -1.05)),
    b,
  );
  edges.push(mk(HUMAN, 1, retry, a, b, TRAVEL_RETRY));
  return edges;
}

type Item = {
  phase: "wait" | "spawn" | "dwell" | "travel" | "despawn";
  node: number;
  edge: number;
  t: number;
  timer: number;
  approved: boolean;
  retried: boolean;
};

type Sim = {
  items: Item[];
  pulse: number[];
  reveal: number;
  routed: number;
  active: number;
  lastArrived: number;
  badge: number[];
  introStart: number;
  fit: { v: Vector3; target: Vector3; dist: number; points: Vector3[]; world: Vector3[] };
  labelX: number[];
};

type MachineProps = {
  steps: readonly HeroStage[];
  mats: MachineMaterials;
  theme: SiteTheme;
  animate: boolean;
  /** True while on-screen and the tab is visible: the intro starts the first time this is true. */
  playing: boolean;
  /** Skip the intro (very low frame rate). */
  skipIntro: boolean;
  capsuleCount: number;
  lowTier: boolean;
  /** Legend items (owned by the wrapper); the node an item last reached gets data-active. */
  legendEls: RefObject<(HTMLElement | null)[]>;
  pointer: RefObject<{ x: number; y: number }>;
};

export function Machine({
  steps,
  mats,
  theme,
  animate,
  playing,
  skipIntro,
  capsuleCount,
  lowTier,
  legendEls,
  pointer,
}: MachineProps) {
  const edges = useMemo(() => buildEdges(), []);
  const rig = useRef<Group>(null);
  const tiles = useRef<(Group | null)[]>([]);
  const edgeMeshes = useRef<(Mesh | null)[]>([]);
  const items = useRef<(Group | null)[]>([]);
  const badges = useRef<(Group | null)[]>([]);
  const retryGlyph = useRef<Group>(null);
  const lightMeshes = useRef<(Mesh | null)[]>([]);
  const sim = useRef<Sim | null>(null);

  const lights = useMemo(() => [0, 1, 2, 3, 4].map(() => createStatusLight(theme)), [theme]);
  useEffect(() => () => lights.forEach((m) => m.dispose()), [lights]);
  const accent = useMemo(() => new Color(ACCENT[theme]), [theme]);
  const lightOff = useMemo(() => new Color(INDICATOR_OFF[theme]), [theme]);

  const icons = useMemo(() => {
    const kinds: HeroStageKind[] = ["trigger", "enrich", "ai", "human", "action"];
    return {
      tiles: Object.fromEntries(kinds.map((k) => [k, buildIconGeometry(k, 0.66)])) as Record<HeroStageKind, BufferGeometry>,
      check: buildIconGeometry("check", 0.11, 0.6),
      retry: buildIconGeometry("retry", 0.4),
    };
  }, []);
  useEffect(
    () => () => {
      Object.values(icons.tiles).forEach((g) => g.dispose());
      icons.check.dispose();
      icons.retry.dispose();
    },
    [icons],
  );

  const gridTexture = useDotGridTexture();

  useFrame((state, rawDelta) => {
    // time-based pacing: real elapsed time, only clamped against tab-switch sized jumps
    const dt = Math.min(rawDelta, 0.25);
    if (!sim.current || sim.current.items.length !== capsuleCount) {
      sim.current = createSim(capsuleCount, animate);
    }
    const s = sim.current;
    const fit = s.fit;

    // --- intro: tiles pop in, edges draw left → right (once) ---
    if (animate && playing) {
      const now = performance.now();
      if (s.introStart < 0) s.introStart = now;
      s.reveal = Math.min((now - s.introStart) / 1000, REVEAL_END);
      if (s.reveal < REVEAL_END && (skipIntro || (s.reveal > 0.05 && rawDelta > SLOW_FRAME))) {
        s.reveal = REVEAL_END;
        s.introStart = now - REVEAL_END * 1000;
      }
    }
    const rt = animate ? s.reveal : REVEAL_END;

    for (let i = 0; i < tiles.current.length; i++) {
      const g = tiles.current[i];
      if (!g) continue;
      const k = MathUtils.clamp((rt - i * REVEAL_STEP) / REVEAL_POP, 0, 1);
      g.scale.setScalar(Math.max(easeOutBack(k), 0.001));
      g.visible = k > 0;
      s.pulse[i] = MathUtils.damp(s.pulse[i], 0, 3.2, dt);
      g.position.y = TILE_Y + s.pulse[i] * 0.07;
      const light = lightMeshes.current[i]?.material as MeshStandardMaterial | undefined;
      if (light) {
        light.color.copy(lightOff).lerp(accent, Math.min(1, s.pulse[i] * 1.4));
        light.emissiveIntensity = s.pulse[i] * 0.8;
      }
    }
    for (let e = 0; e < edgeMeshes.current.length; e++) {
      const mesh = edgeMeshes.current[e];
      if (!mesh) continue;
      const start = e === RETRY_EDGE ? REVEAL_RETRY : 0.1 + (e + 1) * REVEAL_STEP;
      const k = MathUtils.clamp((rt - start) / REVEAL_POP, 0, 1);
      const count = mesh.geometry.index?.count ?? 0;
      mesh.geometry.setDrawRange(0, Math.floor((count * k) / 6) * 6);
      mesh.visible = k > 0;
    }
    if (retryGlyph.current) {
      const k = MathUtils.clamp((rt - REVEAL_GLYPH) / 0.3, 0, 1);
      retryGlyph.current.scale.setScalar(Math.max(easeOutBack(k), 0.001));
    }

    // --- business objects flowing through the graph ---
    const live = rt >= REVEAL_END - 0.2;
    for (let i = 0; i < s.items.length; i++) {
      const it = s.items[i];
      const g = items.current[i];
      if (animate && playing && live) stepItem(it, s, Math.min(dt, 0.1), edges);
      if (!g) continue;
      placeItem(g, it, edges);
      s.badge[i] = animate ? MathUtils.damp(s.badge[i], it.approved ? 1 : 0, 10, dt) : it.approved ? 1 : 0;
      const b = badges.current[i];
      if (b) {
        b.scale.setScalar(Math.max(easeOutBack(s.badge[i]), 0.001));
        b.visible = s.badge[i] > 0.01;
      }
    }

    // --- legend: highlight the node an item most recently reached ---
    const want = animate ? s.lastArrived : HUMAN;
    if (want >= 0 && want !== s.active) {
      s.active = want;
      legendEls.current?.forEach((el, i) => el?.setAttribute("data-active", i === want ? "true" : "false"));
    }

    // --- camera: fit the projected bounds of the actual geometry, centred ---
    const cam = state.camera as typeof state.camera & { fov: number; aspect: number };
    if (fit.points.length === 0) {
      fit.points = graphBoundsPoints(edges);
      fit.world = fit.points.map(() => new Vector3());
    }
    const cosY = Math.cos(BASE_YAW);
    const sinY = Math.sin(BASE_YAW);
    for (let k = 0; k < fit.points.length; k++) {
      const p = fit.points[k];
      fit.world[k].set(p.x * cosY + p.z * sinY, p.y, -p.x * sinY + p.z * cosY);
    }
    const vTan = Math.tan(MathUtils.degToRad(cam.fov / 2));
    for (let iter = 0; iter < 6; iter++) {
      cam.position.set(fit.target.x, fit.target.y + Math.sin(CAMERA_ELEV) * fit.dist, fit.target.z + Math.cos(CAMERA_ELEV) * fit.dist);
      cam.lookAt(fit.target);
      cam.updateMatrixWorld();
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;
      for (const w of fit.world) {
        fit.v.copy(w).project(cam);
        minX = Math.min(minX, fit.v.x);
        maxX = Math.max(maxX, fit.v.x);
        minY = Math.min(minY, fit.v.y);
        maxY = Math.max(maxY, fit.v.y);
      }
      // shift the aim so the projected bounds are centred, then scale distance to the fill target
      const halfH = fit.dist * vTan;
      fit.target.x += ((maxX + minX) / 2) * halfH * cam.aspect;
      fit.target.y += ((maxY + minY) / 2) * halfH * Math.cos(CAMERA_ELEV);
      fit.target.z -= ((maxY + minY) / 2) * halfH * Math.sin(CAMERA_ELEV);
      fit.dist = MathUtils.clamp(fit.dist * Math.max((maxX - minX) / 2 / FILL_X, (maxY - minY) / 2 / FILL_Y), 3, 60);
    }

    // --- cursor parallax (±6°), damped ---
    if (rig.current) {
      const p = pointer.current ?? { x: 0, y: 0 };
      const ry = animate ? PARALLAX * p.x : 0;
      const rx = animate ? PARALLAX * 0.5 * p.y : 0;
      rig.current.rotation.y = MathUtils.damp(rig.current.rotation.y, BASE_YAW + ry, 3, dt);
      rig.current.rotation.x = MathUtils.damp(rig.current.rotation.x, rx, 3, dt);
      rig.current.updateMatrixWorld();
    }

    // --- legend: put each label under its tile's projected screen x ---
    const els = legendEls.current;
    if (els && rig.current) {
      const width = state.size.width;
      for (let i = 0; i < 5; i++) {
        const el = els[i];
        if (!el) continue;
        fit.v.set(tileX(i), TILE_Y, STAGGER_Z[i] + TILE / 2).applyMatrix4(rig.current.matrixWorld).project(cam);
        const px = Math.round((fit.v.x * 0.5 + 0.5) * width);
        if (Math.abs(px - s.labelX[i]) >= 1) {
          s.labelX[i] = px;
          el.style.setProperty("left", `${px}px`);
        }
      }
    }
  });

  const retryMid = edges[RETRY_EDGE].curve.getPoint(0.5);
  const itemList = Array.from({ length: capsuleCount }, (_, i) => i);

  return (
    <group ref={rig} rotation={[0, BASE_YAW, 0]}>
      {/* canvas floor: faint dot grid fading out at the edges */}
      <mesh position={[0, 0.001, -0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11.5, 4.4]} />
        <meshBasicMaterial
          map={gridTexture}
          color={mats.grid}
          transparent
          depthWrite={false}
          opacity={theme === "dark" ? 0.22 : 0.3}
          toneMapped={false}
        />
      </mesh>

      {/* nodes */}
      {steps.map((step, i) => (
        <group
          key={step.id}
          ref={(el) => {
            tiles.current[i] = el;
          }}
          position={[tileX(i), TILE_Y, STAGGER_Z[i]]}
        >
          <RoundedBox args={[TILE, TILE_H, TILE]} radius={0.12} smoothness={lowTier ? 3 : 5} material={mats.tile} />
          {step.kind === "ai" ? (
            // emerald anodised band marks the AI step
            <RoundedBox
              args={[TILE + 0.02, 0.05, TILE + 0.02]}
              radius={0.025}
              smoothness={3}
              position={[0, -TILE_H / 2 + 0.07, 0]}
              material={mats.accentMetal}
            />
          ) : null}
          <mesh geometry={icons.tiles[step.kind]} position={[0, TILE_H / 2, 0.02]} material={mats.icon} />
          {/* status light, front-right corner */}
          <mesh
            ref={(el) => {
              lightMeshes.current[i] = el;
            }}
            position={[TILE / 2 - 0.16, TILE_H / 2 + 0.004, TILE / 2 - 0.16]}
            material={lights[i]}
          >
            <cylinderGeometry args={[0.035, 0.035, 0.012, 20]} />
          </mesh>
          {/* connector ports */}
          {i > 0 ? <Port position={[-TILE / 2 - PORT_GAP / 2, 0, 0]} mats={mats} /> : null}
          {i < 4 ? <Port position={[TILE / 2 + PORT_GAP / 2, 0, 0]} mats={mats} /> : null}
          {i === HUMAN || i === 1 ? <Port position={[0, 0, -TILE / 2 - PORT_GAP / 2]} mats={mats} /> : null}
        </group>
      ))}

      {/* connections */}
      {edges.map((edge, e) => (
        <mesh
          key={`edge-${e}`}
          ref={(el) => {
            edgeMeshes.current[e] = el;
          }}
          material={mats.edge}
        >
          <tubeGeometry args={[edge.curve, e === RETRY_EDGE ? 72 : 48, e === RETRY_EDGE ? EDGE_R * 0.85 : EDGE_R, 12, false]} />
        </mesh>
      ))}

      {/* retry glyph on the loop-back edge, tilted toward the camera */}
      <group ref={retryGlyph} position={[retryMid.x, retryMid.y + 0.34, retryMid.z - 0.05]}>
        <mesh geometry={icons.retry} rotation={[0.95, 0, 0]} material={mats.icon} />
      </group>

      {/* business objects: lead cards and envelopes */}
      {itemList.map((i) => (
        <group
          key={`item-${i}`}
          ref={(el) => {
            items.current[i] = el;
          }}
        >
          <group scale={1.45}>
            {i % 2 === 0 ? <LeadCard mats={mats} /> : <Envelope mats={mats} />}
            <group
              ref={(el) => {
                badges.current[i] = el;
              }}
              position={[0.15, 0.04, -0.1]}
            >
              <mesh material={mats.badge}>
                <cylinderGeometry args={[0.075, 0.075, 0.03, 24]} />
              </mesh>
              <mesh geometry={icons.check} position={[0, 0.015, 0.005]} material={mats.badgeMark} />
            </group>
          </group>
        </group>
      ))}

      <ContactShadows
        position={[0, 0.002, -0.4]}
        scale={[11.5, 4.4]}
        resolution={lowTier ? 256 : 512}
        blur={2.4}
        far={1.4}
        opacity={theme === "dark" ? 0.85 : 0.5}
        color={theme === "dark" ? "#000000" : "#1d2026"}
        frames={animate ? Infinity : 1}
      />
    </group>
  );
}

/** Points that bound the visible graph: tile boxes (+ a little shadow), retry arc + glyph. */
function graphBoundsPoints(edges: Edge[]): Vector3[] {
  const pts: Vector3[] = [];
  const h = TILE / 2 + 0.06;
  for (let i = 0; i < 5; i++) {
    for (const dx of [-h, h])
      for (const dz of [-h, h]) {
        pts.push(new Vector3(tileX(i) + dx, TILE_TOP + 0.05, STAGGER_Z[i] + dz));
        pts.push(new Vector3(tileX(i) + dx * 1.1, 0, STAGGER_Z[i] + dz * 1.1)); // contact shadow
      }
  }
  const retry = edges[RETRY_EDGE].curve;
  for (let k = 0; k <= 10; k++) pts.push(retry.getPoint(k / 10).add(new Vector3(0, EDGE_R, 0)));
  const mid = retry.getPoint(0.5);
  pts.push(new Vector3(mid.x, mid.y + 0.34 + 0.25, mid.z));
  return pts;
}

// ---------- simulation ----------

function createSim(count: number, animate: boolean): Sim {
  const base: Omit<Sim, "items"> = {
    pulse: [0, 0, 0, 0, 0],
    reveal: 0,
    routed: 0,
    active: -1,
    lastArrived: -1,
    badge: Array.from({ length: count }, () => 0),
    introStart: -1,
    fit: { v: new Vector3(), target: new Vector3(0, 0.5, -0.3), dist: 14, points: [], world: [] },
    labelX: [-1, -1, -1, -1, -1],
  };
  if (!animate) {
    // composed still: one item per stretch of the graph, one on the retry loop
    const parked: Item[] = [
      { phase: "travel", node: 0, edge: 0, t: 0.5, timer: 0, approved: false, retried: false },
      { phase: "travel", node: 3, edge: 3, t: 0.5, timer: 0, approved: true, retried: false },
      { phase: "travel", node: 3, edge: RETRY_EDGE, t: 0.55, timer: 0, approved: false, retried: true },
      { phase: "travel", node: 2, edge: 2, t: 0.45, timer: 0, approved: false, retried: false },
      { phase: "travel", node: 1, edge: 1, t: 0.55, timer: 0, approved: false, retried: false },
      { phase: "dwell", node: 4, edge: -1, t: 0, timer: 0, approved: true, retried: false },
    ];
    return { ...base, items: parked.slice(0, count) };
  }
  const interval = count >= 5 ? 1.6 : 2.6;
  const items: Item[] = Array.from({ length: count }, (_, i) => ({
    phase: "wait",
    node: 0,
    edge: -1,
    t: 0,
    timer: i * interval,
    approved: false,
    retried: false,
  }));
  return { ...base, items };
}

function arrive(it: Item, s: Sim, node: number) {
  it.phase = "dwell";
  it.node = node;
  it.edge = -1;
  it.timer = node === HUMAN ? DWELL_APPROVAL : DWELL;
  s.lastArrived = node;
  if (node !== HUMAN) s.pulse[node] = 1;
}

function stepItem(it: Item, s: Sim, dt: number, edges: Edge[]) {
  switch (it.phase) {
    case "wait":
      it.timer -= dt;
      if (it.timer <= 0) {
        it.phase = "spawn";
        it.t = 0;
        it.node = 0;
        it.approved = false;
        it.retried = false;
      }
      return;
    case "spawn":
      it.t += dt / POP;
      if (it.t >= 1) arrive(it, s, 0);
      return;
    case "dwell":
      it.timer -= dt;
      if (it.timer > 0) return;
      if (it.node === 4) {
        it.phase = "despawn";
        it.t = 0;
        return;
      }
      if (it.node === HUMAN) {
        s.routed += 1;
        if (!it.retried && s.routed % RETRY_EVERY === 0) {
          it.edge = RETRY_EDGE;
          it.retried = true;
        } else {
          it.edge = 3;
          it.approved = true;
          s.pulse[HUMAN] = 1; // approval moment
        }
      } else {
        it.edge = it.node;
      }
      it.phase = "travel";
      it.t = 0;
      return;
    case "travel": {
      const edge = edges[it.edge];
      it.t += dt / edge.travel;
      if (it.t >= 1) arrive(it, s, edge.to);
      return;
    }
    case "despawn":
      it.t += dt / POP;
      if (it.t >= 1) {
        it.phase = "wait";
        it.timer = 0.4;
        it.approved = false;
      }
      return;
  }
}

const tmp = new Vector3();
const tan = new Vector3();

function placeItem(g: Group, it: Item, edges: Edge[]) {
  if (it.phase === "wait") {
    g.visible = false;
    return;
  }
  g.visible = true;
  if (it.phase === "travel") {
    const edge = edges[it.edge];
    const u = easeInOut(it.t);
    edge.route.getPoint(u, tmp);
    edge.route.getTangent(u, tan);
    g.position.copy(tmp);
    if (Math.abs(tan.x) + Math.abs(tan.z) > 1e-3) g.rotation.y = Math.atan2(-tan.z, tan.x);
    g.scale.setScalar(1);
    return;
  }
  // resting on a node
  g.position.set(tileX(it.node), TILE_TOP + 0.03 + 0.02, STAGGER_Z[it.node]);
  g.rotation.y = 0;
  const k = it.phase === "spawn" ? easeOutBack(it.t) : it.phase === "despawn" ? 1 - easeInOut(it.t) : 1;
  g.scale.setScalar(Math.max(k, 0.001));
}

function easeInOut(t: number) {
  const x = MathUtils.clamp(t, 0, 1);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOutBack(t: number) {
  const x = MathUtils.clamp(t, 0, 1);
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

// ---------- parts ----------

function Port({ position, mats }: { position: [number, number, number]; mats: MachineMaterials }) {
  return (
    <mesh position={position} material={mats.trim}>
      <sphereGeometry args={[0.06, 20, 14]} />
    </mesh>
  );
}

/** A lead / document card: rounded slab with two text-line grooves. */
function LeadCard({ mats }: { mats: MachineMaterials }) {
  return (
    <group>
      <RoundedBox args={[0.36, 0.036, 0.26]} radius={0.014} smoothness={2} material={mats.paper} />
      <mesh position={[-0.03, 0.019, -0.05]} material={mats.ink}>
        <boxGeometry args={[0.22, 0.006, 0.026]} />
      </mesh>
      <mesh position={[-0.075, 0.019, 0.02]} material={mats.ink}>
        <boxGeometry args={[0.13, 0.006, 0.026]} />
      </mesh>
      <mesh position={[0.11, 0.019, 0.07]} material={mats.ink}>
        <cylinderGeometry args={[0.03, 0.03, 0.006, 16]} />
      </mesh>
    </group>
  );
}

/** An envelope: slab with a folded-flap "V". */
function Envelope({ mats }: { mats: MachineMaterials }) {
  return (
    <group>
      <RoundedBox args={[0.36, 0.036, 0.26]} radius={0.014} smoothness={2} material={mats.paper} />
      <mesh position={[-0.085, 0.019, -0.055]} rotation={[0, -0.62, 0]} material={mats.ink}>
        <boxGeometry args={[0.21, 0.006, 0.018]} />
      </mesh>
      <mesh position={[0.085, 0.019, -0.055]} rotation={[0, 0.62, 0]} material={mats.ink}>
        <boxGeometry args={[0.21, 0.006, 0.018]} />
      </mesh>
    </group>
  );
}

/** Dot-grid alpha texture with an elliptical fade, drawn once (no network). */
function useDotGridTexture(): CanvasTexture {
  const texture = useMemo(() => {
    const w = 1024;
    const h = 512;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const step = 26;
      for (let y = step / 2; y < h; y += step) {
        for (let x = step / 2; x < w; x += step) {
          const dx = (x - w / 2) / (w / 2);
          const dy = (y - h / 2) / (h / 2);
          const fade = Math.max(0, 1 - Math.pow(dx * dx + dy * dy, 1.1));
          if (fade <= 0.01) continue;
          ctx.fillStyle = `rgba(255,255,255,${fade.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    const tex = new CanvasTexture(canvas);
    tex.wrapS = RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

