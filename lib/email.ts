/**
 * Outbound email via Resend's REST API (https://resend.com/docs/api-reference/emails/send-email).
 * Plain fetch — no SDK dependency.
 *
 * Env:
 *   RESEND_API_KEY   required in production; without it sends fail loudly
 *   LEAD_EMAIL_FROM  sender, e.g. "Telford Landscaping <leads@telfordlandscaping.com>"
 *                    once that domain is verified in Resend. The default,
 *                    onboarding@resend.dev, can only deliver to the Resend
 *                    account owner's own address — fine while that is the inbox.
 */
const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Telford Landscaping <onboarding@resend.dev>";

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  html?: string;
  /** Lets a reply from the inbox go straight to the prospect. */
  replyTo?: string;
}

export type SendResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendEmail(email: OutgoingEmail): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Local dev without a key: print what would have gone out so the form is
    // still testable. Production (including Vercel previews) must fail instead
    // of pretending a lead was delivered.
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email] RESEND_API_KEY not set — not sent.\nTo: ${email.to}\nSubject: ${email.subject}\n\n${email.text}`);
      return { ok: true, id: "dev-not-sent" };
    }
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.LEAD_EMAIL_FROM || DEFAULT_FROM,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        html: email.html,
        reply_to: email.replyTo,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      return { ok: false, error: `Resend ${res.status}: ${body.message ?? res.statusText}` };
    }
    return { ok: true, id: body.id ?? "" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
