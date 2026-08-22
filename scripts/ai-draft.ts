#!/usr/bin/env node
/**
 * Turn rough notes into a polished draft via an LLM (provider-agnostic).
 *
 * Providers (first available wins):
 *   1. MiniMax  — MINIMAX_API_KEY (MINIMAX_API_URL, MINIMAX_MODEL optional)
 *   2. Anthropic — ANTHROPIC_API_KEY (ANTHROPIC_API_URL, ANTHROPIC_MODEL optional)
 *
 * Usage:
 *   pnpm ai-draft --from notes.md
 *   pnpm ai-draft --from notes.txt --category technical --tags "ai,notes"
 *   pnpm ai-draft --from notes.md --dry-run     (scaffold locally, no API call)
 */
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import {
  POST_CATEGORIES,
  PLACEHOLDER_SUMMARY,
  flagString,
  isPostCategory,
  nowIso,
  parseArgs,
  parseTags,
  slugify,
  stringifyPostFrontmatter,
  validatePostFrontmatter,
  type PostCategory,
  type PostFrontmatter,
} from './common';

const HELP = `Usage: pnpm ai-draft --from <path-to-notes> [--category <c>] [--tags "a,b"] [--title "T"] [--dry-run]

Options:
  --from, -f     Path to a file with rough notes (markdown, txt, transcript) — required
  --title, -t    Override the title (default: derived from the notes / AI output)
  --category, -c One of: ${POST_CATEGORIES.join(', ')} (default: technical)
  --tags         Comma-separated tag list
  --dry-run      Scaffold a draft from the notes without calling any API
  --help, -h     Show this help

Providers: MINIMAX_API_KEY (MiniMax) or ANTHROPIC_API_KEY (Anthropic fallback).`;

const SYSTEM_PROMPT =
  'You are a helpful assistant that structures rough notes into a polished blog post. ' +
  'Output valid MDX with YAML frontmatter matching the PostSchema. ' +
  "Match JY's voice: direct, opinionated, technical. Keep it concise. " +
  'Frontmatter fields: title, date (ISO), category (one of: feeling-check-in, trend, technical, project), ' +
  'tags, summary (40-200 chars), draft: true, linkedin: false. Body should be markdown.';

const DEFAULT_MINIMAX_URL = 'https://api.minimax.chat/v1/chat/completions';
const DEFAULT_MINIMAX_MODEL = 'MiniMax-M2';
const DEFAULT_ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-5-20250929';

const DRAFTS_DIR = path.join(process.cwd(), 'content', 'drafts');

// ---------------------------------------------------------------------------
// Providers — each returns the raw assistant text
// ---------------------------------------------------------------------------

interface Provider {
  name: string;
  generate(system: string, user: string): Promise<string>;
}

function createMiniMaxProvider(apiKey: string): Provider {
  const url = process.env['MINIMAX_API_URL'] ?? DEFAULT_MINIMAX_URL;
  const model = process.env['MINIMAX_MODEL'] ?? DEFAULT_MINIMAX_MODEL;
  return {
    name: `MiniMax (${model})`,
    async generate(system, user) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });
      if (!response.ok) {
        throw new Error(`MiniMax API error ${response.status}: ${await response.text()}`);
      }
      const json: unknown = await response.json();
      const content = (json as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]?.message?.content;
      if (typeof content !== 'string' || content.length === 0) {
        throw new Error('MiniMax API returned no message content.');
      }
      return content;
    },
  };
}

function createAnthropicProvider(apiKey: string): Provider {
  const url = process.env['ANTHROPIC_API_URL'] ?? DEFAULT_ANTHROPIC_URL;
  const model = process.env['ANTHROPIC_MODEL'] ?? DEFAULT_ANTHROPIC_MODEL;
  return {
    name: `Anthropic (${model})`,
    async generate(system, user) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          system,
          messages: [{ role: 'user', content: user }],
        }),
      });
      if (!response.ok) {
        throw new Error(`Anthropic API error ${response.status}: ${await response.text()}`);
      }
      const json: unknown = await response.json();
      const blocks = (json as { content?: Array<{ type?: string; text?: unknown }> }).content ?? [];
      const text = blocks
        .filter((block) => block.type === 'text' && typeof block.text === 'string')
        .map((block) => block.text as string)
        .join('\n');
      if (text.length === 0) {
        throw new Error('Anthropic API returned no text content.');
      }
      return text;
    },
  };
}

