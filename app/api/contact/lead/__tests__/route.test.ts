// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

function post(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/contact/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubEnv('RESEND_API_KEY', 're_test_123');
  fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'email_1' }), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('POST /api/contact/lead', () => {
  it('emails a valid consultation request to the inbox, reply-to the prospect', async () => {
    const res = await POST(
      post({
        name: 'Jane Doe',
        phone: '(916) 555-0100',
        email: 'jane@example.com',
        city: 'Granite Bay',
        service: 'Homepage — consultation request',
        message: 'Front yard, fire-wise.',
        page: '/',
      })
    );

    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.to).toEqual(['etelford32@gmail.com']);
    expect(sent.reply_to).toBe('jane@example.com');
    expect(sent.subject).toBe('New lead: Jane Doe (Granite Bay) — Homepage — consultation request');
    expect(sent.text).toContain('Front yard, fire-wise.');
  });

  it('does not claim success when the email is not delivered', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ message: 'API key is invalid' }), { status: 401 }));

    const res = await POST(post({ name: 'Jane', phone: '916-555-0100' }));

    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.ok).toBeUndefined();
    expect(json.error).toContain('(279) 227-6372');
    // The lead is still recoverable from the server log.
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('email delivery failed'), expect.stringContaining('916-555-0100'));
  });

  it('fails loudly in production when email is not configured', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('NODE_ENV', 'production');

    const res = await POST(post({ name: 'Jane', phone: '916-555-0100' }));

    expect(res.status).toBe(502);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid request without sending anything', async () => {
    const res = await POST(post({ name: '', phone: '' }));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a malformed body', async () => {
    const res = await POST(post('{not json'));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
