import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/lib/siteConfig";
import { parseLead, leadEmail, leadInbox } from "@/lib/leads";
import { sendEmail } from "@/lib/email";

/**
 * Public lead / consultation-request endpoint.
 *
 * Unlike /api/contact/plant-care this route is intentionally unauthenticated —
 * it backs the "request a free consultation / bid" forms on the homepage, the
 * portfolio, and the fire-wise / water-smart / native lead pages, where
 * prospects are not logged in.
 *
 * Each lead is emailed to the inbox (lib/email.ts, via Resend). The prospect
 * is only told "request received" once the email has actually been accepted;
 * if delivery fails they are asked to call or email instead, and the full
 * lead is written to the server log so it can still be recovered.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = parseLead(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { lead } = parsed;

  const email = leadEmail(lead);
  const sent = await sendEmail({
    to: leadInbox(),
    ...email,
    replyTo: lead.email || undefined,
  });

  if (!sent.ok) {
    console.error(`[lead] email delivery failed (${sent.error}); lead follows:`, JSON.stringify(lead));
    return NextResponse.json(
      {
        error: `Sorry — your request didn't go through. Please call or text ${siteConfig.phone}, or email ${siteConfig.email}.`,
      },
      { status: 502 }
    );
  }

  console.info(`[lead] emailed ${sent.id}: ${email.subject}`);
  return NextResponse.json({
    ok: true,
    message: "Thanks — your request came through. We'll be in touch within one business day.",
  });
}
