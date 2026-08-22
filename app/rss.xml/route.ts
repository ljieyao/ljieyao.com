import { getAllPosts } from "@/lib/content";

export const dynamic = "force-static";

const BASE_URL = "https://ljieyao.com";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  const posts = await getAllPosts();

  const items = posts
    .map((post) => {
      const url = `${BASE_URL}/blog/${post.slug}`;
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escapeXml(post.summary)}</description>`,
        `      <pubDate>${new Date(post.date).toUTCString()}</pubDate>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const lastBuildDate =
    posts[0] !== undefined
      ? new Date(posts[0].date).toUTCString()
      : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>JY Liu — Full Stack Engineer</title>
    <link>${BASE_URL}</link>
    <description>Full stack web &amp; mobile app engineering — portfolio, case studies, and writing by JY Liu.</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
