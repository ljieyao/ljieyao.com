import type { Metadata } from "next";
import { ContactForm } from "./contact-form";
import { Faq } from "./faq";
import { Reveal } from "../components/reveal";

export const metadata: Metadata = {
  title: "Contact — JY Liu",
  description:
    "Get in touch with JY Liu for web and mobile app projects — via WhatsApp, email, or the contact form.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Contact
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Have a project in mind? Tell me about it — I usually reply within a
        day.
      </p>

      <Reveal className="mt-10 grid gap-4 sm:grid-cols-2">
        <a
          href="https://api.whatsapp.com/send?phone=601164110281"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer rounded-2xl border border-zinc-200 p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:active:scale-[0.98] dark:border-zinc-800 dark:hover:border-zinc-600 dark:focus-visible:ring-offset-zinc-950"
        >
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            WhatsApp
          </p>
          <p className="mt-1 text-sm text-zinc-950 dark:text-zinc-50">
            +60 11-6411 0281
          </p>
        </a>
        <a
          href="mailto:ljieyao0210@gmail.com"
          className="cursor-pointer rounded-2xl border border-zinc-200 p-5 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:active:scale-[0.98] dark:border-zinc-800 dark:hover:border-zinc-600 dark:focus-visible:ring-offset-zinc-950"
        >
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Email
          </p>
          <p className="mt-1 text-sm text-zinc-950 dark:text-zinc-50">
            ljieyao0210@gmail.com
          </p>
        </a>
      </Reveal>

      <Reveal className="mt-12 rounded-2xl border border-zinc-200 p-6 sm:p-8 dark:border-zinc-800">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Send a message
        </h2>
        <div className="mt-6">
          <ContactForm />
        </div>
      </Reveal>

      <Reveal className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Frequently asked questions
        </h2>
        <Faq />
      </Reveal>
    </main>
  );
}
