/**
 * Shared Open Graph card for ImageResponse routes (Satori: flexbox only, no
 * grid, inline styles). Uses the bundled default font — no external fetches,
 * which the production CSP and offline builds both require.
 */
import { siteConfig } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const INK = "#141416";
const PAPER = "#fbfbfa";
const MUTED = "#a1a1aa";
const ACCENT = "#10b981";

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

export function OgCard({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  const heading = truncate(title, 90);
  const titleSize = heading.length > 60 ? 56 : 68;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: INK,
        color: PAPER,
        padding: "72px 80px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: ACCENT }} />
        <div
          style={{
            fontSize: 26,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          {truncate(eyebrow, 60)}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: titleSize, fontWeight: 700, lineHeight: 1.1 }}>
          {heading}
        </div>
        {subtitle ? (
          <div style={{ fontSize: 28, lineHeight: 1.4, color: MUTED }}>
            {truncate(subtitle, 160)}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #2b2b30",
          paddingTop: 28,
          fontSize: 26,
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontWeight: 700 }}>{siteConfig.name}</span>
          <span style={{ color: MUTED }}>{`· ${siteConfig.role}`}</span>
        </div>
        <div style={{ width: 120, height: 6, borderRadius: 3, background: ACCENT }} />
      </div>
    </div>
  );
}
