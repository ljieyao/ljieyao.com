#!/usr/bin/env node
/**
 * Scaffold a new blog draft.
 *
 * Usage:
 *   pnpm new-post --title "My Title" --category technical --tags "a,b"
 *   pnpm new-post            (interactive prompts when args are missing)
 */
import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
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
} from './common';

const HELP = `Usage: pnpm new-post --title "My Title" --category <category> [--tags "a,b"]

Options:
  --title, -t      Post title (prompted interactively if omitted)
  --category, -c   One of: ${POST_CATEGORIES.join(', ')} (prompted if omitted)
  --tags           Comma-separated tag list (default: none)
  --help, -h       Show this help

Creates content/drafts/<slug>.mdx with a validated frontmatter template.`;

const DRAFTS_DIR = path.join(process.cwd(), 'content', 'drafts');

function printHelp(): void {
  console.log(HELP);
}

async function promptMissing(options: {
  title?: string;
  category?: string;
  interactive: boolean;
}): Promise<{ title: string; category: string }> {
  let { title, category } = options;
  if (!title || !category) {
    if (!options.interactive) {
      console.error('Error: --title and --category are required (or run in a TTY for interactive prompts).');
      printHelp();
      process.exit(1);
    }
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      if (!title) {
        title = (await rl.question('Post title: ')).trim();
      }
      while (!category || !isPostCategory(category)) {
        const answer = (await rl.question(`Category (${POST_CATEGORIES.join(' / ')}): `)).trim();
        category = answer;
        if (!isPostCategory(category)) {
          console.error(`  "${category}" is not a valid category, try again.`);
        }
      }
    } finally {
      rl.close();
    }
  }
  return { title, category };
}

async function main(): Promise<void> {
  const { flags } = parseArgs(process.argv.slice(2));

  if (flags['help'] === true || flags['h'] === true) {
    printHelp();
    return;
  }

  const rawTitle = flagString(flags, 'title') ?? flagString(flags, 't');
  const rawCategory = flagString(flags, 'category') ?? flagString(flags, 'c');

  const { title, category } = await promptMissing({
    title: rawTitle?.trim(),
    category: rawCategory?.trim(),
    interactive: process.stdin.isTTY === true,
  });

  if (!title) {
    console.error('Error: title cannot be empty.');
    process.exit(1);
  }
  if (!isPostCategory(category)) {
    console.error(`Error: category must be one of: ${POST_CATEGORIES.join(', ')}`);
    process.exit(1);
  }

  const tags = parseTags(flagString(flags, 'tags'));
  const slug = slugify(title);
  if (!slug) {
    console.error('Error: could not derive a slug from that title (needs alphanumeric characters).');
    process.exit(1);
  }

  const frontmatter = {
    title,
    date: nowIso(),
    category: category as PostCategory,
    tags,
    summary: PLACEHOLDER_SUMMARY,
    draft: true,
    linkedin: false,
  };

  // Validate against the real schema before touching the filesystem.
  try {
    validatePostFrontmatter(frontmatter, `drafts/${slug}.mdx (template)`);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }

  const filePath = path.join(DRAFTS_DIR, `${slug}.mdx`);
  await mkdir(DRAFTS_DIR, { recursive: true });
  try {
    await access(filePath);
    console.error(`Error: ${filePath} already exists.`);
    process.exit(1);
  } catch {
    // File does not exist — proceed.
  }

  const body = 'TODO: Write your post here.\n';
  await writeFile(filePath, `${stringifyPostFrontmatter(frontmatter)}${body}`, 'utf8');

  console.log(`Draft created at content/drafts/${slug}.mdx — edit, then run \`pnpm publish-post ${slug}\``);
}

main().catch((error: unknown) => {
  console.error((error as Error).message);
  process.exit(1);
});
