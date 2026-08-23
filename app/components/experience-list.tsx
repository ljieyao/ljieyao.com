"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Experience } from "@/lib/content";
import { formatExperienceRange } from "@/lib/format";
import { useJsEnabled } from "./use-js-enabled";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Vertical left-rail timeline: a continuous hairline (the <ol> border) with an
 * emerald node per job. Rows stack role/company on the left and a right-aligned
 * mono date column at ≥sm; below sm the dates flow inline under the role.
 */
export function ExperienceList({ jobs }: { jobs: Experience[] }) {
  const reduce = useReducedMotion();
  const js = useJsEnabled();
  const static_ = reduce || !js;

  return (
    <ol className="mt-12 border-l-2 border-zinc-300 dark:border-zinc-600">
      {jobs.map((job, index) => {
        const row = (
          <>
            <span
              aria-hidden
              className="absolute left-0 top-1.5 h-2 w-2 -translate-x-1/2 rounded-full bg-accent"
            />
            <div className="flex flex-col gap-1 pl-8 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
              <div className="min-w-0">
                <h3 className="text-base font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
                  {job.role}
                </h3>
                <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                  {job.company}
                </p>
              </div>
              <p className="font-mono text-xs text-zinc-500 sm:shrink-0 sm:text-right dark:text-zinc-400">
                {formatExperienceRange(job.start, job.end)}
              </p>
            </div>
            {job.highlights.length > 0 && (
              <ul className="mt-2 space-y-1 pl-8">
                {job.highlights.map((h) => (
                  <li
                    key={h}
                    className="text-sm leading-6 text-zinc-600 dark:text-zinc-400"
                  >
                    <span aria-hidden className="mr-2 text-zinc-400 dark:text-zinc-500">—</span>
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </>
        );

        if (static_) {
          return (
            <li
              key={`${job.company}-${job.start}`}
              className="relative pb-10 last:pb-0"
            >
              {row}
            </li>
          );
        }

        return (
          <motion.li
            key={`${job.company}-${job.start}`}
            className="relative pb-10 last:pb-0"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.06, ease: EASE }}
          >
            {row}
          </motion.li>
        );
      })}
    </ol>
  );
}
