import { NextRequest, NextResponse } from 'next/server';

// Public lead-capture endpoint for the homepage "Request a Consultation" form.
//
// Unlike /api/contact/plant-care this is intentionally unauthenticated — it is
// the top of the new-customer funnel, so we never want to put a login wall in
// front of a prospect who just wants to reach out.

interface LeadFormData {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  message: string;
  timestamp: string;
}

// In-memory storage for leads (replace with a database / CRM in production).
const leads: LeadFormData[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<LeadFormData>;

    // Validate required fields.
    const requiredFields: (keyof LeadFormData)[] = ['name', 'email', 'message'];
    for (const field of requiredFields) {
      if (!body[field] || String(body[field]).trim() === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email!)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const lead: LeadFormData = {
      name: body.name!,
      email: body.email!,
      phone: body.phone,
      city: body.city,
      message: body.message!,
      timestamp: new Date().toISOString(),
    };

    // In production, you would:
    // 1. Save to database
    // 2. Send email notification to admin
    // 3. Send confirmation email to the prospect
    // 4. Push the lead into a CRM
    leads.push(lead);

    console.log('New consultation lead:', {
      name: lead.name,
      email: lead.email,
      city: lead.city,
      leadCount: leads.length,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thanks — we've received your request and will be in touch shortly.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing consultation lead:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}
