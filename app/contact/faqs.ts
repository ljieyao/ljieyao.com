// Shared FAQ data — imported by both the client accordion (faq.tsx) and the
// server-side FAQPage JSON-LD in page.tsx. Keep this module free of
// React/client directives.
export const FAQS = [
  {
    question: "What services do you offer?",
    answer:
      "Full-stack web and mobile app development — Next.js/React frontends, Node.js and Python backends, REST/GraphQL APIs, cloud deployment and DevOps, plus technical consulting. I take products from idea to production, including architecture, database design, and CI/CD.",
  },
  {
    question: "What's your typical project timeline?",
    answer:
      "It depends on scope. A focused MVP or prototype takes around 2–4 weeks. A full production web or mobile app typically runs 2–3 months. Larger platforms with integrations (payments, third-party APIs, admin dashboards) can take 3+ months. I'll give you a concrete estimate after we scope the work.",
  },
  {
    question: "What are your rates?",
    answer:
      "Projects typically start from RM 5K for a small MVP, RM 5–10K for a polished marketing site or simple app, RM 10–20K for a full product build, and RM 20K+ for complex platforms — matching the budget tiers in the form above. Larger or ongoing engagements get a custom quote.",
  },
  {
    question: "Do you work remotely?",
    answer:
      "Yes. I'm based in Kuala Lumpur, Malaysia, and work with clients globally. Most communication is async (email, WhatsApp, shared docs) with video calls for kickoffs and reviews — so time zones are rarely a problem.",
  },
  {
    question: "How do we start?",
    answer:
      "Fill in the contact form above or message me on WhatsApp. The initial consultation is free — we'll discuss your idea, scope, and timeline, and I'll follow up with a proposal within a few days.",
  },
] as const;
