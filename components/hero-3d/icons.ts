"use client";

import { BufferGeometry, CatmullRomCurve3, SphereGeometry, TubeGeometry, Vector3 } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { HeroStageKind } from "./stages";

/*
 * Icon outlines copied from lucide-react's icon nodes (ISC licence, node_modules/lucide-react).
 * Inlined so nothing is fetched at runtime (CSP). 24×24 viewBox, 2px round strokes.
 */
const ICON_SVG: Record<HeroStageKind | "check" | "retry", string> = {
  // "zap"
  trigger:
    '<path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"/>',
  // "database"
  enrich:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  // "sparkles"
  ai: '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>',
  // "user-check"
  human:
    '<path d="m16 11 2 2 4-4"/><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
  // "send"
  action:
    '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
  // "check"
  check: '<path d="M20 6 9 17l-5-5"/>',
  // "undo-2"
  retry: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>',
};

export type IconName = keyof typeof ICON_SVG;

/**
 * Builds a solid, raised icon lying in the XZ plane (top of a tile), centred on the origin,
 * `size` world units across. Each stroke becomes a round tube (round caps via spheres), so
 * the icon reads as a machined relief rather than a flat decal. Returns one merged geometry.
 */
export function buildIconGeometry(name: IconName, size: number, relief = 0.55): BufferGeometry {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${ICON_SVG[name]}</svg>`;
  const data = new SVGLoader().parse(svg);
  const scale = size / 24;
  const radius = 1 * scale; // lucide stroke-width 2
  const parts: BufferGeometry[] = [];

  for (const shapePath of data.paths) {
    for (const sub of shapePath.subPaths) {
      const pts2 = dedupe(sub.getPoints(24));
      if (pts2.length < 2) continue;
      const first = pts2[0];
      const last = pts2[pts2.length - 1];
      const closed = first.distanceTo(last) < 0.05;
      if (closed) pts2.pop();
      const pts = pts2.map((p) => new Vector3((p.x - 12) * scale, 0, (p.y - 12) * scale));
      const curve = new CatmullRomCurve3(pts, closed, "centripetal");
      const segments = Math.min(160, Math.max(12, Math.round(curve.getLength() / (radius * 0.6))));
      parts.push(new TubeGeometry(curve, segments, radius, 10, closed));
      if (!closed) {
        for (const end of [pts[0], pts[pts.length - 1]]) {
          const cap = new SphereGeometry(radius, 12, 8);
          cap.translate(end.x, end.y, end.z);
          parts.push(cap);
        }
      }
    }
  }

  const merged = mergeGeometries(parts, false) ?? new BufferGeometry();
  for (const g of parts) g.dispose();
  // flatten the tubes into a low relief and sit them on y = 0
  merged.scale(1, relief, 1);
  merged.translate(0, radius * relief, 0); // (scale() transforms normals correctly)
  return merged;
}

function dedupe<T extends { distanceTo(o: T): number }>(pts: T[]): T[] {
  const out: T[] = [];
  for (const p of pts) if (!out.length || out[out.length - 1].distanceTo(p) > 1e-3) out.push(p);
  return out;
}
