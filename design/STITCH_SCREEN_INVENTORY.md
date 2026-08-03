# Stitch Screen Inventory

Source: revised Google Stitch multi-document HTML (kinetic orange redesign), applied before Phase 5.

## Active design system (current)

| Token | Value |
|-------|-------|
| Background / surface | `#131313` |
| Primary | `#ff8c37` (vivid orange; light peach `#ffb689` retired) |
| Primary container | `#ff8c37` |
| On primary | `#512300` |
| On surface | `#e5e2e1` |
| On surface variant | `#ddc1b2` |
| Outline | `#a48c7e` |
| Outline variant | `#564337` |
| Surface container | `#201f1f` |
| Surface lowest | `#0e0e0e` |
| Radius default | `1rem` (pills for CTAs) |
| Container max | `1280px` |
| Fonts | Geist (display/labels), Inter (body) |

Previous green palette (`#0e1511` / `#56e0a7`) is retired.

## Screens in latest export

| # | Screen | Purpose | Route mapping |
|---|--------|---------|---------------|
| 1 | Admin Dashboard – Project Focused | Earlier green admin variant (reference only) | — |
| 2 | Portfolio Home – Redesign | Public homepage (kinetic orange) | `/` |
| 3 | Project Detail – Redesign | Case-study detail | `/work/[slug]` |
| 4 | Admin Command Center | Orange admin shell + dashboard | `/admin` |

Implemented visual language follows screens **2–4**. Screen 1 green tokens were not carried forward so the product stays one cohesive system.

## Content guardrails (still enforced)

Stitch copy/metrics that must **not** ship:

- Fake stats (40h+, 92%, 3.5x, 10k+ leads, etc.)
- Fake roles/employers (Fortune 500 architect, Systems Integrator 2019–2021, etc.)
- Fake email (`abdullah@dilshad.ai`)
- Unverified tools (Zapier Enterprise, Pinecone, GraphQL, Python as claimed stack)
- Stitch portrait / Googleusercontent decorative images
- Material Symbols → use Lucide only

Verified facts remain in `CONTENT_TRUTH.md`.

## Repeated UI patterns (current)

- Fixed glass top nav (public) / fixed left sidebar (admin Command Center)
- Availability pulse + pill CV CTA
- Centered hero with highlighted phrase + floating workflow visual
- Bento project portfolio grid
- Centered vertical experience timeline
- Capability cards with icon + bullet list
- Split contact panel
- Admin rounded-r-full nav, glass-panel stats, telemetry sidebar
