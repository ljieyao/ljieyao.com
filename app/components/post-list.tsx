"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { Post } from "@/lib/content";
import { categoryLabel, formatDate } from "@/lib/format";
import { useJsEnabled } from "./use-js-enabled";

const EASE = [0.16, 1, 0.3, 1] as const;

type PostListProps = {
  posts: (Post & { slug: string })[];
  showCategoryPill?: boolean;
  variant?: "index" | "preview";
  headingLevel?: "h2" | "h3";
};

export function PostList({
  posts,
  showCategoryPill = true,
  variant = "index",
  headingLevel: Heading = "h2",
}: PostListProps) {
  const reduce = useReducedMotion();
  const js = useJsEnabled();
  const static_ = reduce || !js;
  const itemPadding = variant === "index" ? "py-8" : "py-6";
  const titleClassName =
    variant === "index"
      ? "mt-3 text-xl font-semibold tracking-tight"
      : "mt-2 text-lg font-semibold tracking-tight";

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {posts.map((post, index) => {
        const body = (
          <Link
            href={`/blog/${post.slug}`}
            className={`group block cursor-pointer ${itemPadding} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950`}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden>·</span>
              {showCategoryPill ? (
                <span className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs dark:border-zinc-700">
                  {categoryLabel(post.category)}
                </span>
              ) : (
                <span>{categoryLabel(post.category)}</span>
              )}
            </div>
            <Heading
              className={`${titleClassName} text-zinc-950 transition-colors group-hover:underline dark:text-zinc-50`}
            >
              {post.title}
            </Heading>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {post.summary}
            </p>
          </Link>
        );

        if (static_) {
          return <li key={post.slug}>{body}</li>;
        }

        return (
          <motion.li
            key={post.slug}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.06, ease: EASE }}
          >
            {body}
          </motion.li>
        );
      })}
    </ul>
  );
}
