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
          className="cursor-pointer text-sm text-zinc-500 transition-colors hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:ring-offset-zinc-950"
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
        <Reveal className="mx-auto w-full max-w-5xl px-6 py-16">
          <SectionHeading title="Experience" />
          <ExperienceList jobs={experience} />
        </Reveal>
      </section>

      <section className="border-t border-zinc-200 dark:border-zinc-800">
        <Reveal className="mx-auto w-full max-w-5xl px-6 py-16">
          <SectionHeading title="Selected Works" href="/works" linkLabel="All works" />
          <PortfolioGrid
            items={portfolios.slice(0, 3)}
            headingLevel="h3"
            gridClassName="mt-10 sm:grid-cols-2 lg:grid-cols-3"
          />
        </Reveal>
      </section>

      <section className="border-t border-zinc-200 dark:border-zinc-800">
        <Reveal className="mx-auto w-full max-w-5xl px-6 py-16">
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

      <section className="border-t border-zinc-200 dark:border-zinc-800">
        <Reveal className="mx-auto flex w-full max-w-5xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Have a project in mind?
          </h2>
          <p className="mt-4 max-w-md text-zinc-600 dark:text-zinc-400">
            From idea to production — let&apos;s build something together.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-zinc-950 px-8 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300 dark:focus-visible:ring-offset-zinc-950"
            >
              Get in touch
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=601164110281"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-zinc-300 px-8 text-sm font-medium text-zinc-700 transition-[border-color,transform] duration-200 hover:border-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-400 dark:focus-visible:ring-offset-zinc-950"
            >
              WhatsApp me
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
