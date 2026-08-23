# ljieyao.com — JY Liu Portfolio & Blog

Portfolio, case studies and writing for JY Liu — Solutions Architect | Technical Lead | Senior Full-Stack Engineer (Kuala Lumpur). Live at **[ljieyao.com](https://ljieyao.com)** (Cloudflare Pages `ljieyao-com.pages.dev`).

> Rebuilt from WordPress to Next.js 16 + MDX + Cloudflare Pages for Git-as-CMS editing and a Cloudflare-Worker-backed contact form.

## Stack

- **Framework:** Next.js 16 (App Router, `output: 'export'`), React 19, TypeScript strict, Turbopack
- **Styling:** Tailwind CSS 4, Geist/Sora via `next/font`, `motion` for reveal
- **Content:** MDX in `content/{experience,portfolio,posts}` validated by Zod at build (`lib/content.ts` + `gray-matter`/`marked`); AI drafts land in `content/drafts/` and are never auto-published
- **Hosting:** Cloudflare Pages (static `out/`), `wrangler pages deploy`
- **Workers:** `workers/contact-form` (Hono-like, Zod + Turnstile + Resend)
- **Quality:** ESLint 9, Biome (monorepo services), `pnpm@11.22.0`

## Getting Started

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # next build -> ./out (static export, fully prerenderable)
```

Edit content by modifying MDX:

- `content/experience/*.mdx` — timeline (sorted by `order`, rendered by `ExperienceList`)
- `content/portfolio/*.mdx` — case studies (`publishedAt` desc, featured 3 on `/`)
- `content/posts/*.mdx` — blog (`date` desc)

Frontmatter is validated — a bad field fails the build.

## Deployment

| Trigger | Result |
|---|---|
| `push` to `main` | Production — `ljieyao.com` / `ljieyao-com.pages.dev` |
| `pull_request` | Preview — unique `<hash>.ljieyao-com.pages.dev` |

Workflow: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

**GitHub — Variables vs Secrets**

| Name | Type | Where |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITEKEY` | **Variable** (`vars`) | Settings → Secrets and variables → Actions → Variables |
| `NEXT_PUBLIC_CONTACT_WORKER_URL` | **Variable** (`vars`) | — same — |
| `CLOUDFLARE_API_TOKEN` | **Secret** (`secrets`) | Pages:Edit token, https://dash.cloudflare.com/profile/api-tokens |
| `CLOUDFLARE_ACCOUNT_ID` | **Secret** (`secrets`) | Workers & Pages → Overview (sidebar) |

`NEXT_PUBLIC_*` are inlined into the static export at build time (hence `vars`). The deploy step needs the two Cloudflare secrets to `wrangler pages deploy`.

**Contact Worker secrets** (never in this repo):

```bash
# from workers/contact-form/
npx wrangler secret put RESEND_API_KEY        # Resend https://resend.com/api-keys
npx wrangler secret put TURNSTILE_SECRET      # Cloudflare Turnstile secret (optional — skips verify when unset)
# optional vars in wrangler.toml [vars]:
# TURNSTILE_HOSTNAMES, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL
```

Manual deploy:

```bash
pnpm build
pnpm exec wrangler pages deploy ./out --project-name=ljieyao-com
# needs CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID in env
```

## Repository Visibility — Is Public Safe?

**This repo is intentionally `PUBLIC` (`github.com/ljieyao/ljieyao.com`, created 2026-08-22).** That is the correct and best practice for a personal portfolio.

**Why public is safe here:**

- The site is a **static marketing + blog + case studies** — no private business logic, no customer data, no credentials. All content under `content/` (experience, portfolio, posts) is meant to be public anyway (same as ljieyao.com). Your CV phone/email are public contact info by design.
- **No secrets are committed.** Grep the history: zero `RESEND_API_KEY`, `TURNSTILE_SECRET`, `CLOUDFLARE_*` values in tree or logs. `.env*` is ignored (`.gitignore`), `wrangler.toml` only documents secret names, and the deploy workflow reads secrets from GitHub Secrets / Worker secrets — never from code.
- Only **public-facing** values are in the repo or as GitHub **Variables**: `NEXT_PUBLIC_TURNSTILE_SITEKEY` (the browser Turnstile sitekey is public by design) and `NEXT_PUBLIC_CONTACT_WORKER_URL` (just a URL). GitHub correctly separates `vars` (public) from `secrets` (masked).
- Contact-form hardening lives **server-side** in the Worker (`workers/contact-form/src/index.ts`): Zod validation, Turnstile `siteverify` fail-closed, `RESEND_API_KEY` used only server-side via `https://api.resend.com/emails`, CORS allow-list (`ljieyao.com`, `ljieyao-com.pages.dev`, `localhost:3000`), PII-safe logging — all outside the static export.

**Why public is *better* than private for this repo:**

- **Showcase** — recruiters/clients can read the actual code, not just the rendered site. Private would hide the quality signal you want to send.
- **Free GitHub features** — public gets full secret scanning + push protection, Dependabot and Pages preview URLs for PRs without extra config. Private on a free account has limits.
- **Fork/clone parity** — anyone cloning gets a working portfolio template without leaking anything sensitive; no env needed to `pnpm dev` or `pnpm build`.
- **Cloudflare Pages works with both**, but public avoids "grant deploy bot access to private repo" friction for future collaborators.

**Best-practice checklist this repo follows (keep it this way):**

- [x] `.gitignore` covers `.env*`, `.next/`, `out/`, `.wrangler/`, `.omo/run-continuation/`
- [x] `output: 'export'` + `images.unoptimized: true` — zero server secrets can be embedded at runtime
- [x] GitHub **Variables** for `NEXT_PUBLIC_*`, **Secrets** for Cloudflare tokens, **Worker secrets** via `wrangler secret put`
- [x] Push protection / secret scanning on (default for public repos — verify under Settings → Code security)
- [x] Dependabot + `pnpm audit` periodically (Next.js 16, React 19 — keep pinned via `pnpm-lock.yaml`)
- [x] No client-side leakage of `RESEND_API_KEY`/`TURNSTILE_SECRET` (only `NEXT_PUBLIC_TURNSTILE_SITEKEY` is exposed — intentionally)
- [ ] Recommended hardening: enable branch protection on `main` (require PR + status checks), keep `.omo/plans` versioned, `.omo/run-continuation` ignored (already done)

> **Rule of thumb:** if it must stay secret, it goes in a **Secret** (GitHub) or a **Worker secret** (`wrangler secret put`) — never in `content/`, `app/`, or `wrangler.toml`. If it's `NEXT_PUBLIC_*`, it is public by definition and safe to be in the build.

## Content Conventions

- Summary `40–200` chars enforced by Zod
- Dates: `YYYY-MM` for experience, ISO datetime for `publishedAt`/`date`
- Images in `public/images/{experience,portfolio}` referenced by frontmatter `logo`/`coverImage` (optional)

## License

Personal portfolio — content (writing, case studies) © JY Liu. Code is MIT-adjacent — fork for learning, but please replace personal content before publishing.

