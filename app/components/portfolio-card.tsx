"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Portfolio } from "@/lib/content";

/** "CXM Direct Mall" → "CD", "Superpowered by Glints" → "SG" */
function projectInitials(title: string): string {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0]}${words[1]![0]}`.toUpperCase();
}

type PortfolioCardProps = {
  item: Pick<Portfolio, "title" | "slug" | "summary" | "stack" | "coverImage">;
  headingLevel?: "h2" | "h3";
};

/**
 * Project card with cover image (aspect 16/10) or a consistent zinc monogram
 * fallback tile. Hover: subtle lift + border shift + image zoom (transform only).
 */
export function PortfolioCard({
  item,
  headingLevel: Heading = "h2",
}: PortfolioCardProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const coverSrc = item.coverImage;

  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="group flex h-full cursor-pointer flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-zinc-400 hover:shadow-lg hover:shadow-zinc-950/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600 dark:hover:shadow-black/40 dark:focus-visible:ring-offset-zinc-950"
    >
      <div className="aspect-[16/10] w-full overflow-hidden rounded-xl">
        {coverSrc !== undefined && !coverFailed ? (
          <Image
            src={coverSrc}
            alt={item.title}
            width={800}
            height={500}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            onError={() => setCoverFailed(true)}
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
            <div
              aria-hidden
              className="absolute inset-0 [background-image:radial-gradient(#a1a1aa_1px,transparent_1px)] [background-size:14px_14px] opacity-[0.25] dark:opacity-[0.12]"
            />
            <span className="relative text-2xl font-semibold tracking-tight text-zinc-500 dark:text-zinc-500">
              {projectInitials(item.title)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <Heading className="text-base font-semibold tracking-tight text-zinc-950 group-hover:underline dark:text-zinc-50">
          {item.title}
        </Heading>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {item.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {item.stack.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
