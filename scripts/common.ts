import matter from 'gray-matter';
import { PostSchema } from '../lib/content';

// ---------------------------------------------------------------------------
// CLI arg parsing
// ---------------------------------------------------------------------------

export interface ParsedArgs {
  flags: Record<string, string | true>;
  positional: string[];
}

/** Minimal parser: handles `--key value`, `--key=value`, boolean flags, positionals. */
export function parseArgs(argv: readonly string[]): ParsedArgs {
  const flags: Record<string, string | true> = {};
  const positional: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }
    const eq = token.indexOf('=');
    if (eq !== -1) {
      const key = token.slice(2, eq);
      flags[key] = token.slice(eq + 1);
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) {
      flags[key] = next;
      i++;
    } else {
      flags[key] = true;
    }
  }
  return { flags, positional };
}

export function flagString(flags: Record<string, string | true>, name: string): string | undefined {
  const value = flags[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

// ---------------------------------------------------------------------------
// Slugs + frontmatter
// ---------------------------------------------------------------------------

/** Kebab-case slug from arbitrary text (strips emoji, diacritics, punctuation). */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
}

export const POST_CATEGORIES = ['feeling-check-in', 'trend', 'technical', 'project'] as const;
export type PostCategory = (typeof POST_CATEGORIES)[number];

export function isPostCategory(value: string): value is PostCategory {
  return (POST_CATEGORIES as readonly string[]).includes(value);
}

export const PLACEHOLDER_SUMMARY =
  'TODO: Replace this summary before publishing. It must be 40 to 200 characters long.';

export interface PostFrontmatter {
  title: string;
  date: string;
  category: PostCategory;
  tags: string[];
  summary: string;
  draft: boolean;
  linkedin: boolean;
}

function yamlString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/** Serialize post frontmatter in the same YAML style as the migrated posts. */
export function stringifyPostFrontmatter(fm: PostFrontmatter): string {
  const tagLines = fm.tags.length > 0 ? fm.tags.map((tag) => `  - ${yamlString(tag)}`) : ['  []'];
  return [
    '---',
    `title: ${yamlString(fm.title)}`,
    `date: ${yamlString(fm.date)}`,
    `category: ${yamlString(fm.category)}`,
    'tags:',
    ...tagLines,
    `summary: ${yamlString(fm.summary)}`,
    `draft: ${fm.draft}`,
    `linkedin: ${fm.linkedin}`,
    '---',
    '',
  ].join('\n');
}

/** Validate arbitrary frontmatter data against PostSchema; throws with readable issues. */
export function validatePostFrontmatter(data: unknown, source: string): PostFrontmatter {
  const result = PostSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid frontmatter in ${source}:\n${issues}`);
  }
  return result.data;
}

export function isIsoDatetime(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(value);
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

/** Parse an .mdx file into frontmatter (unknown) + body, tolerating missing file errors from caller. */
export function parseMdx(raw: string): { data: Record<string, unknown>; content: string } {
  const { data, content } = matter(raw);
  return { data, content };
}
