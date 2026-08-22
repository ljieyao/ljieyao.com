/**
 * LinkedIn poster Worker.
 *
 * Receives GitHub push webhooks on POST /webhook. When a push to main
 * adds/modifies a `content/posts/*.mdx` file whose frontmatter has
 * `linkedin: true`, formats a share (title + summary + link + hashtags)
 * and posts it to the LinkedIn Posts API.
 *
 * Responses:
 *   200 — processed (including "nothing to post" and missing-token cases,
 *         so GitHub does not retry)
 *   400 — malformed payload
 *   401 — missing/invalid x-hub-signature-256
 *   405/404 — wrong method/path
 *   500 — server misconfigured (no webhook secret)
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Env {
  /** GitHub webhook shared secret (preferred name). */
  WEBHOOK_SECRET?: string;
  /** Fallback name for the webhook secret. */
  GITHUB_WEBHOOK_SECRET?: string;
  /** LinkedIn OAuth user access token. */
  LINKEDIN_ACCESS_TOKEN?: string;
}

interface PushCommit {
  id: string;
  added?: string[];
  modified?: string[];
  removed?: string[];
}

interface PushPayload {
  ref?: string;
  after?: string;
  repository?: { full_name?: string; default_branch?: string };
  commits?: PushCommit[];
}

interface PostFrontmatter {
  title?: string;
  summary?: string;
  tags: string[];
  linkedin: boolean;
  draft: boolean;
}

interface PostResult {
  path: string;
  slug: string;
  posted: boolean;
  skippedReason?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SITE_URL = 'https://ljieyao.com';
const MAIN_REF = 'refs/heads/main';
const POST_PATH_RE = /^content\/posts\/[^/]+\.mdx$/;
const LINKEDIN_VERSION = '202506'; // LinkedIn-Version header (YYYYMM)

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Hub-Signature-256, X-GitHub-Event',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function respond(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function log(message: string, extra?: Record<string, unknown>): void {
  console.log(JSON.stringify({ worker: 'linkedin-poster', message, ...extra }));
}

/** Verify GitHub's `x-hub-signature-256: sha256=<hex>` header against the raw body. */
function verifySignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const match = /^sha256=([0-9a-f]{64})$/.exec(header.trim());
  if (!match) return false;
  const expectedHex = match[1];
  const computedHex = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  const expected = Buffer.from(expectedHex, 'utf8');
  const computed = Buffer.from(computedHex, 'utf8');
  return expected.length === computed.length && timingSafeEqual(expected, computed);
}

function unquote(value: string): string {
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Minimal YAML frontmatter reader for the PostSchema fields we need
 * (title, summary, tags, draft, linkedin). Supports both block-list tags
 * and inline `[a, b]` tags. Everything defaults to not-posting.
 */
function parseFrontmatter(rawMdx: string): PostFrontmatter {
  const fm: PostFrontmatter = { tags: [], linkedin: false, draft: false };
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(rawMdx);
  if (!block) return fm;

  let inTagsBlock = false;
  for (const line of block[1].split(/\r?\n/)) {
    const listItem = /^\s*-\s+(.+)$/.exec(line);
    if (inTagsBlock && listItem) {
      const tag = unquote(listItem[1].trim());
      if (tag) fm.tags.push(tag);
      continue;
    }
    inTagsBlock = false;

    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;
    const [, key, rawValue] = kv;
    const value = unquote(rawValue.trim());
    switch (key) {
      case 'title':
        fm.title = value;
        break;
      case 'summary':
        fm.summary = value;
        break;
      case 'draft':
        fm.draft = value === 'true';
        break;
      case 'linkedin':
        fm.linkedin = value === 'true';
        break;
      case 'tags':
        if (value.startsWith('[') && value.endsWith(']')) {
          fm.tags = value
            .slice(1, -1)
            .split(',')
            .map((t) => unquote(t.trim()))
            .filter((t) => t.length > 0);
        } else {
          inTagsBlock = true; // block list follows on subsequent lines
        }
        break;
    }
  }
  return fm;
}

/** Collect deduped added/modified `content/posts/*.mdx` paths across all commits. */
function changedPostPaths(payload: PushPayload): string[] {
  const paths = new Set<string>();
  for (const commit of payload.commits ?? []) {
    for (const path of [...(commit.added ?? []), ...(commit.modified ?? [])]) {
      if (POST_PATH_RE.test(path)) paths.add(path);
    }
  }
  return [...paths];
}

/** Fetch a post's MDX at the pushed SHA and parse its frontmatter. */
async function fetchFrontmatter(
  repo: string,
  ref: string,
  path: string,
): Promise<{ ok: true; frontmatter: PostFrontmatter } | { ok: false; error: string }> {
  const url = `https://raw.githubusercontent.com/${repo}/${ref}/${path}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'linkedin-poster-worker' } });
    if (!res.ok) {
      return { ok: false, error: `raw fetch ${res.status} for ${url}` };
    }
    return { ok: true, frontmatter: parseFrontmatter(await res.text()) };
  } catch (error) {
    return { ok: false, error: `raw fetch failed for ${url}: ${(error as Error).message}` };
  }
}

function slugFromPath(path: string): string {
  return path.replace(/^content\/posts\//, '').replace(/\.mdx$/, '');
}

function formatShare(fm: PostFrontmatter, slug: string): string {
  const link = `${SITE_URL}/blog/${slug}`;
  const hashtags = fm.tags.map((tag) => `#${tag.replace(/\s+/g, '')}`).join(' ');
  const lines = [fm.title ?? slug, '', fm.summary ?? '', '', `Read more: ${link}`];
  if (hashtags) lines.push('', hashtags);
  return lines.join('\n');
}

/** Resolve the LinkedIn member URN via OpenID userinfo. */
async function fetchMemberUrn(token: string): Promise<string | null> {
  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    log('linkedin userinfo failed', { status: res.status, body: await res.text() });
    return null;
  }
  const profile = (await res.json()) as { sub?: string };
  return profile.sub ? `urn:li:person:${profile.sub}` : null;
}

