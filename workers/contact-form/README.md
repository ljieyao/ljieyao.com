# contact-form Worker

Receives `POST /api/contact` from [ljieyao.com](https://ljieyao.com), validates the
payload with Zod, verifies the Cloudflare Turnstile token (when configured), and
forwards the message via the Resend API.

## Local dev

```bash
npx wrangler dev
curl -X POST http://localhost:8787/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","subject":"Hi","budget":"RM 5-10K","comment":"Hello there, testing."}'
```

Without `RESEND_API_KEY` the worker returns `500 server misconfigured` (no email is
sent). Without `TURNSTILE_SECRET`, Turnstile verification is skipped (logged as a
warning) so the form can be exercised locally.

## Secrets

```bash
wrangler secret put RESEND_API_KEY     # https://resend.com/api-keys
wrangler secret put TURNSTILE_SECRET   # Cloudflare dashboard → Turnstile → your widget
```

`TURNSTILE_SECRET` is optional: when unset, verification is skipped (local dev).
When set, the token is required and verified against
`https://challenges.cloudflare.com/turnstile/v0/siteverify` (fail-closed, 10s
timeout, action must be `contact`, hostname must be allowlisted).

## Vars (optional)

Add under `[vars]` in `wrangler.toml` (or keep the code defaults):

| Var | Default | Notes |
| --- | --- | --- |
| `TURNSTILE_HOSTNAMES` | — | Required when `TURNSTILE_SECRET` is set, e.g. `ljieyao.com,ljieyao-com.pages.dev` |
| `CONTACT_TO_EMAIL` | `ljieyao0210@gmail.com` | Recipient |
| `CONTACT_FROM_EMAIL` | `onboarding@resend.dev` | Works without domain verification; switch to `noreply@ljieyao.com` once the domain is verified in Resend |

## Deploy

```bash
npx wrangler deploy
```

## Frontend wiring

The site is statically exported to Cloudflare Pages, so the form posts directly to
this Worker. Set these env vars for the Next.js build (Pages → Settings →
Environment variables, or `.env` locally):

| Var | Notes |
| --- | --- |
| `NEXT_PUBLIC_CONTACT_WORKER_URL` | e.g. `https://contact-form.<subdomain>.workers.dev/api/contact` |
| `NEXT_PUBLIC_TURNSTILE_SITEKEY` | Public Turnstile sitekey. When unset, the widget is not rendered and the form still works (relies on the Worker skipping verification without `TURNSTILE_SECRET`). |

The Turnstile widget uses `data-action="contact"` — the Worker rejects tokens
issued for any other action.
