import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllExperience,
  getAllPortfolios,
  getAllPosts,
} from "@/lib/content";
import { categoryLabel, formatDate, formatExperienceRange } from "@/lib/format";

export const metadata: Metadata = {
  title: "JY Liu — Full Stack Engineer",
  description:
    "JY Liu is a full stack web & mobile app engineer based in Malaysia, building products across web, mobile, and cloud. Portfolio, case studies, and writing at ljieyao.com.",
};

function SectionHeading({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        {title}
      </h2>
      {href !== undefined && linkLabel !== undefined && (
        <Link
          href={href}
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

export default async function Home() {
  const [experience, portfolios, posts] = await Promise.all([
    getAllExperience(),
    getAllPortfolios(),
    getAllPosts(),
  ]);

  return (
    <main className="flex flex-1 flex-col">
      <section className="mx-auto w-full max-w-5xl px-6 py-24 text-center sm:py-32">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          Full Stack Web &amp; Mobile App Engineer
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl">
          JY Liu
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          I design and build web and mobile products end to end — from idea to
          production.
        </p>
        <a
          href="https://api.whatsapp.com/send?phone=601164110281"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-zinc-950 px-8 font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300"
        >
          Let&apos;s Talk
        </a>
      </section>

      <section className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <SectionHeading title="Experience" />
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {experience.map((job) => (
              <li key={`${job.company}-${job.start}`} className="relative pl-5">
                <span
                  aria-hidden
                  className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500"
                />
                <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  {job.role}
                </h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {job.company}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  {formatExperienceRange(job.start, job.end)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <SectionHeading title="Selected Works" href="/works" linkLabel="All works" />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {portfolios.slice(0, 3).map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/portfolio/${item.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-zinc-200 p-6 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                >
                  <h3 className="text-base font-semibold tracking-tight text-zinc-950 group-hover:underline dark:text-zinc-50">
                    {item.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {item.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.stack.slice(0, 3).map((tech) => (
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
        </div>
      </section>

      <section className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto w-full max-w-5xl px-6 py-16">
          <SectionHeading title="Latest Writing" href="/blog" linkLabel="All posts" />
          <ul className="mt-10 divide-y divide-zinc-200 dark:divide-zinc-800">
            {posts.slice(0, 2).map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block py-6">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                    <span aria-hidden>·</span>
                    <span>{categoryLabel(post.category)}</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-zinc-950 group-hover:underline dark:text-zinc-50">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {post.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Have a project in mind?
          </h2>
          <p className="mt-4 max-w-md text-zinc-600 dark:text-zinc-400">
            From idea to production — let&apos;s build something together.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300"
            >
              Get in touch
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=601164110281"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-8 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-400"
            >
              WhatsApp me
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
