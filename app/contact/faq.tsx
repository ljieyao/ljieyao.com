"use client";

import { useState } from "react";

const FAQS = [
  {
    question: "What services do you offer?",
    answer:
      "Full-stack web and mobile app development — Next.js/React frontends, Node.js and Python backends, REST/GraphQL APIs, cloud deployment and DevOps, plus technical consulting. I take products from idea to production, including architecture, database design, and CI/CD.",
  },
  {
    question: "What's your typical project timeline?",
    answer:
      "It depends on scope. A focused MVP or prototype takes around 2–4 weeks. A full production web or mobile app typically runs 2–3 months. Larger platforms with integrations (payments, third-party APIs, admin dashboards) can take 3+ months. I'll give you a concrete estimate after we scope the work.",
  },
  {
    question: "What are your rates?",
    answer:
      "Projects typically start from RM 5K for a small MVP, RM 5–10K for a polished marketing site or simple app, RM 10–20K for a full product build, and RM 20K+ for complex platforms — matching the budget tiers in the form above. Larger or ongoing engagements get a custom quote.",
  },
  {
    question: "Do you work remotely?",
    answer:
      "Yes. I'm based in Kuala Lumpur, Malaysia, and work with clients globally. Most communication is async (email, WhatsApp, shared docs) with video calls for kickoffs and reviews — so time zones are rarely a problem.",
  },
  {
    question: "How do we start?",
    answer:
      "Fill in the contact form above or message me on WhatsApp. The initial consultation is free — we'll discuss your idea, scope, and timeline, and I'll follow up with a proposal within a few days.",
  },
] as const;

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                {faq.question}
              </span>
              <span
                aria-hidden
                className={`shrink-0 text-zinc-400 transition-transform duration-200 dark:text-zinc-500 ${
                  isOpen ? "rotate-45" : ""
                }`}
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
              className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
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
