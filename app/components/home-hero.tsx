import type { CSSProperties } from "react";

/**
 * Hero entrance: one-time load stagger (eyebrow → headline → subtext → CTA),
 * done in under 0.7s via pure CSS (.hero-rise in globals.css) so the
 * above-the-fold text paints without client JS. Static render when the user
 * prefers reduced motion.
 */
export function HomeHero() {
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
      {items.map(({ key, className, children }, index) => (
        <p
          key={key}
          className={`hero-rise ${className}`}
          style={{ "--rise-delay": `${index * 70}ms` } as CSSProperties}
        >
          {children}
        </p>
      ))}
      <a
        href="https://api.whatsapp.com/send?phone=601164110281"
        target="_blank"
        rel="noopener noreferrer"
        className="hero-rise mt-10 inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-zinc-950 px-8 font-medium text-white transition-[background-color,transform] duration-200 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300 dark:focus-visible:ring-offset-zinc-950"
        style={{ "--rise-delay": "210ms" } as CSSProperties}
      >
        Let&apos;s Talk
      </a>
    </section>
  );
}
