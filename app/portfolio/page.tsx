import type { Metadata } from "next";
import { getAllPortfolios } from "@/lib/content";
import { PortfolioList } from "../components/portfolio-list";

export const metadata: Metadata = {
  title: "Portfolio — JY Liu",
  description:
    "Selected projects and case studies by JY Liu — web platforms, mobile apps, e-commerce, and integrations.",
  alternates: {
    canonical: "/portfolio",
  },
};

export default async function PortfolioIndexPage() {
  const items = await getAllPortfolios();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Portfolio
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Selected projects and case studies.
      </p>
      <div className="mt-12">
        <PortfolioList items={items} />
      </div>
    </main>
  );
}
