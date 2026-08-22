import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} JY Liu · Full Stack Web &amp; Mobile App
          Engineer
        </p>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/works"
            className="text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Works
          </Link>
          <Link
            href="/blog"
            className="text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Blog
          </Link>
          <Link
            href="/contact"
            className="text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Contact
          </Link>
          <a
            href="mailto:ljieyao0210@gmail.com"
            className="text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Email
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=601164110281"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
