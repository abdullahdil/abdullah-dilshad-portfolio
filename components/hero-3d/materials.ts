"use client";

import { useEffect, useMemo } from "react";
import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import type { SiteTheme } from "./environment-hooks";

export const ACCENT: Record<SiteTheme, string> = { light: "#047857", dark: "#34d399" };
/** Neutral "off" colour for status lights. */
export const INDICATOR_OFF: Record<SiteTheme, string> = { light: "#c9ccd1", dark: "#4d525b" };

export type MachineMaterials = ReturnType<typeof createMaterials>;

/**
 * Studio product-render palette for the workflow graph.
 * Light: glossy white "keycap" tiles with graphite relief icons.
 * Dark: graphite anodised tiles with brushed-aluminium icons.
 * One accent (emerald) on the AI tile band, status lights and the approval badge.
 */
function createMaterials(theme: SiteTheme, lowTier: boolean) {
  const dark = theme === "dark";

  const tile = new MeshPhysicalMaterial({
    color: dark ? "#50555e" : "#f5f5f3",
    metalness: dark ? 0.6 : 0,
    roughness: dark ? 0.36 : 0.32,
    clearcoat: lowTier ? 0.4 : 0.9,
    clearcoatRoughness: 0.14,
  });

  // icon relief on the tile tops
  const icon = new MeshPhysicalMaterial({
    color: dark ? "#d9dce1" : "#2b2f36",
    metalness: dark ? 1 : 0.35,
    roughness: dark ? 0.24 : 0.38,
    clearcoat: dark ? 0 : 0.6,
    clearcoatRoughness: 0.2,
  });

  // brushed-aluminium ports and fittings
  const trim = new MeshPhysicalMaterial({
    color: dark ? "#c4c8cf" : "#b9bec6",
    metalness: 1,
    roughness: 0.28,
  });

  // emerald anodised band (AI tile)
  const accentMetal = new MeshPhysicalMaterial({
    color: new Color(ACCENT[theme]).lerp(new Color(dark ? "#0b3b2c" : "#022c20"), dark ? 0.15 : 0.1),
    metalness: 0.85,
    roughness: 0.3,
    clearcoat: 0.7,
    clearcoatRoughness: 0.1,
  });

  // edges: matte satin tubes, like n8n connections made solid
  const edge = new MeshStandardMaterial({
    color: dark ? "#5b616b" : "#bfc4cb",
    metalness: dark ? 0.3 : 0.05,
    roughness: 0.48,
  });

  // business objects: lead cards and envelopes
  const paper = new MeshPhysicalMaterial({
    color: dark ? "#eeece6" : "#e6e9ed",
    metalness: 0,
    roughness: 0.55,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
  });
  const ink = new MeshStandardMaterial({
    color: dark ? "#7d828b" : "#555b64",
    metalness: 0,
    roughness: 0.7,
  });

  const badge = new MeshStandardMaterial({
    color: ACCENT[theme],
    emissive: ACCENT[theme],
    emissiveIntensity: dark ? 0.35 : 0.15,
    metalness: 0.2,
    roughness: 0.35,
  });
  const badgeMark = new MeshStandardMaterial({ color: "#ffffff", roughness: 0.4 });

  // floor dot grid tint
  const grid = dark ? "#ffffff" : "#141416";

  return { tile, icon, trim, accentMetal, edge, paper, ink, badge, badgeMark, grid };
}

/** Separate per-tile status-light material so each node can pulse on its own. */
export function createStatusLight(theme: SiteTheme): MeshStandardMaterial {
  return new MeshStandardMaterial({
    color: INDICATOR_OFF[theme],
    emissive: ACCENT[theme],
    emissiveIntensity: 0,
    metalness: 0.1,
    roughness: 0.3,
  });
}

export function useMachineMaterials(theme: SiteTheme, lowTier: boolean): MachineMaterials {
  const mats = useMemo(() => createMaterials(theme, lowTier), [theme, lowTier]);
  useEffect(
    () => () => {
      for (const m of Object.values(mats)) if (typeof m !== "string") m.dispose();
    },
    [mats],
  );
  return mats;
}
