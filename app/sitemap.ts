import type { MetadataRoute } from "next";
import { getAllPortfolios, getAllPosts } from "@/lib/content";

const BASE_URL = "https://ljieyao.com";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, portfolios] = await Promise.all([
    getAllPosts(),
    getAllPortfolios(),
  ]);

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/works`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: posts[0] !== undefined ? new Date(posts[0].date) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    ...portfolios.map((item) => ({
      url: `${BASE_URL}/portfolio/${item.slug}`,
      lastModified: new Date(item.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
