"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Experience } from "@/lib/content";
import { formatExperienceRange } from "@/lib/format";

const EASE = [0.16, 1, 0.3, 1] as const;

/** "Shift Market" → "SM", "InnoLab" → "IN" */
function companyInitials(company: string): string {
  const words = company.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]![0]}${words[1]![0]}`.toUpperCase();
}

function CompanyLogo({ company, logo }: { company: string; logo?: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = logo !== undefined && !failed;

  return (
    <span
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {showImage ? (
        <Image
          src={logo}
          alt=""
          width={40}
          height={40}
          className="h-full w-full object-contain p-1 opacity-70 grayscale transition-[opacity,filter] duration-300 group-hover:opacity-100 group-hover:grayscale-0"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-xs font-semibold tracking-wide text-zinc-400 dark:text-zinc-500">
          {companyInitials(company)}
        </span>
      )}
    </span>
  );
}

export function ExperienceList({ jobs }: { jobs: Experience[] }) {
  const reduce = useReducedMotion();

  return (
    <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job, index) => {
        const delay = index * 0.06;

        const content = (
          <>
            <CompanyLogo company={job.company} logo={job.logo} />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                {job.role}
              </h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {job.company}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                {formatExperienceRange(job.start, job.end)}
              </p>
            </div>
          </>
        );

        if (reduce) {
          return (
            <li key={`${job.company}-${job.start}`} className="flex items-start gap-3">
              {content}
            </li>
          );
        }

        return (
          <motion.li
            key={`${job.company}-${job.start}`}
            className="flex items-start gap-3"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay, ease: EASE }}
          >
            {content}
          </motion.li>
        );
      })}
    </ol>
  );
}
