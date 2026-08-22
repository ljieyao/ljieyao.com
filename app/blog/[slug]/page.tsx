import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, markdownToHtml } from "@/lib/content";
import { categoryLabel, formatDate } from "@/lib/format";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (post === null) {
    return { title: "Post not found — JY Liu" };
  }
  return {
    title: `${post.title} — JY Liu`,
    description: post.summary,
    openGraph: {
      title: `${post.title} — JY Liu`,
      description: post.summary,
      url: `https://ljieyao.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (post === null) {
    notFound();
  }

  const html = markdownToHtml(post.content);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <Link
        href="/blog"
        className="text-sm text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ← Back to blog
      </Link>

      <article className="mt-8">
        <header>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden>·</span>
            <span>{categoryLabel(post.category)}</span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl dark:text-zinc-50">
            {post.title}
          </h1>
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div
          className="md-body mt-10 text-zinc-700 dark:text-zinc-300"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </main>
  );
}
