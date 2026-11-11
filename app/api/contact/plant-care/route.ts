import { NextRequest, NextResponse } from 'next/server';
import { siteConfig } from '@/lib/siteConfig';
import { parseLead, leadEmail, leadInbox } from '@/lib/leads';
import { sendEmail } from '@/lib/email';

/**
 * Plant-care consultation requests. Public, like /api/contact/lead: asking a
 * prospect to create an account before they can ask for help cost the lead.
 * The honeypot and first-touch attribution ride along exactly as they do on
 * the main lead form.
 */
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  propertySize?: string;
  service: string;
  message: string;
  /** Honeypot — real visitors never see or fill this. */
  website?: string;
  attribution?: unknown;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const formData: ContactFormData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'location', 'service', 'message'];
    for (const field of requiredFields) {
      if (!formData[field as keyof ContactFormData]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Same validation, formatting, and delivery as the public lead form.
    const parsed = parseLead({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      city: formData.location,
      service: `Plant care — ${formData.service}`,
      message: formData.propertySize
        ? `Property size: ${formData.propertySize}\n\n${formData.message}`
        : formData.message,
      page: '/plant-care',
      website: formData.website,
      attribution: formData.attribution,
    });
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const email = leadEmail(parsed.lead);
    const sent = await sendEmail({ to: leadInbox(), ...email, replyTo: parsed.lead.email });
    if (!sent.ok) {
      console.error(`[plant-care] email delivery failed (${sent.error}); request follows:`, JSON.stringify(parsed.lead));
      return NextResponse.json(
        { error: `Sorry — your request didn't go through. Please call or text ${siteConfig.phone}.` },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Your consultation request has been received. We will contact you within 24 hours.',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing plant care contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}
