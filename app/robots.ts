import type { MetadataRoute } from "next";

const BASE_URL = "https://ljieyao.com";

// AI crawlers explicitly allowed so the site is indexable by LLM-powered
// search/answer engines (ChatGPT, Claude, Perplexity, Gemini, Meta AI).
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "meta-externalagent",
  "Bytespider",
] as const;

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: [...AI_CRAWLERS],
        allow: "/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
