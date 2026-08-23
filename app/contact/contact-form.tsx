"use client";

import Script from "next/script";
import { useState } from "react";

const BUDGET_OPTIONS = ["RM 5K", "RM 5-10K", "RM 10-20K", "RM 20K+"] as const;

const TURNSTILE_SITEKEY = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY ?? "";
const WORKER_URL =
  process.env.NEXT_PUBLIC_CONTACT_WORKER_URL ??
  "https://contact-form.ljieyao.workers.dev/api/contact";

const inputClassName =
  "w-full rounded-xl border border-zinc-200 bg-transparent px-3.5 py-2.5 text-sm text-zinc-950 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500 dark:border-zinc-700 dark:text-zinc-50 dark:focus:border-zinc-400";

type Status = "idle" | "loading" | "success" | "error";

interface WorkerErrorBody {
  error?: string;
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const turnstileToken = String(formData.get("cf-turnstile-response") ?? "");
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      budget: String(formData.get("budget") ?? ""),
      comment: String(formData.get("comment") ?? ""),
      ...(turnstileToken ? { turnstileToken } : {}),
    };

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response
          .json()
          .catch(() => null)) as WorkerErrorBody | null;
        setStatus("error");
        setErrorMessage(
          body?.error ?? "Something went wrong. Please try again.",
        );
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  const loading = status === "loading";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {TURNSTILE_SITEKEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
          async
          defer
        />
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Name
          </span>
          <input
            type="text"
            name="name"
            required
            maxLength={100}
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
            maxLength={254}
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
            maxLength={200}
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
          minLength={10}
          maxLength={5000}
          placeholder="Tell me about your project…"
          className={inputClassName}
        />
      </label>

      {TURNSTILE_SITEKEY && (
        <div
          className="cf-turnstile"
          data-sitekey={TURNSTILE_SITEKEY}
          data-action="contact"
          data-theme="auto"
        />
      )}

      {status === "error" && errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {errorMessage}
        </div>
      )}

      {status === "success" ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          Thanks — your message has been sent! If you don&apos;t hear back soon,
          reach me directly on{" "}
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
          disabled={loading}
          className="inline-flex h-11 cursor-pointer items-center gap-2 justify-self-start rounded-full bg-zinc-950 px-8 text-sm font-medium text-white transition-[background-color,transform] duration-200 hover:bg-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-safe:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-300 dark:focus-visible:ring-offset-zinc-950"
        >
          {loading && (
            <span
              aria-hidden="true"
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          )}
          {loading ? "Sending…" : "Send message"}
        </button>
      )}
    </form>
  );
}
