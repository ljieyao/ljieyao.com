import type { CSSProperties } from "react";

/**
 * Hero entrance: one-time load stagger (eyebrow → headline → subtext → CTA),
 * done in under 0.7s via pure CSS (.hero-rise in globals.css) so the
 * above-the-fold text paints without client JS. Static render when the user
 * prefers reduced motion. The headline is the page's single semantic <h1>.
 */
export function HomeHero() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 pt-24 pb-24 text-center sm:py-32">
      <div className="hero-rise flex items-center justify-center gap-3" style={{ "--rise-delay": "0ms" } as CSSProperties}>
        <img src="/images/logo.png" alt="" width="48" height="48" className="h-12 w-12" />
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Solutions Architect · Technical Lead · Senior Full-Stack Engineer
        </p>
      </div>
      <h1
        className="hero-rise mt-4 text-5xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl"
        style={{ "--rise-delay": "70ms" } as CSSProperties}
      >
        JY Liu
      </h1>
      <p
        className="hero-rise mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400"
        style={{ "--rise-delay": "140ms" } as CSSProperties}
      >
        12+ years architecting & shipping enterprise, fintech & integration-heavy platforms — cloud-native, payments at scale (235k+ users), and AI-enabled workflows. MBA (Business Analytics), University of Malaya.
      </p>
      <a
        href="https://api.whatsapp.com/send?phone=601164110281"
        target="_blank"
        rel="noopener noreferrer"
        className="hero-rise mt-10 inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-zinc-950 px-8 font-medium text-white transition-[background-color,transform] duration-200 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300 dark:focus-visible:ring-offset-zinc-950"
        style={{ "--rise-delay": "210ms" } as CSSProperties}
      >
        WhatsApp me
      </a>
    </section>
  );
}
