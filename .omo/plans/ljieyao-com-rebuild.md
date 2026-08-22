# ljieyao.com Rebuild — Initial Plan

## Goal
Replace the WordPress portfolio at `https://ljieyao.com/` with a Next.js + MDX + Cloudflare Pages stack that lowers content-update friction via a Git-as-CMS workflow and an AI draft assistant. Brand integrity preserved by keeping AI as draft-only, never auto-publish.

## Decisions (locked)
| Concern | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript strict | Latest stable; SSG/ISR; MDX native |
| Content | MDX in `content/*.mdx` (Git-as-CMS) | No DB; AI-readable; free hosting |
| Schema | Zod frontmatter schemas, validated at build | Catch malformed content early |
| Build mode | `output: 'export'` (static) | Aligns with CF Pages; forces SSG for all routes |
| Hosting | Cloudflare Pages | Free tier; global edge; GH auto-deploy |
| Contact form | Posts to a separate CF Worker endpoint | Static export has no API routes; form handler stays decoupled |
| Editor UI | None initially | Friction is typing, not UI; add TinaCMS only if missed after 30 days |
| AI role | Draft assistant only — drafts land in `content/drafts/`, human promotes | Brand protection |
| LinkedIn cross-post | Cloudflare Worker + GitHub webhook | Decoupled; explicit opt-out via frontmatter |
| Chatbot | Deferred | Traffic doesn't justify it yet |

## Repository layout
```
~/Repositories/Personal/ljieyao.com/
├── app/
│   ├── page.tsx                      # Home (hero, experience timeline, stack, services)
│   ├── works/page.tsx                # Portfolio index
│   ├── portfolio/[slug]/page.tsx     # Case study detail
│   ├── blog/page.tsx                 # Blog index
│   ├── blog/[slug]/page.tsx          # Post detail
│   ├── contact/page.tsx              # Form + FAQ (replace placeholder!)
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── opengraph-image.tsx           # Dynamic OG per route
│   └── sitemap.ts                    # Generated from content/
├── content/                          # Git-as-CMS
│   ├── experience/*.mdx              # ~12 work history entries
│   ├── portfolio/*.mdx               # ~9 case studies
│   ├── posts/*.mdx                   # Published blog
│   ├── drafts/*.mdx                  # AI output awaiting review
│   └── pages/*.mdx                   # Static pages (about, etc.)
├── lib/
│   ├── content.ts                    # MDX loader + Zod schemas
│   ├── seo.ts                        # Metadata helpers
│   └── linkedin.ts                   # Excerpt formatter
├── scripts/
│   ├── new-post.ts                   # pnpm new-post → scaffold MDX template
│   ├── ai-draft.ts                   # pnpm ai-draft --from <file> → MDX draft
│   ├── publish-post.ts               # drafts/ → posts/ + git commit
│   ├── migrate-wp.ts                 # One-shot WP → MDX importer
│   └── sign-webhook.ts               # Helper: prints valid HMAC signature for test payloads
├── workers/
│   └── linkedin-poster/              # CF Worker: GH webhook → LinkedIn API
│       ├── src/index.ts
│       ├── wrangler.toml
│       └── test-payload.json         # Committed fixture for QA
├── public/                           # Static assets (fonts, favicon)
├── migration/                        # NOT committed in full; url-mapping.csv IS committed
│   ├── wp-export.xml                 # gitignored — WP export dump
│   ├── url-inventory.txt             # gitignored — raw URL list from crawl
│   └── url-mapping.csv               # COMMITTED — old_url,new_route,redirect_type
├── .github/workflows/
│   ├── deploy.yml                    # Push → CF Pages build
│   └── content-changed.yml           # Trigger LinkedIn Worker on posts/
├── wrangler.toml
├── next.config.mjs
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Content schemas (Zod)
```ts
// lib/content.ts
export const ExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  start: z.string(),              // YYYY-MM
  end: z.string().nullable(),     // null = "Now"
  logo: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  order: z.number(),              // display order
});

export const PortfolioSchema = z.object({
  title: z.string(),
  slug: z.string(),
  summary: z.string().min(40).max(200),
  stack: z.array(z.string()),
  role: z.string(),
  publishedAt: z.string().datetime(),
  coverImage: z.string().optional(),
  draft: z.boolean().default(false),
  linkedin: z.boolean().default(false),
});

