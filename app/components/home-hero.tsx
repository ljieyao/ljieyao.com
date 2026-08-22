"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Hero entrance: one-time load stagger (eyebrow → headline → subtext → CTA),
 * done in under 0.7s. Static render when the user prefers reduced motion.
 */
export function HomeHero() {
  const reduce = useReducedMotion();

  const items = [
    {
      key: "eyebrow",
      className: "text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400",
      children: "Full Stack Web & Mobile App Engineer",
    },
    {
      key: "headline",
      className:
        "mt-4 text-5xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl",
      children: "JY Liu",
    },
    {
      key: "subtext",
      className:
        "mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400",
      children:
        "I design and build web and mobile products end to end — from idea to production.",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-5xl px-6 pt-24 pb-24 text-center sm:py-32">
      {items.map(({ key, className, children }, index) =>
        reduce ? (
          <p key={key} className={className}>
            {children}
          </p>
        ) : (
          <motion.p
            key={key}
            className={className}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.07, ease: EASE }}
          >
            {children}
          </motion.p>
        ),
      )}
      {reduce ? (
        <a
          href="https://api.whatsapp.com/send?phone=601164110281"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-zinc-950 px-8 font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300 dark:focus-visible:ring-offset-zinc-950"
        >
          Let&apos;s Talk
        </a>
      ) : (
        <motion.a
          href="https://api.whatsapp.com/send?phone=601164110281"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-zinc-950 px-8 font-medium text-white transition-[background-color,transform] duration-200 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300 dark:focus-visible:ring-offset-zinc-950"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.21, ease: EASE }}
        >
          Let&apos;s Talk
        </motion.a>
      )}
    </section>
  );
}
