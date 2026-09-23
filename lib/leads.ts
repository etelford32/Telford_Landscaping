/**
 * Validation and email formatting for consultation / bid requests. Kept free
 * of Next.js imports so it can be unit-tested directly.
 */
import { siteConfig } from "./siteConfig";
import { CAMPAIGN_PARAMS, type Attribution } from "./analytics";

export interface Lead {
  name: string;
  phone: string;
  email: string;
  city: string;
  service: string;
  message: string;
  /** Path the form was submitted from. */
  page: string;
  /** First-touch record from the browser (lib/analytics.ts); may be empty. */
  attribution: Partial<Attribution>;
  /** The hidden honeypot field was filled in — probably a bot. */
  suspectedSpam: boolean;
  receivedAt: Date;
}

export type ParseResult = { ok: true; lead: Lead } | { ok: false; error: string };

export const MESSAGE_MAX = 5000;
const ATTRIBUTION_KEYS = ["landing_page", "referrer", "first_seen", ...CAMPAIGN_PARAMS] as const;

/** Where leads are delivered. LEAD_EMAIL_TO overrides the address in siteConfig. */
export function leadInbox(): string {
  return process.env.LEAD_EMAIL_TO || siteConfig.email;
}

function field(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function parseLead(body: unknown, receivedAt = new Date()): ParseResult {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid request body." };
  const data = body as Record<string, unknown>;

  const name = field(data.name, 120);
  const phone = field(data.phone, 40);
  const email = field(data.email, 254);
  const rawMessage = typeof data.message === "string" ? data.message.trim() : "";

  // Name plus at least one way to reach the prospect back.
  if (!name) return { ok: false, error: "Please enter your name." };
  if (!phone && !email) {
    return { ok: false, error: "Please provide a phone number or email so we can reach you." };
  }
  if (email && !isValidEmail(email)) return { ok: false, error: "Please enter a valid email address." };
  if (rawMessage.length > MESSAGE_MAX) {
    return { ok: false, error: `Please keep project details under ${MESSAGE_MAX.toLocaleString()} characters.` };
  }

  const attribution: Partial<Attribution> = {};
  if (data.attribution && typeof data.attribution === "object") {
    const raw = data.attribution as Record<string, unknown>;
    for (const key of ATTRIBUTION_KEYS) {
      const value = field(raw[key], 500);
      if (value) attribution[key] = value;
    }
  }

  return {
    ok: true,
    lead: {
      name,
      phone,
      email,
      city: field(data.city, 80),
      service: field(data.service, 120) || "General inquiry",
      message: rawMessage,
      page: field(data.page, 300),
      attribution,
      // Flagged rather than dropped: a browser autofilling the hidden field
      // must never cost a real lead.
      suspectedSpam: field(data.website, 500) !== "",
      receivedAt,
    },
  };
}

/* ── Email ─────────────────────────────────────────────────────────────── */

function formatDate(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  const pacific = d.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "medium",
    timeStyle: "short",
  });
  return `${pacific} PT`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** "How they found the site" rows, in reading order. */
function sourceRows(lead: Lead): [string, string][] {
  const a = lead.attribution;
  const rows: [string, string][] = [];
  if (lead.page) rows.push(["Submitted from", lead.page]);
  if (a.landing_page) {
    rows.push(["First visit", a.first_seen ? `${a.landing_page} — ${formatDate(a.first_seen)}` : a.landing_page]);
  }
  if (a.landing_page || a.referrer) {
    rows.push(["Referrer", a.referrer || "none (typed in, bookmark, or app)"]);
  }
  const campaign = [a.utm_source, a.utm_medium, a.utm_campaign, a.utm_term, a.utm_content].filter(Boolean);
  if (campaign.length) rows.push(["Campaign", campaign.join(" / ")]);
  const clickIds = (["gclid", "gbraid", "wbraid", "fbclid", "msclkid"] as const).filter((k) => a[k]);
  if (clickIds.length) rows.push(["Ad click", clickIds.join(", ")]);
  return rows;
}

export function leadEmail(lead: Lead): { subject: string; text: string; html: string } {
  const subject = `${lead.suspectedSpam ? "[possible spam] " : ""}New lead: ${lead.name}${
    lead.city ? ` (${lead.city})` : ""
  } — ${lead.service}`.replace(/[\r\n]+/g, " ");

  const contact: [string, string][] = [
    ["Name", lead.name],
    ["Phone", lead.phone || "—"],
    ["Email", lead.email || "—"],
    ["City", lead.city || "—"],
    ["Service", lead.service],
    ["Received", formatDate(lead.receivedAt)],
  ];
  const sources = sourceRows(lead);
  const pad = (rows: [string, string][]) => rows.map(([k, v]) => `${`${k}:`.padEnd(17)}${v}`).join("\n");

  const text = [
    `New consultation request from ${siteConfig.domain}`,
    ...(lead.suspectedSpam ? ["", "(The hidden anti-spam field was filled in — this may be a bot.)"] : []),
    "",
    pad(contact),
    "",
    "Project details:",
    lead.message || "(none given)",
    ...(sources.length ? ["", "— How they found the site —", pad(sources)] : []),
    "",
    lead.email ? "Reply to this email to answer them directly." : "No email given — call or text them back.",
  ].join("\n");

  const phoneDigits = lead.phone.replace(/[^\d+]/g, "");
  const cell = (k: string, v: string) =>
    `<tr><td style="padding:4px 16px 4px 0;color:#6b7280;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:4px 0;color:#111827">${v}</td></tr>`;
  const contactHtml = contact
    .map(([k, v]) => {
      if (k === "Phone" && phoneDigits) return cell(k, `<a href="tel:${escapeHtml(phoneDigits)}">${escapeHtml(v)}</a>`);
      if (k === "Email" && lead.email) return cell(k, `<a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(v)}</a>`);
      return cell(k, escapeHtml(v));
    })
    .join("");

  const html = `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.5;color:#111827">
<h2 style="margin:0 0 4px;font-size:19px">New consultation request</h2>
<p style="margin:0 0 16px;color:#6b7280">from ${escapeHtml(siteConfig.domain)}</p>
${lead.suspectedSpam ? '<p style="margin:0 0 16px;padding:8px 12px;background:#fef3c7;border-radius:6px">The hidden anti-spam field was filled in — this may be a bot.</p>' : ""}
<table style="border-collapse:collapse">${contactHtml}</table>
<h3 style="margin:20px 0 6px;font-size:16px">Project details</h3>
<p style="margin:0;white-space:pre-wrap">${escapeHtml(lead.message || "(none given)")}</p>
${
  sources.length
    ? `<h3 style="margin:20px 0 6px;font-size:16px">How they found the site</h3><table style="border-collapse:collapse">${sources
        .map(([k, v]) => cell(k, escapeHtml(v)))
        .join("")}</table>`
    : ""
}
<p style="margin:20px 0 0;color:#6b7280">${
    lead.email ? "Reply to this email to answer them directly." : "No email given — call or text them back."
  }</p>
</body></html>`;

  return { subject, text, html };
}