function resolveProvider(): Provider {
  const minimaxKey = process.env['MINIMAX_API_KEY'];
  if (minimaxKey) return createMiniMaxProvider(minimaxKey);
  const anthropicKey = process.env['ANTHROPIC_API_KEY'];
  if (anthropicKey) return createAnthropicProvider(anthropicKey);
  console.error(
    [
      'Error: no AI provider configured.',
      'Set MINIMAX_API_KEY (MiniMax) or ANTHROPIC_API_KEY (Anthropic) in your environment.',
      'Tip: use --dry-run to scaffold a draft from the notes without calling any API.',
    ].join('\n'),
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Output parsing
// ---------------------------------------------------------------------------

/** Pull the MDX document out of the model response (handles ```mdx fences). */
function extractMdx(raw: string): string {
  const fences = [...raw.matchAll(/```(?:mdx|markdown|md)?\s*\n([\s\S]*?)```/g)].map((match) => match[1] ?? '');
  if (fences.length > 0) {
    return fences.reduce((longest, current) => (current.length > longest.length ? current : longest), '').trim();
  }
  return raw.trim();
}

function parseFrontmatterFromMdx(mdx: string): { data: Record<string, unknown>; content: string } {
  const parsed = matter(mdx);
  return { data: parsed.data, content: parsed.content.trim() };
}

function normalizeFrontmatter(
  data: Record<string, unknown>,
  fallbacks: { title: string; category: PostCategory; tags: string[] },
): PostFrontmatter {
  const category =
    typeof data['category'] === 'string' && isPostCategory(data['category']) ? data['category'] : fallbacks.category;
  const tags = Array.isArray(data['tags'])
    ? data['tags'].filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
    : fallbacks.tags;
  return {
    title: typeof data['title'] === 'string' && data['title'].trim().length > 0 ? data['title'].trim() : fallbacks.title,
    date: typeof data['date'] === 'string' && !Number.isNaN(Date.parse(data['date'])) ? data['date'] : nowIso(),
    category,
    tags,
    summary:
      typeof data['summary'] === 'string' && data['summary'].trim().length >= 40 ? data['summary'].trim() : PLACEHOLDER_SUMMARY,
    draft: true, // always starts as a draft, regardless of model output
    linkedin: false,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function deriveTitleFromNotes(notes: string): string {
  const firstLine =
    notes
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? 'Untitled draft';
  return (
    firstLine
      .replace(/^#+\s*/, '')
      .replace(/[*_`>#]/g, '')
      .replace(/[\s:;.,—-]+$/, '')
      .trim() || 'Untitled draft'
  );
}

async function main(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2));

  if (flags['help'] === true || flags['h'] === true) {
    console.log(HELP);
    return;
  }

  const fromPath = flagString(flags, 'from') ?? flagString(flags, 'f');
  const dryRun = flags['dry-run'] === true;
  if (!fromPath) {
    console.error('Error: --from <path> is required.');
    console.log(HELP);
    process.exit(1);
  }

  let notes: string;
  try {
    notes = await readFile(fromPath, 'utf8');
  } catch (error) {
    console.error(`Error: could not read ${fromPath} — ${(error as Error).message}`);
    process.exit(1);
  }
  if (notes.trim().length === 0) {
    console.error(`Error: ${fromPath} is empty.`);
    process.exit(1);
  }

  const fallbackTitle = flagString(flags, 'title') ?? flagString(flags, 't') ?? deriveTitleFromNotes(notes);
  const rawCategory = flagString(flags, 'category') ?? flagString(flags, 'c') ?? 'technical';
  if (!isPostCategory(rawCategory)) {
    console.error(`Error: category must be one of: ${POST_CATEGORIES.join(', ')}`);
    process.exit(1);
  }
  const fallbackCategory = rawCategory;
  const fallbackTags = parseTags(flagString(flags, 'tags'));

  let frontmatter: PostFrontmatter;
  let body: string;

  if (dryRun) {
    console.log('Dry run: scaffolding from notes without calling any API.');
    frontmatter = normalizeFrontmatter({}, { title: fallbackTitle, category: fallbackCategory, tags: fallbackTags });
    body = `${notes.trim()}\n`;
  } else {
    const provider = resolveProvider();
    console.log(`Generating draft with ${provider.name}...`);
    const userPrompt = [
      'Turn the rough notes below into a polished blog post.',
      'Respond with ONLY the MDX document (YAML frontmatter + markdown body), no commentary.',
      `If the notes suggest a category, pick from: ${POST_CATEGORIES.join(', ')}; otherwise use "${fallbackCategory}".`,
      `Today's date for the frontmatter: ${nowIso()}`,
      '',
      '--- NOTES ---',
      notes,
    ].join('\n');

    let raw: string;
    try {
      raw = await provider.generate(SYSTEM_PROMPT, userPrompt);
    } catch (error) {
      console.error(`Error: ${provider.name} call failed — ${(error as Error).message}`);
      process.exit(1);
    }

    const mdx = extractMdx(raw);
    const parsed = parseFrontmatterFromMdx(mdx);
    frontmatter = normalizeFrontmatter(parsed.data, { title: fallbackTitle, category: fallbackCategory, tags: fallbackTags });
    body = parsed.content.length > 0 ? `${parsed.content}\n` : 'TODO: Write your post here.\n';
  }

  try {
    validatePostFrontmatter(frontmatter, '(ai-draft output)');
  } catch (error) {
    console.error((error as Error).message);
    console.error('The generated frontmatter failed PostSchema validation. Nothing was written.');
    process.exit(1);
  }

  const slug = slugify(frontmatter.title);
  if (!slug) {
    console.error('Error: could not derive a slug from the generated title.');
    process.exit(1);
  }

  await mkdir(DRAFTS_DIR, { recursive: true });
  const filePath = path.join(DRAFTS_DIR, `${slug}.mdx`);
  try {
    await access(filePath);
    console.error(`Error: ${filePath} already exists.`);
    process.exit(1);
  } catch {
    // File does not exist — proceed.
  }

  await writeFile(filePath, `${stringifyPostFrontmatter(frontmatter)}${body}`, 'utf8');
  console.log(`Draft created at content/drafts/${slug}.mdx`);
  console.log('Next steps:');
  console.log('  1. Review and edit the draft (frontmatter summary must be 40-200 chars).');
  console.log(`  2. pnpm publish-post ${slug}`);
  console.log('  3. pnpm build to verify.');
}

main().catch((error: unknown) => {
  console.error((error as Error).message);
  process.exit(1);
});
