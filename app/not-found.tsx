import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "./components/reveal";

export const metadata: Metadata = {
  title: "Page Not Found — JY Liu",
  description: "The page you are looking for does not exist or has moved.",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
      <p className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        Error 404
      </p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl">
        Page not found
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        The page you are looking for doesn&apos;t exist or has moved.
      </p>
      <Reveal className="mt-10">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-zinc-950 px-8 font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300 dark:focus-visible:ring-offset-zinc-950"
          >
            Back home
          </Link>
          <Link
            href="/contact"
            className="cursor-pointer font-medium text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:ring-offset-zinc-950"
          >
            Get in touch
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
