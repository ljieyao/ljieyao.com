"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Portfolio } from "@/lib/content";
import { PortfolioCard } from "./portfolio-card";

const EASE = [0.16, 1, 0.3, 1] as const;

type PortfolioGridProps = {
  items: Portfolio[];
  headingLevel?: "h2" | "h3";
  gridClassName?: string;
};

/** Staggered scroll-reveal grid of portfolio cards. */
export function PortfolioGrid({
  items,
  headingLevel,
  gridClassName = "sm:grid-cols-2",
}: PortfolioGridProps) {
  const reduce = useReducedMotion();

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
        reduce ? (
          <li key={item.slug} className="flex h-full flex-col">
            <PortfolioCard item={item} headingLevel={headingLevel} />
          </li>
        ) : (
          <motion.li
            key={item.slug}
            className="flex h-full flex-col"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.06, ease: EASE }}
          >
            <PortfolioCard item={item} headingLevel={headingLevel} />
          </motion.li>
        ),
      )}
    </ul>
  );
}
