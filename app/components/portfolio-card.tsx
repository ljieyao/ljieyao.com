"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import type { Portfolio } from "@/lib/content";

/** "CXM Direct Mall" → "CD", "Superpowered by Glints" → "SG" */
function projectInitials(title: string): string {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0]}${words[1]![0]}`.toUpperCase();
}

/**
 * Deterministic duotone field hashed from the slug: same slug → same angle and
 * zinc-hue-shifted stops, always (no hydration mismatch). Values feed the
 * .monogram-field CSS contract in globals.css; dark stops swap via media query.
 */
function monogramVars(slug: string): CSSProperties {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (Math.imul(hash, 31) + slug.charCodeAt(i)) | 0;
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x45d9f3b);
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x9e3779b1);
  hash ^= hash >>> 15;
  const h = hash >>> 0;
  const angle = h % 360;
  const hue = (h >>> 12) % 360; // zinc-hue-shifted via full-wheel, low-sat
  const sat = 8 + ((h >>> 3) % 9); // 8–16%: muted pastel, never vivid
  return {
    "--grad-angle": `${angle}deg`,
    "--grad-from": `hsl(${hue} ${sat}% 97%)`,
    "--grad-to": `hsl(${hue} ${sat}% 85%)`,
    "--grad-from-dark": `hsl(${hue} ${sat}% 21%)`,
    "--grad-to-dark": `hsl(${hue} ${sat}% 8%)`,
  } as CSSProperties;
}

type PortfolioCardProps = {
  item: Pick<Portfolio, "title" | "slug" | "summary" | "stack" | "coverImage">;
  headingLevel?: "h2" | "h3";
  featured?: boolean;
};

/**
 * Borderless cover tile: the image (or hashed monogram field) bleeds to the
 * card edge; title row + arrow glyph, two-line summary, stack as a single mono
 * line. Hover: lift + shadow + image zoom (transform/opacity only).
 */
export function PortfolioCard({
  item,
  headingLevel: Heading = "h2",
  featured = false,
}: PortfolioCardProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const coverSrc = item.coverImage;

  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-zinc-100 transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-950/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:active:scale-[0.98] dark:bg-zinc-900 dark:hover:shadow-black/40 dark:focus-visible:ring-offset-zinc-950"
    >
      <div
        className={`aspect-[16/10] w-full overflow-hidden${featured ? " sm:aspect-[2/1]" : ""}`}
      >
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
          <div
            aria-hidden
            style={monogramVars(item.slug)}
            className="monogram-field relative flex h-full w-full items-center justify-center"
          >
            <span className="text-2xl font-semibold tracking-tight text-zinc-500 dark:text-zinc-400">
              {projectInitials(item.title)}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <Heading className="text-base font-semibold tracking-tight text-zinc-950 group-hover:underline dark:text-zinc-50">
            {item.title}
          </Heading>
          <span
            aria-hidden
            className="shrink-0 text-xl leading-none text-zinc-600 transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:text-accent dark:text-zinc-300"
          >
            →
          </span>
        </div>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {item.summary}
        </p>
        <p className="mt-4 truncate font-mono text-xs text-zinc-600 dark:text-zinc-400">
          {item.stack.slice(0, 3).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
