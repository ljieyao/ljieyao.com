#!/usr/bin/env node
/**
 * Publish a draft: validate, flip draft: false, move to content/posts/.
 *
 * Usage:
 *   pnpm publish-post <slug>          (slug matches content/drafts/<slug>.mdx)
 */
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import {
  isIsoDatetime,
  nowIso,
  parseArgs,
  parseMdx,
  slugify,
  stringifyPostFrontmatter,
  validatePostFrontmatter,
} from './common';

const execFileAsync = promisify(execFile);

const HELP = `Usage: pnpm publish-post <slug>

Options:
  --help, -h   Show this help

Reads content/drafts/<slug>.mdx, validates it against PostSchema, sets draft: false
(and date: now, if the date was a placeholder), then moves it to content/posts/.`;

const CONTENT_DIR = path.join(process.cwd(), 'content');

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function tryGitAdd(filePath: string): Promise<void> {
  try {
    await execFileAsync('git', ['rev-parse', '--is-inside-work-tree']);
    await execFileAsync('git', ['add', filePath]);
    console.log(`Staged ${path.relative(process.cwd(), filePath)} with git.`);
  } catch {
    // git unavailable or not a repo — publishing still succeeds.
  }
}

async function main(): Promise<void> {
  const { flags, positional } = parseArgs(process.argv.slice(2));

  if (flags['help'] === true || flags['h'] === true) {
    console.log(HELP);
    return;
  }

  const rawSlug = positional[0] ?? (typeof flags['slug'] === 'string' ? flags['slug'] : undefined);
  if (!rawSlug) {
    console.error('Error: slug is required. Usage: pnpm publish-post <slug>');
    console.log(HELP);
    process.exit(1);
  }
  const slug = slugify(rawSlug);
  const draftPath = path.join(CONTENT_DIR, 'drafts', `${slug}.mdx`);
  const postPath = path.join(CONTENT_DIR, 'posts', `${slug}.mdx`);

  if (!(await exists(draftPath))) {
    console.error(`Error: content/drafts/${slug}.mdx not found.`);
    process.exit(1);
  }
  if (await exists(postPath)) {
    console.error(`Error: content/posts/${slug}.mdx already exists.`);
    process.exit(1);
  }

  // Parse + validate the draft.
  const raw = await readFile(draftPath, 'utf8');
  const { data, content } = parseMdx(raw);

  // Normalize before validating: fill a placeholder/missing date, force draft: false.
  if (!isIsoDatetime(data['date']) || typeof data['date'] !== 'string') {
    data['date'] = nowIso();
  }
  data['draft'] = false;

  let frontmatter;
  try {
    frontmatter = validatePostFrontmatter(data, `drafts/${slug}.mdx`);
  } catch (error) {
    console.error((error as Error).message);
    console.error(`Fix the frontmatter in content/drafts/${slug}.mdx and try again.`);
    process.exit(1);
  }

  // Write to posts/, re-validate the moved file, then remove the draft.
  await mkdir(path.dirname(postPath), { recursive: true });
  await writeFile(postPath, `${stringifyPostFrontmatter(frontmatter)}${content.replace(/^\n+/, '')}\n`, 'utf8');

  const movedRaw = await readFile(postPath, 'utf8');
  try {
    validatePostFrontmatter(parseMdx(movedRaw).data, `posts/${slug}.mdx`);
  } catch (error) {
    // Roll back so we never leave an invalid published post behind.
    await rm(postPath);
    console.error(`Post-move validation failed (draft restored): ${(error as Error).message}`);
    process.exit(1);
  }

  await rm(draftPath);

  console.log(`Published content/posts/${slug}.mdx — run \`pnpm build\` to verify`);
  await tryGitAdd(postPath);
}

main().catch((error: unknown) => {
  console.error((error as Error).message);
  process.exit(1);
});
