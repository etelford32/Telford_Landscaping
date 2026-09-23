// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';
import { sendEmail } from '../email';

const message = { to: 'etelford32@gmail.com', subject: 'New lead', text: 'hello', replyTo: 'jane@example.com' };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('sendEmail', () => {
  it('fails in production when RESEND_API_KEY is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('RESEND_API_KEY', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    expect(await sendEmail(message)).toEqual({ ok: false, error: 'RESEND_API_KEY is not set' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('logs instead of sending in local development without a key', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('RESEND_API_KEY', '');
    vi.spyOn(console, 'info').mockImplementation(() => {});

    expect(await sendEmail(message)).toEqual({ ok: true, id: 'dev-not-sent' });
  });

  it('posts the message to Resend', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_123');
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'email_1' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    expect(await sendEmail(message)).toEqual({ ok: true, id: 'email_1' });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer re_test_123');
    expect(JSON.parse(init.body)).toMatchObject({
      from: 'Telford Landscaping <onboarding@resend.dev>',
      to: ['etelford32@gmail.com'],
      subject: 'New lead',
      text: 'hello',
      reply_to: 'jane@example.com',
    });
  });

  it('uses LEAD_EMAIL_FROM when set', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_123');
    vi.stubEnv('LEAD_EMAIL_FROM', 'Telford Landscaping <leads@telfordlandscaping.com>');
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"id":"x"}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await sendEmail(message);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).from).toBe('Telford Landscaping <leads@telfordlandscaping.com>');
  });

  it('reports a Resend rejection', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_bad');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: 'API key is invalid' }), { status: 401 }))
    );

    expect(await sendEmail(message)).toEqual({ ok: false, error: 'Resend 401: API key is invalid' });
  });

  it('reports a network failure', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_123');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNRESET')));

    expect(await sendEmail(message)).toEqual({ ok: false, error: 'ECONNRESET' });
  });
});
