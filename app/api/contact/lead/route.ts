import { NextRequest, NextResponse } from "next/server";

/**
 * Public lead / bid-request endpoint.
 *
 * Unlike /api/contact/plant-care this route is intentionally unauthenticated —
 * it backs the "request a bid" forms on the homepage and the fire-wise /
 * water-smart / native landscape lead pages, where prospects are not logged in.
 *
 * Submissions are validated and logged. Wire up an email provider or database
 * where indicated to deliver leads to the inbox; until then they are captured
 * in the server logs so nothing is lost during setup.
 */

interface LeadFormData {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  service?: string;
  message?: string;
}

// Lightweight in-memory capture so leads submitted before an email/DB provider
// is configured are still retrievable from a running instance.
const leads: (LeadFormData & { receivedAt: string })[] = [];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  let data: LeadFormData;

  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Name plus at least one way to reach the prospect back.
  if (!data.name?.trim()) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  const hasPhone = Boolean(data.phone?.trim());
  const hasEmail = Boolean(data.email?.trim());
  if (!hasPhone && !hasEmail) {
    return NextResponse.json(
      { error: "Please provide a phone number or email so we can reach you." },
      { status: 400 }
    );
  }
  if (hasEmail && !isValidEmail(data.email!.trim())) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const lead = {
    name: data.name.trim(),
    phone: data.phone?.trim() ?? "",
    email: data.email?.trim() ?? "",
    city: data.city?.trim() ?? "",
    service: data.service?.trim() ?? "General inquiry",
    message: data.message?.trim() ?? "",
    receivedAt: new Date().toISOString(),
  };

  leads.push(lead);

  // TODO: deliver the lead — e.g. Resend/SendGrid email or a database insert.
  // Logged here so submissions are captured during setup.
  console.info("[lead] new bid request:", JSON.stringify(lead));

  return NextResponse.json({
    ok: true,
    message: "Thanks — your request came through. We'll be in touch within one business day.",
  });
}
