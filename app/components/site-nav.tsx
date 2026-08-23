"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/works", label: "Works" },
  { href: "/blog", label: "Blog" },
] as const;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 rounded-sm";

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className={`cursor-pointer flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 ${focusRing}`}
          aria-label="JY Liu — Home"
        >
          <img src="/images/logo.png" alt="" width="28" height="28" className="h-7 w-7" />
          JY Liu
        </Link>
        <div className="flex items-center gap-2 sm:gap-6">
          {NAV_LINKS.map(({ href, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative cursor-pointer rounded-sm text-sm transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-accent after:transition-transform after:duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950 ${
                  active
                    ? "font-medium text-zinc-950 after:scale-x-100 dark:text-zinc-50"
                    : "text-zinc-500 after:scale-x-0 hover:after:scale-x-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                } ${focusRing}`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="ml-2 inline-flex h-9 cursor-pointer items-center rounded-full bg-zinc-950 px-4 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300 dark:focus-visible:ring-offset-zinc-950"
          >
            Contact
          </Link>
        </div>
      </nav>
    </header>
  );
}
