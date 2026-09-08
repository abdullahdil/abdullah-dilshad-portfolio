# Workflows catalog audit (private)

Not for site UI. Mapping notes from n8n inventory → portfolio listings.

## Counts

| Metric | Value |
| --- | --- |
| Workflows returned from n8n (`n8n_list_workflows`, 2 pages) | **156** |
| Public listings after dedupe / consolidation | **59** |
| Groups | **9** |

## Grouping rationale

Inventory clustered into business systems rather than one-row-per-n8n-workflow:

1. **Lead Generation & Outreach** — production outbound stack (discovery → qualify → send → follow-up → reply → ops), plus audit / WhatsApp / local prospecting variants.
2. **Revenue Ops & Employer Outreach** — job ingest/publish and employer list → sync → email/queue systems (client brand names stripped).
3. **Hiring & Talent Screening** — job creator, apply/screen, scoring engine, HR portal (config-only workflow folded in, not listed separately).
4. **Content & Social Publishing** — calendar → design → approve → prepare → publish → report pattern, plus content intake/publisher and blog/audio pipelines. Near-identical multi-client social clones collapsed into shared listings with a single “production variants” note where accurate.
5. **Lead Magnets & Nurture** — capture, tracking, sequences, digests.
6. **Research & Analyst Deliverables** — large analyst system condensed from many internal sub-workflows into four outcome-facing surfaces.
7. **Operations & Internal Process** — PM summaries, error handling, reliability checks, asset bootstrap.
8. **Education Content Systems** — document ingest → question generation → coverage.
9. **Teaching & Training Demos** — class/lesson packs kept as portfolio teaching proof, not client delivery.

## Dedupes (many n8n workflows → one listing)

- Outbound stack archived/FINAL/UPDATED clones → single active-path listings (discovery, qualification, outreach, follow-up, reply, dashboard).
- Parallel social publishing suites for different brands (same WF1–WF6 pattern) → one listing per stage; scheduled publishing notes multi-account variants.
- Analyst system (~20 tagged/internal WFs: entity, research, normalize, analyze, assemble, approval, proposal, deliver, error audit, financial/ratio/benchmark modules, APIs, portal) → four public listings.
- Hiring CONFIG + CORE + numbered stages → four public surfaces (CONFIG not listed alone).
- Education question-generation stages (ingest / generate / civics / coverage / PoCs) → four listings.
- HTTP lessons + related class HTTP CALL workflows → one “HTTP & API Fundamentals Class Pack”.
- Employer outreach sheet sync + email variants → consolidated employer sync / list filler / queue / scaffolding listings.
- Publishing reliability / Meta permission / retry / live-test WFs → one “Publishing Reliability Checks” listing.
- Lead-magnet sheet setup + capture → capture listing (+ asset bootstrap in Ops where setup-only).

## Skipped (and why)

| Reason | Examples (source names kept private) |
| --- | --- |
| Empty / stub / untitled drafts | `My workflow`, `My workflow 4–12`, empty WhatsApp trigger, 0–1 node stubs, `My Sub-workflow` |
| One-off TEMP / Cursor / verification / sheet-tab bootstrap | TEMP sheet updates, Cursor Mongo/sheet tests, TEMP list tabs / column bootstrap, one-time zip-region map, one-time queue seed, TEMP fill business assets |
| Exact retired duplicates of active systems | Older FINAL/COMPLETE/PM UPDATED outreach clones, retired lead review form, archived numbered 01–06 pipeline when superseded |
| Internal-only config with no standalone business story | Hiring CONFIG (edit-first), model-check TEMP |
| Unclear / non-portfolio mega draft | `Summed-up` (archived), `my buil`, generic `Social Media Publishing - Intake Approval Publish` (1 node) |
| Personal names in title without distinct product value beyond already-listed PM summary | Farhan sheet update TEMP (ops covered by daily PM summary) |

## Client / brand scrubbing

Public titles and summaries omit: EvoloAI / Evolo, AiMark / Ai Mark Labs, CTE, Little Sicily, OLMDC, TalkEarlyEd, Aerstack, HireScreen, DFA, Uplift, DMV product labels, and personal names (e.g. designer/PM names in source titles). Private `sourceName` mapping is intentionally not exported in `workflows.ts` to avoid leaking brands into the app bundle; this audit file is the mapping reference only.

## Files

- Public data: `lib/content/workflows.ts`
- This audit: `lib/content/workflows.audit.md`
