# ljieyao.com

Personal portfolio and blog for JY Liu — Solutions Architect | Technical Lead | Senior Full-Stack Engineer. Available at [ljieyao.com](https://ljieyao.com).

## Overview

Next.js 16 static site with MDX content and Cloudflare Pages deployment. Content is managed as MDX files under `content/` and validated at build time.

## Tech Stack

- Next.js 16 (App Router, `output: 'export'`), React 19, TypeScript
- Tailwind CSS 4, `next/font` (Geist), `motion`
- MDX content (`gray-matter` + `marked`) with Zod validation
- Cloudflare Pages + Workers (`workers/contact-form`)

## Getting Started

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # static export to ./out
```

## Content

| Directory | Description | Ordering |
|---|---|---|
| `content/experience/*.mdx` | Work experience timeline | `order` ascending |
| `content/portfolio/*.mdx` | Case studies | `publishedAt` descending (first 3 featured on home) |
| `content/posts/*.mdx` | Blog posts | `date` descending |

Frontmatter is validated by Zod — invalid fields fail the build.

## Deployment

Deployed to Cloudflare Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

| Trigger | Environment |
|---|---|
| `push` to `main` | Production — `ljieyao.com` |
| `pull_request` | Preview — `<hash>.ljieyao-com.pages.dev` |

**Environment variables**

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITEKEY` | GitHub Variables | Turnstile site key |
| `NEXT_PUBLIC_CONTACT_WORKER_URL` | GitHub Variables | Contact worker URL |
| `CLOUDFLARE_API_TOKEN` | GitHub Secrets | Cloudflare Pages:Edit token |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Secrets | Cloudflare account ID |
| `RESEND_API_KEY` | Worker secret | `wrangler secret put` in `workers/contact-form` |
| `TURNSTILE_SECRET` | Worker secret | `wrangler secret put` in `workers/contact-form` |

Manual deploy:

```bash
pnpm build
pnpm exec wrangler pages deploy ./out --project-name=ljieyao-com
```

## License

Content © JY Liu. Code available for reference — please replace personal content before reuse.
