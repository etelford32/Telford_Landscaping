import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'telford-landscapes-secret-change-in-production'
);

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, SECRET_KEY);

    return NextResponse.json({
      user: {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        subscription: payload.subscription,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
