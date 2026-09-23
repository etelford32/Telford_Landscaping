// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { SignJWT } from 'jose';
import { POST } from '../route';

const form = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '916-555-0100',
  location: 'Auburn',
  propertySize: '1 acre',
  service: 'Tree & Shrub Care',
  message: 'Oak looks stressed.',
};

/** A session cookie exactly as /api/auth/login issues it. */
async function authToken(): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'telford-landscapes-secret-change-in-production');
  return new SignJWT({ id: '1', email: form.email, name: form.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
}

function post(body: unknown, cookie?: string): NextRequest {
  return new NextRequest('http://localhost/api/contact/plant-care', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubEnv('RESEND_API_KEY', 're_test_123');
  fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'email_1' }), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('POST /api/contact/plant-care', () => {
  it('accepts the session cookie that login issues and emails the request', async () => {
    const res = await POST(post(form, `auth-token=${await authToken()}`));

    expect(res.status).toBe(200);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.to).toEqual(['etelford32@gmail.com']);
    expect(sent.subject).toBe('New lead: Jane Doe (Auburn) — Plant care — Tree & Shrub Care');
    expect(sent.text).toContain('Property size: 1 acre');
    expect(sent.reply_to).toBe('jane@example.com');
  });

  it('rejects a request with no session', async () => {
    const res = await POST(post(form));
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a forged session', async () => {
    const res = await POST(post(form, 'auth-token=not-a-jwt'));
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
