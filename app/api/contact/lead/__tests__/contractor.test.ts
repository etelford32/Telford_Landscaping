// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

// Exercise the real parser, formatter and email adapter. Only the external
// Resend HTTP boundary is stubbed; these tests never send email.
const project = {
  company: 'Synthetic A&B Builders',
  projectName: 'TEST ONLY — Phase 2',
  location: 'Synthetic site, Auburn CA',
  scope: ['Irrigation', 'Planting', 'Planting', 'unknown scope'],
  quantities: '1,200 SF planting; 240 LF drip\n12 shrubs (5 gal); 3 trees (24" box)',
  schedule: '2026-12-01; 3 days; two phases',
  bidDue: '2026-11-09',
  plansLink: 'https://example.com/plans.pdf?sheet=L1&rev=2',
};
const attribution = {
  landing_page: '/for-contractors?utm_source=synthetic_qa',
  referrer: 'https://example.com/directory',
  first_seen: '2026-11-02T12:00:00.000Z',
  utm_source: 'synthetic_qa',
  utm_medium: 'verification',
  utm_campaign: 'contractor_delivery',
  utm_term: 'landscape_subcontractor',
  utm_content: 'form_a',
  gclid: 'synthetic-click-id',
  unknown: 'DO_NOT_INCLUDE',
};
const payload = {
  name: 'Synthetic Contact', phone: '916-555-0142', email: 'qa@example.com',
  service: 'Contractor — plans for quote', page: '/for-contractors',
  message: 'DO NOT BID. A&B <test> "quote".', website: '', project, attribution,
};
function request(body: unknown) {
  return new NextRequest('https://example.com/api/contact/lead', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('RESEND_API_KEY', 're_test_never_sent');
  vi.stubEnv('LEAD_EMAIL_TO', 'business@example.com');
  vi.stubEnv('LEAD_EMAIL_FROM', 'Test Sender <sender@example.com>');
  fetchMock = vi.fn().mockResolvedValue(new Response('{"id":"email_contract_1"}', { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks();
});

describe('contractor API → Resend boundary', () => {
  it('preserves every project/contact field, reply-to and first-touch attribution', async () => {
    const response = await POST(request(payload));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ok: true,
      message: "Thanks — your request came through. We'll be in touch within one business day.",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer re_test_never_sent');
    const sent = JSON.parse(init.body);
    expect(sent.to).toEqual(['business@example.com']);
    expect(sent.from).toBe('Test Sender <sender@example.com>');
    expect(sent.reply_to).toBe(payload.email);
    expect(sent.subject).toBe('Plans for quote: Synthetic A&B Builders / Synthetic Contact — Synthetic site, Auburn CA — Planting, Irrigation');
    for (const value of [payload.name, payload.phone, payload.email, payload.service,
      payload.page, payload.message, project.company, project.projectName,
      project.location, 'Planting, Irrigation', project.quantities, project.schedule,
      project.bidDue, project.plansLink, attribution.landing_page, attribution.referrer,
      'Nov 2, 2026, 4:00 AM PT', 'synthetic_qa / verification / contractor_delivery / landscape_subcontractor / form_a',
    ]) expect(sent.text).toContain(value);
    expect(sent.text).toContain('gclid');
    expect(sent.text).not.toContain('DO_NOT_INCLUDE');
    expect(sent.text).not.toContain('unknown scope');
    expect(sent.html).toContain('Synthetic A&amp;B Builders');
    expect(sent.html).toContain('A&amp;B &lt;test&gt; &quot;quote&quot;');
    expect(sent.html).toContain('<a href="https://example.com/plans.pdf?sheet=L1&amp;rev=2">');
    expect(sent.html).toContain('mailto:qa@example.com');
    expect(sent.html).toContain('tel:9165550142');
    expect(sent.html).not.toContain('<test>');
  });

  it('waits for provider acknowledgement before returning success', async () => {
    let release!: (value: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>(resolve => { release = resolve; }));
    let finished = false;
    const pending = POST(request(payload)).then(r => { finished = true; return r; });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(finished).toBe(false);
    release(new Response('{"id":"accepted"}', { status: 200 }));
    expect((await pending).status).toBe(200);
  });

  it('supports a phone-only contractor without a fabricated reply-to', async () => {
    expect((await POST(request({ ...payload, email: '' }))).status).toBe(200);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent).not.toHaveProperty('reply_to');
    expect(sent.text).toContain('No email given — call or text them back.');
  });

  it('flags an autofilled honeypot without silently dropping a real lead', async () => {
    expect((await POST(request({ ...payload, website: 'autofilled' }))).status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).subject).toMatch(/^\[possible spam\] Plans for quote:/);
  });

  it.each([
    ['missing name', { ...payload, name: '' }],
    ['missing contact', { ...payload, phone: '', email: '' }],
    ['invalid email', { ...payload, email: 'not-an-email' }],
    ['null project', { ...payload, project: null }],
    ['missing location', { ...payload, project: { ...project, location: '  ' } }],
    ['missing scope', { ...payload, project: { ...project, scope: [] } }],
    ['unknown scope', { ...payload, project: { ...project, scope: ['fake'] } }],
    ['wrong scope type', { ...payload, project: { ...project, scope: 'Planting' } }],
    ['excess quantities', { ...payload, project: { ...project, quantities: 'q'.repeat(2001) } }],
    ['excess notes', { ...payload, message: 'm'.repeat(5001) }],
  ])('rejects %s before contacting Resend', async (_name, invalid) => {
    const response = await POST(request(invalid));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: expect.any(String) });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([401, 403, 422, 429, 500])('returns actionable 502 for Resend %s without exposing internal details', async status => {
    fetchMock.mockResolvedValue(new Response('{"message":"private provider detail"}', { status }));
    const response = await POST(request(payload));
    expect(response.status).toBe(502);
    const result = await response.json();
    expect(result.ok).toBeUndefined();
    expect(result.error).toContain('(279) 227-6372');
    expect(result.error).toContain('etelford32@gmail.com');
    expect(result.error).not.toContain('private provider detail');
    expect(result.error).not.toContain('re_test_never_sent');
    const recovered = JSON.parse(vi.mocked(console.error).mock.calls[0][1] as string);
    expect(recovered.project).toEqual({ ...project, scope: ['Planting', 'Irrigation'] });
    expect(recovered).toMatchObject({ name: payload.name, email: payload.email, phone: payload.phone });
    expect(recovered.attribution).toMatchObject({ utm_source: 'synthetic_qa', utm_campaign: 'contractor_delivery' });
    expect(fetchMock).toHaveBeenCalledOnce(); // Do not retry an ambiguous send.
  });

  it.each([new Error('connection reset'), new DOMException('Timed out', 'TimeoutError')])('does not confirm an uncertain send: %s', async error => {
    fetchMock.mockRejectedValue(error);
    const response = await POST(request(payload));
    expect(response.status).toBe(502);
    expect((await response.json()).ok).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('does not confirm a provider HTTP 200 without an email ID', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 200 }));
    const response = await POST(request(payload));
    expect(response.status).toBe(502);
    expect((await response.json()).ok).toBeUndefined();
  });
});
