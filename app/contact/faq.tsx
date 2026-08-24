"use client";

import { useState } from "react";
import { useReducedMotion } from "motion/react";
import { FAQS } from "./faqs";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <div className="mt-4 divide-y divide-zinc-200 dark:divide-zinc-800">
      {FAQS.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={faq.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${index}`}
              className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-sm py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950"
            >
              <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                {faq.question}
              </span>
              <span
                aria-hidden
                className={`shrink-0 text-zinc-400 dark:text-zinc-500 ${
                  reduce
                    ? ""
                    : "transition-transform duration-300 ease-out"
                } ${isOpen ? "rotate-45" : ""}`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M8 3v10M3 8h10" />
                </svg>
              </span>
            </button>
            <div
              id={`faq-panel-${index}`}
              className={`grid ${
                reduce
                  ? ""
                  : "transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              } ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p className="pb-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
