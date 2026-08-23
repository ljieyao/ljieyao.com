"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Portfolio } from "@/lib/content";
import { PortfolioCard } from "./portfolio-card";
import { useJsEnabled } from "./use-js-enabled";

const EASE = [0.16, 1, 0.3, 1] as const;

type PortfolioGridProps = {
  items: Portfolio[];
  headingLevel?: "h2" | "h3";
  gridClassName?: string;
  /** First item spans two columns (featured bento slot). */
  featuredFirst?: boolean;
};

/** Staggered scroll-reveal grid of portfolio cards. */
export function PortfolioGrid({
  items,
  headingLevel,
  gridClassName = "sm:grid-cols-2",
  featuredFirst = false,
}: PortfolioGridProps) {
  const reduce = useReducedMotion();
  const js = useJsEnabled();
  const static_ = reduce || !js;

  if (items.length === 0) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400">
        No projects published yet.
      </p>
    );
  }

  return (
    <ul className={`grid gap-6 ${gridClassName}`}>
      {items.map((item, index) =>
        static_ ? (
          <li
            key={item.slug}
            className={`flex h-full flex-col${featuredFirst && index === 0 ? " sm:col-span-2" : ""}`}
          >
            <PortfolioCard
              item={item}
              headingLevel={headingLevel}
              featured={featuredFirst && index === 0}
            />
          </li>
        ) : (
          <motion.li
            key={item.slug}
            className={`flex h-full flex-col${featuredFirst && index === 0 ? " sm:col-span-2" : ""}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.06, ease: EASE }}
          >
            <PortfolioCard
              item={item}
              headingLevel={headingLevel}
              featured={featuredFirst && index === 0}
            />
          </motion.li>
        ),
      )}
    </ul>
  );
}
