import type { Metadata } from "next";
import { getAllPosts } from "@/lib/content";
import { PostList } from "../components/post-list";
import { Reveal } from "../components/reveal";

export const metadata: Metadata = {
  title: "Blog — JY Liu",
  description:
    "Writing on engineering, technology trends, business decision-making, and career reflections by JY Liu.",
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Blog
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Notes on engineering, technology trends, and career reflections.
      </p>

      <Reveal className="mt-12">
        <PostList posts={posts} />
      </Reveal>
    </main>
  );
}
