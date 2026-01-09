import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  propertySize?: string;
  service: string;
  message: string;
  userId?: string;
  timestamp: string;
}

// In-memory storage for contact submissions (replace with database in production)
const contactSubmissions: ContactFormData[] = [];

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Store the submission (in production, save to database)
    contactSubmissions.push(formData);

    // In production, you would:
    // 1. Save to database
    // 2. Send email notification to admin
    // 3. Send confirmation email to user
    // 4. Integrate with CRM system

    console.log('Plant Care Contact Form Submission:', {
      ...formData,
      // Don't log sensitive data in production
      submissionCount: contactSubmissions.length
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Your consultation request has been received. We will contact you within 24 hours.',
        submissionId: contactSubmissions.length
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

// GET endpoint to retrieve submissions (admin only - add proper auth in production)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    try {
      await jwtVerify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // In production, add admin role check here

    return NextResponse.json(
      {
        submissions: contactSubmissions,
        total: contactSubmissions.length
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error retrieving contact submissions:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve submissions' },
      { status: 500 }
    );
  }
}
