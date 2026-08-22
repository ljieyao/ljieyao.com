"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/works", label: "Works" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
        >
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
                className={`text-sm transition-colors ${
                  active
                    ? "font-medium text-zinc-950 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <a
            href="https://api.whatsapp.com/send?phone=601164110281"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 hidden h-9 items-center rounded-full bg-zinc-950 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300 sm:inline-flex"
          >
            Let&apos;s Talk
          </a>
        </div>
      </nav>
    </header>
  );
}
