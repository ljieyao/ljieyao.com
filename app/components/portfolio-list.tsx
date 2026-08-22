import Link from "next/link";
import type { PortfolioWithBody } from "@/lib/content";

export function PortfolioList({ items }: { items: PortfolioWithBody[] }) {
  if (items.length === 0) {
    return (
      <p className="text-zinc-500 dark:text-zinc-400">
        No projects published yet.
      </p>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.slug}>
          <Link
            href={`/portfolio/${item.slug}`}
            className="group flex h-full flex-col rounded-2xl border border-zinc-200 p-6 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
          >
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950 group-hover:underline dark:text-zinc-50">
              {item.title}
            </h2>
            <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {item.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {item.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-zinc-200 px-2.5 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                >
                  {tech}
                </span>
              ))}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
