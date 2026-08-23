# UI Redesign: ljieyao.com "Editorial Precision" pass

## Context

Personal developer portfolio (JY Liu, Malaysia-based full-stack web & mobile engineer; audience = recruiters + clients). Current state: grayscale zinc template, uniform section slabs, zero accent color, prod Lighthouse 99/100/100/100 (fd0d562). User request: "enhance/optimize UI UX… make it more appealing".

Dials: DESIGN_VARIANCE 7 · MOTION_INTENSITY 5 · VISUAL_DENSITY 3 (portfolio/developer, overhaul).

## Findings driving changes

1. Four home sections are identical slabs (`border-t` + `max-w-5xl px-6 py-16` + `h2 text-2xl`) — no rhythm or scale contrast.
2. Experience = 13 equal-weight cells in 3-col grid; no chronology signal; dates microscopic.
3. Works cards: box-in-box borders, inner padding, stack pills noise; 7/8 covers are identical dotted monograms → looks unfinished.
4. Zero accent color anywhere; logos forced grayscale.
5. Homepage has NO semantic `<h1>` (hero headline is `<p>`).
6. `Reveal` gates content at opacity-0 until JS hydration → blank sections for no-JS users.
7. Hero CTA label duplicates nav pill label ("Let's Talk") with divergent intents (WhatsApp vs /contact).

## Changes

1. **Type scale**: section headers → `text-3xl sm:text-4xl tracking-tighter`; hero stays 6xl-class; alternate section paddings py-20/py-28.
2. **Accent lock**: emerald scale ONLY — light mode `#059669` (emerald-600), dark mode `#34d399` (emerald-400) — used ONLY for nav active indicator, timeline node dots, inline link hover, hero eyebrow dot, CTA hover ring. Never large surfaces/body text.
3. **Experience**: vertical left-rail timeline (hairline + emerald node per job), role/company/dates stacked, dates right-aligned mono column desktop / inline mobile. All 13 jobs kept.
4. **Works cards**: borderless full-bleed cover tiles; title row + arrow glyph; summary line-clamp-2; stack pills → mono text line "Next.js · React · Koa.js"; monogram fallback → deterministic duotone gradient field hashed from slug (zinc-hue-shifted).
5. **Works home layout**: featured project spans 2 cols; remaining 2 smaller (asymmetric bento).
6. **CTA band**: page-closing inverted panel (zinc-100 light / zinc-900 dark full-width block).
7. **h1 fix**: hero headline becomes semantic `<h1>`.
8. **No-JS robustness**: all motion-gated content visible without JS (JS-applied hidden class pattern).
9. **CTA intent cleanup**: nav pill → "Contact" (/contact); hero primary keeps WhatsApp-direct with distinct label ("WhatsApp me").
10. **Radius rule**: buttons pill-full, cards rounded-2xl (16px), inputs rounded-xl (12px), documented and consistent.
11. **Unchanged**: Geist fonts, zinc base, prefers-color-scheme dark mode, hero-rise entrance, motion/react Reveal system (extended not replaced), static export, all copy except #9 labels.

## Contract (hard constraints)

- Static `output:'export'`; deps limited to installed set (next 16.3.1, tailwind v4, motion/react).
- Lighthouse ≥95 all categories post-deploy (current perf 99, LCP 2.02s); LCP element remains hero text; no hero image planned.
- `prefers-reduced-motion` fully disables new animation; global kill-switch stays.
- WCAG AA both modes incl. emerald accents on zinc-950 and on white.
- No-JS users see ALL content.
- Every multi-col layout collapses <768px single column.
- Implementation lands uncommitted; diff shown; push only on explicit user go (push = prod deploy via CI).

## Verification gate (executable scenarios)

Chrome binary: `/home/ljieyao/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome` (`--headless=new --no-sandbox`). Serve `out/` via `python3 -m http.server 4173` from repo root after `pnpm build`.

| # | Change | Tool & steps | Expected |
|---|--------|--------------|----------|
| V1 | h1 fix | `curl -s http://localhost:4173/ \| /bin/grep -c '<h1'` + inspect tag content | Exactly one `<h1>` containing "JY Liu" on `/` |
| V2 | No-JS visibility | Chrome CLI: `<chrome> --headless=new --no-sandbox --blink-settings=scriptEnabled=false --window-size=1440x5400 --virtual-time-budget=10000 --screenshot=/tmp/opencode/nojs-home.png http://localhost:4173/`; PLUS rendered-content assertions: `/bin/grep -h '^company:' content/experience/*.mdx \| /bin/sed 's/company:[[:space:]]*//; s/^"\(.*\)"$/\1/; s/^'\''\(.*\)'\''$/\1/' \| while IFS= read -r c; do /bin/grep -qiF "$c" out/index.html \|\| echo "MISSING: $c"; done` (strips optional YAML quotes; empty output = all 13 present) | Screenshot shows ALL sections rendered with JS disabled; zero MISSING lines |
| V3 | Reduced motion | Two Chrome CLI runs with `--force-prefers-reduced-motion`: `--virtual-time-budget=500` and `=10000`, same window; `md5sum` both PNGs | Identical hashes ⇒ no animation progress difference; motion fully disabled under reduce |
| V4 | Accent contrast (WCAG 1.4.11) | `python3 scripts/check-accent-contrast.py` (script committed at that path; pairs: `#059669`/`#ffffff` and `#34d399`/`#0a0a0a`, threshold 3.0, exit≠0 on fail) | Exit code 0; both printed ratios ≥3.0:1 |
| V5 | Timeline collapse | Chrome CLI screenshot `/` at 390×4400 | Single column; dates inline under role; rail visible left |
| V6 | Works bento (HOME layout per Change #5) | Chrome CLI screenshot `/` at 1440×5400 + `/bin/grep -o 'col-span-2' out/index.html` count | Featured first card spans 2 columns on home works section (`col-span-2` present exactly once); /works grid unchanged-uniform is acceptable |
| V7 | Perf budget | `npx lighthouse http://localhost:4173/ --throttling-method=devtools --chrome-flags="--headless=new"` then same vs `https://ljieyao-com.pages.dev/` after deploy | All categories ≥95 both runs; LCP element still hero h1 text |
| V8 | CTA intents | `curl -s` built HTML for `/`: grep nav pill label, hero primary label | Nav="Contact"(→/contact); hero primary distinct WhatsApp label; zero duplicate intent labels page-wide |
| V9 | Theme parity | Driver script exists at `/tmp/opencode/parity/parity.mjs` (launches cached chromium via explicit executablePath, `colorScheme` context per mode, fullPage screenshots of `/`,`/works`,`/contact`). Setup: `cd /tmp/opencode/parity && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i --no-save playwright@1.55.0`. Run: `node /tmp/opencode/parity/parity.mjs http://localhost:4173`. Inspect 6 PNGs | Hierarchy holds both modes; inverted CTA panel correct per mode; no pure #000/#fff backgrounds |
| V10 | Radius consistency | Class inventory grep over changed files | buttons=`rounded-full`, cards=`rounded-2xl`, inputs=`rounded-xl` only |

Dependency note: V9 tooling lives in /tmp/opencode (ephemeral, outside repo); zero additions to package.json; contract intact.

Plus: `pnpm build` exit 0 · `lsp_diagnostics` clean on every changed file · diff summary shown to user before any commit/push.