export const PostSchema = z.object({
  title: z.string(),
  date: z.string().datetime(),
  category: z.enum(['feeling-check-in', 'trend', 'technical', 'project']),
  tags: z.array(z.string()).default([]),
  summary: z.string().min(40).max(200),
  draft: z.boolean().default(false),
  linkedin: z.boolean().default(false),
});
```

## Phased execution

### Phase 1 — Skeleton (Day 1)
- Init repo at `~/Repositories/Personal/ljieyao.com`
- `pnpm create next-app@latest` with TS + Tailwind + App Router (latest stable, currently 16.3.x) — **all deps at latest stable** (React 19, Tailwind 4, Zod 4, etc.; run `pnpm update` + `pnpm audit` before locking)
- Set up Cloudflare Pages project (`wrangler pages project create ljieyao-com`)
- Wire `.github/workflows/deploy.yml` for auto-deploy
- **Deploy to production URL `ljieyao-com.pages.dev`. DNS stays on current WP host (`ljieyao.com`) until Phase 5 — Pages serves the *.pages.dev address regardless of custom domain.**

### Phase 1.5 — WP source acquisition (BEFORE Phase 2)
- **Access assumption**: JY has admin access to `ljieyao.com/wp-admin`. Need application password or WP REST API credentials.
- Export WP XML: WP Admin → Tools → Export → All content → save as `migration/wp-export.xml` (gitignored)
- Crawl all live URLs into **relative paths only** (no scheme/host):
  ```bash
  wget --spider -r https://ljieyao.com/ 2>&1 \
    | grep -oP 'https?://ljieyao.com/\S+' \
    | sed 's|https\?://ljieyao.com||' \
    | sort -u > migration/url-inventory.txt
  ```
- Build `migration/url-mapping.csv` (committed) with columns: `old_path,new_path,redirect_type`. old_path and new_path are both RELATIVE (start with `/`). Source of truth for Phase 2 redirects.

### Phase 2 — Content migration (Day 2)
- Run `scripts/migrate-wp.ts` reading `migration/wp-export.xml`, output MDX files to `content/`
- Migrate: 12 experience entries, 6–9 portfolio entries, 3 existing blog posts
- Generate `public/_redirects` from `migration/url-mapping.csv` (Cloudflare Pages format; `next.config.mjs` redirects don't work with `output: 'export'`)
- Submit new sitemap to Google Search Console via Search Console API or manual upload

### Phase 3 — AI workflow (Day 3)
- Implement `pnpm new-post` (scaffolds MDX from template)
- Implement `pnpm ai-draft` (reads raw notes, calls MiniMax M3 via `MINIMAX_API_KEY`, writes to `content/drafts/`; script reads provider/model from env so swap to Anthropic/OpenAI later is one-line config)
- Implement `pnpm publish-post` (validates frontmatter, moves draft → posts/, commits)
- Dry-run with a real rough note → review → publish cycle

### Phase 4 — LinkedIn cross-post (Day 4)
- Build `workers/linkedin-poster` (CF Worker)
- Worker receives GH webhook on `posts/*.mdx` change
- Worker formats excerpt, posts via LinkedIn API (auth via OAuth refresh token in CF secret)
- Add `linkedin: true` opt-in to frontmatter
- Test: publish post → LinkedIn share within 60s

### Phase 5 — Polish (Week 2)
- Replace placeholder FAQ on `/contact` (currently 5× "What does a product designer need to know?")
- Fix footer CTA — currently points to `hamidevs.com/wp/bentofolio/contact/`
- Dynamic OG images per route
- RSS feed at `/feed.xml`
- Lighthouse 95+ across the board

## Open questions (all resolved)
| # | Question                          | Decision                                                                                          |
| - | --------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1 | Image hosting (blocks Phase 2)    | **A. Commit all to `public/`** — small repos, MDX stays portable, no upload workflow             |
| 2 | AI provider (blocks Phase 3)      | **MiniMax M3 token plan** — use `MINIMAX_API_KEY` env var; `scripts/ai-draft.ts` designed provider-agnostic so swap is one-line config |
| 3 | Domain cutover (blocks Phase 5)   | **A. 24h soak, then flip DNS** — verify redirects on `ljieyao-com.pages.dev` for 24h, then change A record |
| 4 | Analytics (blocks Phase 5)        | **A. Defer analytics** — ship without; re-evaluate OpenPanel (self-host CF Workers + D1) after 30 days based on actual conversion questions |
| 5 | TinaCMS overlay (post-launch)     | **A. Defer entirely** — VS Code + GitHub web editor is sufficient for the lazy-update flow |

**Nothing blocks Phase 1.** All blockers resolved or deferred until their respective phase.

## Out of scope (explicit)
- WordPress MCP server (no WordPress, no need)
- LLM chatbot for visitors (deferred)
- Auto-generated blog posts (brand risk)
- Sanity / Contentful / Payload / Strapi (overkill)

## Verification gates (concrete, executable)
| Phase | Gate | Command / Action | Expected Result |
|---|---|---|---|
| 1 | Build succeeds (static export) | `pnpm build` | Exit code 0, no warnings, `./out/` populated |
| 1 | Production deploy works | `wrangler pages deploy ./out --project-name=ljieyao-com --branch=production` | URL `https://ljieyao-com.pages.dev` returns 200 with hero HTML |
| 1 | DNS unchanged | `dig +short ljieyao.com A` | Returns old WP host IP, NOT CF Pages IP |
| 1.5 | WP export valid | `xmllint --noout migration/wp-export.xml` | Valid XML |
| 1.5 | URL inventory complete | `wc -l migration/url-inventory.txt` | Count matches expected (~25–35 URLs) |
| 2 | `_redirects` file generated | `test -f public/_redirects && wc -l public/_redirects` | File exists with one rule per inventory row |
| 2 | Every old URL redirects (Pages prod URL) | `while read path; do curl -sI "https://ljieyao-com.pages.dev$path" \| head -1; done < migration/url-inventory.txt` | All return `301` or `308` |
| 2 | Redirect target valid (Pages prod URL) | `curl -sI "https://ljieyao-com.pages.dev/the-reality-of-layoffs-in-corporate-culture-a-personal-reflection/" \| grep -i location` | New `/blog/the-reality-of-layoffs-...` path |
| 2 | Redirects work on production (post-cutover, Phase 5 only) | `while read path; do curl -sI "https://ljieyao.com$path" \| head -1; done < migration/url-inventory.txt` | All return `301` or `308` |
| 2 | Sitemap generated | `curl -s https://ljieyao-com.pages.dev/sitemap.xml \| grep -c '<url>'` | ≥20 entries |
| 2 | Content builds | `pnpm build` | All migrated MDX passes Zod validation |
| 3 | AI-draft produces valid MDX | `pnpm ai-draft --from ./test-note.md` | `content/drafts/test-note.mdx` exists, frontmatter valid per `PostSchema` |
| 3 | Publish cycle works | `pnpm publish-post test-note` then `pnpm build` | File moves to `content/posts/`, builds without errors |
| 4 | Worker URL discoverable | `wrangler deployments list --name linkedin-poster` (from `workers/linkedin-poster/`) | Returns worker URL like `https://linkedin-poster.<account>.workers.dev` |
| 4 | Webhook signature helper exists | `node --import tsx scripts/sign-webhook.ts workers/linkedin-poster/test-payload.json` | Prints valid `x-hub-signature-256` header value |
| 4 | Worker accepts signed payload | `curl -X POST "$(wrangler deployments list --name linkedin-poster --format json \| jq -r '.[0].url')/webhook" -H "x-hub-signature-256: $(node --import tsx scripts/sign-webhook.ts workers/linkedin-poster/test-payload.json)" -H "content-type: application/json" -d @workers/linkedin-poster/test-payload.json` | Returns 200 |
| 4 | LinkedIn share appears | Manual check on LinkedIn profile within 60s of webhook trigger | Share visible with post title + summary |
| 4 | Opt-out respected | Publish post with `linkedin: false`, trigger same webhook with updated payload | Worker returns 200, does NOT call LinkedIn API (verify via Worker logs: `wrangler tail linkedin-poster`) |
| 5 | Lighthouse score | `pnpm dlx @lhci/cli@0.13.x autorun --collect.url=https://ljieyao-com.pages.dev --collect.settings.chromeFlags="--no-sandbox --headless" --assert.assertions.categories:performance=95 --assert.assertions.categories:accessibility=95 --assert.assertions.categories:best-practices=95 --assert.assertions.categories:seo=95` | All four categories ≥95 |
| 5 | FAQ fixed | Manual: visit `/contact`, expand accordions | Real content, not placeholder text |
| 5 | Footer CTA fixed | `curl -s https://ljieyao-com.pages.dev/ \| grep -o 'href="[^"]*contact[^"]*"' \| sort -u` | All matches point to `/contact`, not `hamidevs.com` |
| 5 | DNS cutover | `dig +short ljieyao.com A` | Returns CF Pages IP |

## Success criteria
- Posting frequency: at least 2 posts/month within 90 days (currently <1/quarter)
- Lighthouse: 95+ on all categories
- Update friction: a new portfolio entry takes <10 minutes (rough note → published)
- Brand integrity: zero AI-slop signals in published content (human review gate enforced)