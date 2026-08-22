import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { z } from 'zod';

const CONTENT_DIR = path.join(process.cwd(), 'content');

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const ExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  start: z.string(), // YYYY-MM
  end: z.string().nullable(), // null = "Now"
  logo: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  order: z.number(), // display order
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

export type Experience = z.infer<typeof ExperienceSchema>;
export type Portfolio = z.infer<typeof PortfolioSchema>;
export type Post = z.infer<typeof PostSchema>;

export type PostWithBody = Post & { slug: string; content: string };
export type PortfolioWithBody = Portfolio & { content: string };

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

async function readMdxFiles(dir: string): Promise<{ slug: string; frontmatter: unknown; content: string }[]> {
  const absDir = path.join(CONTENT_DIR, dir);
  let entries: string[];
  try {
    entries = await readdir(absDir);
  } catch {
    return [];
  }

  const files = entries.filter((f) => f.endsWith('.mdx'));
  const parsed = await Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(absDir, file), 'utf8');
      const { data, content } = matter(raw);
      return { slug: file.replace(/\.mdx$/, ''), frontmatter: data, content };
    }),
  );
  return parsed;
}

function parseOrThrow<T extends z.ZodTypeAny>(schema: T, data: unknown, source: string): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid frontmatter in ${source} → ${issues}`);
  }
  return result.data;
}

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export async function getAllPosts(): Promise<PostWithBody[]> {
  const files = await readMdxFiles('posts');
  return files
    .map(({ slug, frontmatter, content }) => ({
      ...(parseOrThrow(PostSchema, frontmatter, `posts/${slug}.mdx`) as Post),
      slug,
      content,
    }))
    .filter((post) => !post.draft)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPostBySlug(slug: string): Promise<PostWithBody | null> {
  const posts = await getAllPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

export async function getAllPortfolios(): Promise<PortfolioWithBody[]> {
  const files = await readMdxFiles('portfolio');
  return files
    .map(({ frontmatter, content }) => ({
      ...(parseOrThrow(PortfolioSchema, frontmatter, 'portfolio') as Portfolio),
      content,
    }))
    .filter((item) => !item.draft)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getPortfolioBySlug(slug: string): Promise<PortfolioWithBody | null> {
  const items = await getAllPortfolios();
  return items.find((p) => p.slug === slug) ?? null;
}

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------

export async function getAllExperience(): Promise<Experience[]> {
  const files = await readMdxFiles('experience');
  return files
    .map(({ frontmatter, slug }) => parseOrThrow(ExperienceSchema, frontmatter, `experience/${slug}.mdx`) as Experience)
    .sort((a, b) => a.order - b.order);
}

// ---------------------------------------------------------------------------
// Markdown rendering (gray-matter + marked approach — static-export friendly)
// ---------------------------------------------------------------------------

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}
