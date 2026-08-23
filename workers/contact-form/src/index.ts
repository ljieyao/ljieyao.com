/**
 * Contact form Worker.
 *
 * Receives POST /api/contact from ljieyao.com, validates the payload with Zod,
 * verifies the Cloudflare Turnstile token (when TURNSTILE_SECRET is configured),
 * and forwards the message via the Resend API.
 *
 * Responses:
 *   200 — message accepted and handed off to Resend
 *   400 — validation failed (Zod issues included) or malformed JSON
 *   403 — Turnstile verification failed (fail-closed)
 *   405/404 — wrong method/path
 *   500 — server misconfigured (no RESEND_API_KEY)
 *   502 — Resend API rejected the message
 *
 * Raw upstream errors are logged, never returned to the client.
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Env {
  /** Resend API key (wrangler secret). */
  RESEND_API_KEY?: string;
  /** Turnstile secret key (wrangler secret). Skips verification when unset. */
  TURNSTILE_SECRET?: string;
  /** Comma-separated hostnames accepted from Turnstile siteverify. */
  TURNSTILE_HOSTNAMES?: string;
  /** Recipient address. */
  CONTACT_TO_EMAIL?: string;
  /** Sender address (must be a verified Resend domain, or onboarding@resend.dev). */
  CONTACT_FROM_EMAIL?: string;
}

interface SiteverifyResult {
  success: boolean;
  action?: string;
  hostname?: string;
  'error-codes'?: string[];
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const BUDGET_OPTIONS = ['RM 5K', 'RM 5-10K', 'RM 10-20K', 'RM 20K+'] as const;

const ContactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(254),
  subject: z.string().trim().min(1).max(200),
  budget: z
    .union([z.enum(BUDGET_OPTIONS), z.literal('')])
    .optional()
    .transform((value) => (value === '' ? undefined : value)),
  comment: z.string().trim().min(10).max(5000),
  /** cf-turnstile-response token; required when TURNSTILE_SECRET is set. */
  turnstileToken: z.string().min(1).max(2048).optional(),
});

type ContactPayload = z.infer<typeof ContactSchema>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS = new Set([
  'https://ljieyao.com',
  'https://ljieyao-com.pages.dev',
  'http://localhost:3000',
]);

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const SITEVERIFY_TIMEOUT_MS = 10_000;
const RESEND_URL = 'https://api.resend.com/emails';
const EXPECTED_TURNSTILE_ACTION = 'contact';

const DEFAULT_TO_EMAIL = 'ljieyao0210@gmail.com';
const DEFAULT_FROM_EMAIL = 'onboarding@resend.dev';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin':
      origin !== null && ALLOWED_ORIGINS.has(origin) ? origin : 'https://ljieyao.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
}

function respond(
  request: Request,
  status: number,
  body: Record<string, unknown>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
  });
}

function log(message: string, extra?: Record<string, unknown>): void {
  console.log(JSON.stringify({ worker: 'contact-form', message, ...extra }));
}

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ENTITIES[ch] ?? ch);
}

function parseHostnames(env: Env): string[] {
  return (env.TURNSTILE_HOSTNAMES ?? '')
    .split(',')
    .map((hostname) => hostname.trim())
    .filter((hostname) => hostname.length > 0);
}

// ---------------------------------------------------------------------------
// Turnstile
// ---------------------------------------------------------------------------

