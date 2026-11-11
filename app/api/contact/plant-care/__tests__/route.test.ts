// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
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

function post(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/contact/plant-care', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  it('emails the request from a visitor with no account', async () => {
    const res = await POST(post(form));

    expect(res.status).toBe(200);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.to).toEqual(['etelford32@gmail.com']);
    expect(sent.subject).toBe('New lead: Jane Doe (Auburn) — Plant care — Tree & Shrub Care');
    expect(sent.text).toContain('Property size: 1 acre');
    expect(sent.reply_to).toBe('jane@example.com');
  });

  it('rejects a request missing a required field', async () => {
    const res = await POST(post({ ...form, phone: '' }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('flags a filled honeypot instead of dropping the request', async () => {
    const res = await POST(post({ ...form, website: 'http://spam.example' }));
    expect(res.status).toBe(200);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.subject).toMatch(/spam/i);
  });
});
