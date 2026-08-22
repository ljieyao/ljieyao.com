export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-32 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
        Full Stack Web &amp; Mobile App Engineer
      </p>
      <h1 className="mt-4 text-5xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl">
        JY Liu
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
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
    </main>
  );
}
