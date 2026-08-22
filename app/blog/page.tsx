import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/content";
import { categoryLabel, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Blog — JY Liu",
  description:
    "Writing on engineering, technology trends, business decision-making, and career reflections by JY Liu.",
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Blog
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Notes on engineering, technology trends, and career reflections.
      </p>

      <ul className="mt-12 divide-y divide-zinc-200 dark:divide-zinc-800">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group block py-8">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span aria-hidden>·</span>
                <span className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs dark:border-zinc-700">
                  {categoryLabel(post.category)}
                </span>
              </div>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950 group-hover:underline dark:text-zinc-50">
                {post.title}
              </h2>
              <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">
                {post.summary}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
