const dateFormatter = new Intl.DateTimeFormat("en-MY", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

/** "2024-09-22T12:28:51Z" → "22 Sep 2024" */
export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

const monthFormatter = new Intl.DateTimeFormat("en-MY", {
  year: "numeric",
  month: "short",
});

/** "2023-01" → "Jan 2023" */
export function formatMonth(yyyyMm: string): string {
  // Append day to satisfy parsers that expect a full date
  return monthFormatter.format(new Date(`${yyyyMm}-01`));
}

/** "2023-01" + null → "Jan 2023 — Now"; "2020-01" + "2022-12" → "Jan 2020 — Dec 2022" */
export function formatExperienceRange(start: string, end: string | null): string {
  return end === null
    ? `${formatMonth(start)} — Now`
    : `${formatMonth(start)} — ${formatMonth(end)}`;
}

const CATEGORY_LABELS: Record<string, string> = {
  "feeling-check-in": "Feeling Check-in",
  trend: "Trend",
  technical: "Technical",
  project: "Project",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}
