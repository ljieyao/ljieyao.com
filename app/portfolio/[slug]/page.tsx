import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllPortfolios,
  getPortfolioBySlug,
  markdownToHtml,
} from "@/lib/content";
import { formatDate } from "@/lib/format";

export async function generateStaticParams() {
  const items = await getAllPortfolios();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata(
  props: PageProps<"/portfolio/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const item = await getPortfolioBySlug(slug);
  if (item === null) {
    return { title: "Project not found — JY Liu" };
  }
  return {
    title: `${item.title} — JY Liu`,
    description: item.summary,
    openGraph: {
      title: `${item.title} — JY Liu`,
      description: item.summary,
      url: `https://ljieyao.com/portfolio/${item.slug}`,
      type: "article",
      publishedTime: item.publishedAt,
    },
  };
}

export default async function PortfolioDetailPage(
  props: PageProps<"/portfolio/[slug]">,
) {
  const { slug } = await props.params;
  const item = await getPortfolioBySlug(slug);
  if (item === null) {
    notFound();
  }

  const html = markdownToHtml(item.content);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <Link
        href="/works"
        className="text-sm text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← Back to works
      </Link>

      <article className="mt-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
            {item.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span>{item.role}</span>
            <span aria-hidden>·</span>
            <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {item.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
              >
                {tech}
              </span>
            ))}
          </div>
        </header>

        <div
          className="md-body mt-10 text-zinc-700 dark:text-zinc-300"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </main>
  );
}
