const BASE_URL = "https://ljieyao.com";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export const SITE = {
  name: "JY Liu",
  url: BASE_URL,
};

export const PERSON = {
  "@type": "Person",
  name: "JY Liu",
  alternateName: "ljieyao",
  jobTitle: "Solutions Architect | Technical Lead | Senior Full-Stack Engineer",
  description:
    "12+ years building production systems across fintech, travel and enterprise platforms. Solutions Architect, Technical Lead and Senior Full-Stack Engineer based in Kuala Lumpur, Malaysia.",
  email: "mailto:ljieyao0210@gmail.com",
  url: BASE_URL,
  sameAs: ["https://github.com/ljieyao", "https://linkedin.com/in/ljieyao"],
  knowsAbout: [
    "Next.js",
    "TypeScript",
    "Node.js",
    "Python",
    "AWS",
    "Cloudflare Workers",
    "System Architecture",
  ],
} as const;

type BlogPostingInput = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  tags: readonly string[];
};

export function blogPostingJsonLd(post: BlogPostingInput) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    author: PERSON,
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
    url: `${SITE.url}/blog/${post.slug}`,
    articleSection: post.category,
    keywords: post.tags.join(", "),
    image: `${SITE.url}/og-image.png`,
    inLanguage: "en",
  };
}

type CreativeWorkInput = {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  stack: readonly string[];
};

export function creativeWorkJsonLd(item: CreativeWorkInput) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: item.title,
    abstract: item.summary,
    datePublished: item.publishedAt,
    author: PERSON,
    url: `${SITE.url}/portfolio/${item.slug}`,
    keywords: item.stack.join(", "),
    image: `${SITE.url}/og-image.png`,
    inLanguage: "en",
  };
}