async function verifyTurnstile(
  env: Env,
  token: string | undefined,
  remoteip: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const secret = env.TURNSTILE_SECRET;
  if (!secret) {
    // Graceful for local dev — verification is opt-in via the secret.
    log('TURNSTILE_SECRET not set — skipping verification');
    return { ok: true };
  }

  if (!token) {
    return { ok: false, error: 'turnstile token missing' };
  }

  const hostnames = parseHostnames(env);
  if (hostnames.length === 0) {
    log('TURNSTILE_HOSTNAMES not set while TURNSTILE_SECRET is configured');
    return { ok: false, error: 'turnstile misconfigured' };
  }

  const form = new URLSearchParams({ secret, response: token });
  if (remoteip) form.set('remoteip', remoteip);

  let result: SiteverifyResult;
  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
    });
    result = (await res.json()) as SiteverifyResult;
  } catch (error) {
    // Fail closed on network/timeout errors.
    log('turnstile siteverify request failed', { error: (error as Error).message });
    return { ok: false, error: 'turnstile verification unavailable' };
  }

  if (result.success !== true) {
    log('turnstile verification failed', { codes: result['error-codes'] ?? [] });
    return { ok: false, error: 'turnstile verification failed' };
  }
  if (result.action && result.action !== EXPECTED_TURNSTILE_ACTION) {
    log('turnstile action mismatch', { action: result.action });
    return { ok: false, error: 'turnstile action mismatch' };
  }
  if (!result.hostname || !hostnames.includes(result.hostname)) {
    log('turnstile hostname mismatch', { hostname: result.hostname ?? null });
    return { ok: false, error: 'turnstile hostname mismatch' };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Resend
// ---------------------------------------------------------------------------

function renderText(payload: ContactPayload): string {
  return [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Subject: ${payload.subject}`,
    `Budget: ${payload.budget ?? '(not specified)'}`,
    '',
    payload.comment,
  ].join('\n');
}

function renderHtml(payload: ContactPayload): string {
  const rows: Array<[string, string]> = [
    ['Name', payload.name],
    ['Email', payload.email],
    ['Subject', payload.subject],
    ['Budget', payload.budget ?? '(not specified)'],
  ];
  const table = rows
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:4px 12px 4px 0;vertical-align:top">${label}</th>` +
        `<td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
    )
    .join('');
  const comment = escapeHtml(payload.comment).replace(/\n/g, '<br>');
  return `<table cellpadding="0" cellspacing="0">${table}</table><p>${comment}</p>`;
}

async function sendEmail(
  env: Env,
  payload: ContactPayload,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    log('RESEND_API_KEY not set');
    return { ok: false, status: 500, error: 'server misconfigured' };
  }

  const to = env.CONTACT_TO_EMAIL ?? DEFAULT_TO_EMAIL;
  const from = env.CONTACT_FROM_EMAIL ?? DEFAULT_FROM_EMAIL;

  let res: Response;
  try {
    res = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Contact Form <${from}>`,
        to: [to],
        reply_to: payload.email,
        subject: `[Contact] ${payload.subject}`,
        text: renderText(payload),
        html: renderHtml(payload),
      }),
    });
  } catch (error) {
    log('resend request failed', { error: (error as Error).message });
    return { ok: false, status: 502, error: 'email provider unreachable' };
  }

  if (!res.ok) {
    // Log the raw provider error; return only a sanitized message to the client.
    log('resend api error', { status: res.status, body: await res.text() });
    return { ok: false, status: 502, error: 'email provider rejected the message' };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    const { pathname } = new URL(request.url);
    if (pathname === '/' && request.method === 'GET') {
      return respond(request, 200, { worker: 'contact-form', status: 'ok' });
    }
    if (pathname !== '/api/contact') {
      return respond(request, 404, { error: 'not found' });
    }
    if (request.method !== 'POST') {
      return respond(request, 405, { error: 'method not allowed' });
    }

    let rawJson: unknown;
    try {
      rawJson = await request.json();
    } catch {
      return respond(request, 400, { error: 'invalid JSON payload' });
    }

    const parsed = ContactSchema.safeParse(rawJson);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      log('validation failed', { issues });
      return respond(request, 400, { error: 'validation failed', issues });
    }
    const payload = parsed.data;

    const remoteip = request.headers.get('CF-Connecting-IP');
    const turnstile = await verifyTurnstile(env, payload.turnstileToken, remoteip);
    if (!turnstile.ok) {
      return respond(request, 403, { error: 'bot verification failed' });
    }

    const sent = await sendEmail(env, payload);
    if (!sent.ok) {
      return respond(request, sent.status, { error: sent.error });
    }

    log('message sent', { subject: payload.subject, budget: payload.budget ?? null });
    return respond(request, 200, { ok: true });
  },
};
