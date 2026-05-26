import { CATEGORY_KEYWORDS } from "@/lib/constants";

export function toMonthKey(dateInput = new Date()) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return toMonthKey(new Date());
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(amount || 0));
}

export function formatDate(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function categorizeText(text = "") {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => lower.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  return "Other";
}

export function getReadableOcrLines(text = "") {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function detectMerchant(text = "") {
  const lines = getReadableOcrLines(text).filter(
    (line) => !/invoice|receipt|tax|gst|date|time|total|amount|cash|card|upi|qty|rate|price/i.test(line)
  );

  return lines[0]?.replace(/[^\w\s&.'-]/g, "").slice(0, 60) || "";
}

export function detectDate(text = "") {
  const patterns = [
    /\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/,
    /\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b/,
    /\b(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{2,4})\b/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;

    let parsed;
    if (pattern === patterns[1]) {
      parsed = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    } else if (pattern === patterns[2]) {
      parsed = new Date(`${match[1]} ${match[2]} ${match[3]}`);
    } else {
      const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
      parsed = new Date(year, Number(match[2]) - 1, Number(match[1]));
    }

    if (!Number.isNaN(parsed.getTime())) return formatDate(parsed);
  }

  return formatDate(new Date());
}

export function detectAmount(text = "") {
  const totalLine = getReadableOcrLines(text)
    .reverse()
    .find((line) => /grand\s*total|net\s*amount|amount\s*due|total|balance\s*due|payable/i.test(line));

  const source = totalLine || text;
  const matches = [...source.matchAll(/(?:rs\.?|inr|\u20b9)?\s*([0-9]{1,6}(?:[, ]?[0-9]{3})*(?:\.[0-9]{1,2})?)/gi)]
    .map((match) => Number(match[1].replace(/[, ]/g, "")))
    .filter((value) => Number.isFinite(value) && value > 0);

  return matches.length ? Math.max(...matches).toFixed(2) : "";
}

export function parseOcrText(text = "") {
  const rawText = text.trim();
  const lines = getReadableOcrLines(rawText);
  const merchant = detectMerchant(rawText);
  const amount = detectAmount(rawText);
  const date = detectDate(rawText);
  const category = categorizeText(`${merchant}\n${rawText}`);

  return {
    title: merchant || "Scanned bill",
    amount,
    date,
    category,
    rawText,
    lines
  };
}
