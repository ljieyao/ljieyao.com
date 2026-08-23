import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllExperience,
  getAllPortfolios,
  getAllPosts,
} from "@/lib/content";
import { ExperienceList } from "./components/experience-list";
import { HomeHero } from "./components/home-hero";
import { PortfolioGrid } from "./components/portfolio-grid";
import { PostList } from "./components/post-list";
import { Reveal } from "./components/reveal";

export const metadata: Metadata = {
  title: "JY Liu — Solutions Architect | Technical Lead | Senior Full-Stack Engineer",
  description:
    "Solutions Architect & Technical Lead (12+ years) — enterprise, fintech & integration-heavy platforms. VFS Global consular systems, CXM Direct payments (235k+ users, 12 PSPs), AI-enabled product engineering. MBA (Business Analytics), University of Malaya.",
};

function SectionHeading({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-3xl font-semibold tracking-tighter text-zinc-950 sm:text-4xl dark:text-zinc-50">
        {title}
      </h2>
      {href !== undefined && linkLabel !== undefined && (
        <Link
          href={href}
          className="cursor-pointer text-sm text-zinc-500 transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-400 dark:focus-visible:ring-offset-zinc-950"
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
      <HomeHero />

      <section className="border-t border-zinc-200 dark:border-zinc-800">
        <Reveal className="mx-auto w-full max-w-5xl px-6 py-20">
          <SectionHeading title="Experience" />
          <ExperienceList jobs={experience} />
        </Reveal>
      </section>

      <section className="border-t border-zinc-200 dark:border-zinc-800">
        <Reveal className="mx-auto w-full max-w-5xl px-6 py-28">
          <SectionHeading title="Selected Works" href="/works" linkLabel="All works" />
          <PortfolioGrid
            items={portfolios.slice(0, 3)}
            headingLevel="h3"
            gridClassName="mt-10 sm:grid-cols-2"
            featuredFirst
          />
        </Reveal>
      </section>

      <section className="border-t border-zinc-200 dark:border-zinc-800">
        <Reveal className="mx-auto w-full max-w-5xl px-6 py-20">
          <SectionHeading title="Latest Writing" href="/blog" linkLabel="All posts" />
          <div className="mt-4">
            <PostList
              posts={posts.slice(0, 2)}
              showCategoryPill={false}
              variant="preview"
              headingLevel="h3"
            />
          </div>
        </Reveal>
      </section>

      <section className="bg-zinc-950 dark:bg-zinc-50">
        <Reveal className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-28 text-center">
          <h2 className="text-3xl font-semibold tracking-tighter text-zinc-50 sm:text-4xl dark:text-zinc-950">
            Have a project in mind?
          </h2>
          <p className="mt-4 max-w-md text-zinc-400 dark:text-zinc-600">
            From idea to production — let&apos;s build something together.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-zinc-50 px-8 text-sm font-medium text-zinc-950 transition-[background-color,box-shadow,transform] duration-200 hover:bg-zinc-300 hover:ring-2 hover:ring-accent hover:ring-offset-2 hover:ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 motion-safe:active:scale-[0.98] dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-700 dark:hover:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-50"
            >
              Get in touch
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=601164110281"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-white/30 px-8 text-sm font-medium text-zinc-100 transition-[border-color,box-shadow,transform] duration-200 hover:border-white/60 hover:ring-2 hover:ring-accent hover:ring-offset-2 hover:ring-offset-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 motion-safe:active:scale-[0.98] dark:border-zinc-950/40 dark:text-zinc-800 dark:hover:border-zinc-950/70 dark:hover:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-50"
            >
              WhatsApp
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
