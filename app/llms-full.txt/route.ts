import { getAllPosts, getAllPortfolios } from "@/lib/content";
import { categoryLabel, formatDate } from "@/lib/format";

export const dynamic = "force-static";

const BASE_URL = "https://ljieyao.com";

function stripMdx(body: string): string {
  // Remove MDX/JSX import statements and component tags so the output is
  // plain markdown. Content in this repo is prose-first, so this is a light
  // pass rather than a full compiler.
  return body
    .replace(/^import\s+.*?;?\s*$/gm, "")
    .replace(/<\/?[A-Z][A-Za-z0-9]*[^>]*>/g, "")
    .trim();
}

export async function GET() {
  const [posts, portfolios] = await Promise.all([
    getAllPosts(),
    getAllPortfolios(),
  ]);

  const sections: string[] = [
    `# JY Liu — Solutions Architect | Technical Lead | Senior Full-Stack Engineer`,
    ``,
    `Personal site of JY Liu: 12+ years building production systems across fintech, travel and enterprise platforms. Based in Kuala Lumpur, Malaysia. MBA (Business Analytics), University of Malaya.`,
    ``,
    `- Site: ${BASE_URL}`,
    `- Blog: ${BASE_URL}/blog`,
    `- Works: ${BASE_URL}/works`,
    `- Contact: WhatsApp +60 11-6411 0281 · ljieyao0210@gmail.com · ${BASE_URL}/contact`,
    ``,
    `This document contains the complete text of every blog post and portfolio case study on the site, in plain markdown.`,
    ``,
  ];

  sections.push(`## Blog posts`, ``);
  for (const post of posts) {
    sections.push(
      `### ${post.title}`,
      ``,
      `- URL: ${BASE_URL}/blog/${post.slug}`,
      `- Published: ${formatDate(post.date)}`,
      `- Category: ${categoryLabel(post.category)}`,
      ...(post.tags.length > 0 ? [`- Tags: ${post.tags.join(", ")}`] : []),
      ``,
      stripMdx(post.content),
      ``,
      `---`,
      ``,
    );
  }

  sections.push(`## Portfolio case studies`, ``);
  for (const item of portfolios) {
    sections.push(
      `### ${item.title}`,
      ``,
      `- URL: ${BASE_URL}/portfolio/${item.slug}`,
      `- Published: ${formatDate(item.publishedAt)}`,
      `- Role: ${item.role}`,
      `- Stack: ${item.stack.join(", ")}`,
      ``,
      item.summary,
      ``,
      stripMdx(item.content),
      ``,
      `---`,
      ``,
    );
  }

  return new Response(sections.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