/** Publish a text post via the LinkedIn Posts API. */
async function postToLinkedIn(token: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const author = await fetchMemberUrn(token);
  if (!author) return { ok: false, error: 'could not resolve LinkedIn member URN' };

  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': LINKEDIN_VERSION,
    },
    body: JSON.stringify({
      author,
      commentary: text,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  });
  if (!res.ok) {
    return { ok: false, error: `linkedin posts api ${res.status}: ${await res.text()}` };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const { pathname } = new URL(request.url);
    if (pathname === '/' && request.method === 'GET') {
      return respond(200, { worker: 'linkedin-poster', status: 'ok' });
    }
    if (pathname !== '/webhook') {
      return respond(404, { error: 'not found' });
    }
    if (request.method !== 'POST') {
      return respond(405, { error: 'method not allowed' });
    }

    // GitHub sends a ping event when the webhook is first configured.
    if (request.headers.get('x-github-event') === 'ping') {
      log('ping acknowledged');
      return respond(200, { ok: true, message: 'ping acknowledged' });
    }

    const secret = env.WEBHOOK_SECRET ?? env.GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      log('no webhook secret configured (set WEBHOOK_SECRET)');
      return respond(500, { error: 'server misconfigured: missing webhook secret' });
    }

    const rawBody = await request.text();
    if (!verifySignature(rawBody, request.headers.get('x-hub-signature-256'), secret)) {
      log('signature verification failed');
      return respond(401, { error: 'invalid signature' });
    }

    let payload: PushPayload;
    try {
      payload = JSON.parse(rawBody) as PushPayload;
    } catch {
      return respond(400, { error: 'invalid JSON payload' });
    }
    if (typeof payload !== 'object' || payload === null || !Array.isArray(payload.commits)) {
      return respond(400, { error: 'not a push payload' });
    }
    if (payload.ref && payload.ref !== MAIN_REF) {
      log('ignored non-main push', { ref: payload.ref });
      return respond(200, { ok: true, skipped: `non-main ref ${payload.ref}` });
    }

    const postPaths = changedPostPaths(payload);
    if (postPaths.length === 0) {
      log('no post changes in push');
      return respond(200, { ok: true, posted: 0, message: 'no content/posts changes' });
    }

    const repo = payload.repository?.full_name;
    if (!repo) {
      return respond(400, { error: 'missing repository.full_name' });
    }
    const ref = payload.after ?? payload.repository?.default_branch ?? 'main';

    const token = env.LINKEDIN_ACCESS_TOKEN;
    if (!token) {
      // Graceful no-op so GitHub does not retry; posting is opt-in via secret.
      log('LINKEDIN_ACCESS_TOKEN not set — skipping posts', { paths: postPaths });
      return respond(200, { ok: true, posted: 0, skipped: 'LINKEDIN_ACCESS_TOKEN not set' });
    }

    const results: PostResult[] = [];
    for (const path of postPaths) {
      const slug = slugFromPath(path);
      const fetched = await fetchFrontmatter(repo, ref, path);
      if (!fetched.ok) {
        log('skipped post', { path, reason: fetched.error });
        results.push({ path, slug, posted: false, skippedReason: fetched.error });
        continue;
      }
      const fm = fetched.frontmatter;
      if (fm.draft || !fm.linkedin) {
        log('skipped post', { path, draft: fm.draft, linkedin: fm.linkedin });
        results.push({ path, slug, posted: false, skippedReason: 'linkedin not enabled' });
        continue;
      }

      const outcome = await postToLinkedIn(token, formatShare(fm, slug));
      if (outcome.ok) {
        log('posted to linkedin', { path });
        results.push({ path, slug, posted: true });
      } else {
        // Log and continue — return 200 so GitHub does not retry the whole push.
        log('linkedin post failed', { path, error: outcome.error });
        results.push({ path, slug, posted: false, skippedReason: outcome.error });
      }
    }

    return respond(200, {
      ok: true,
      posted: results.filter((r) => r.posted).length,
      results,
    });
  },
};
