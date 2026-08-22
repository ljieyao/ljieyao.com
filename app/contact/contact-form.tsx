"use client";

import { useState } from "react";

const BUDGET_OPTIONS = ["RM 5K", "RM 5-10K", "RM 10-20K", "RM 20K+"] as const;

const inputClassName =
  "w-full rounded-lg border border-zinc-200 bg-transparent px-3.5 py-2.5 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50 dark:focus:border-zinc-400";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Name
          </span>
          <input
            type="text"
            name="name"
            required
            placeholder="Your name"
            className={inputClassName}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className={inputClassName}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Subject
          </span>
          <input
            type="text"
            name="subject"
            required
            placeholder="What is this about?"
            className={inputClassName}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Budget
          </span>
          <select name="budget" className={inputClassName} defaultValue="">
            <option value="" disabled>
              Select a range
            </option>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-1.5">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Comment
        </span>
        <textarea
          name="comment"
          required
          rows={5}
          placeholder="Tell me about your project…"
          className={inputClassName}
        />
      </label>

      {submitted ? (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          Thanks! The form backend is coming soon — in the meantime, reach me
          directly on{" "}
          <a
            href="https://api.whatsapp.com/send?phone=601164110281"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2"
          >
            WhatsApp
          </a>{" "}
          or{" "}
          <a
            href="mailto:ljieyao0210@gmail.com"
            className="font-medium underline underline-offset-2"
          >
            email
          </a>
          .
        </div>
      ) : (
        <button
          type="submit"
          className="h-11 justify-self-start rounded-full bg-zinc-950 px-8 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300"
        >
          Send message
        </button>
      )}
    </form>
  );
}
