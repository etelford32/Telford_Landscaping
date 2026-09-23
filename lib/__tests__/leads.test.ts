import { describe, it, expect, afterEach } from 'vitest';
import { parseLead, leadEmail, leadInbox, MESSAGE_MAX, type Lead } from '../leads';

const RECEIVED = new Date('2026-09-23T16:41:00Z');

function lead(body: Record<string, unknown>): Lead {
  const result = parseLead(body, RECEIVED);
  if (!result.ok) throw new Error(`expected a valid lead, got: ${result.error}`);
  return result.lead;
}

describe('parseLead', () => {
  it('accepts a name plus a phone number', () => {
    const l = lead({ name: '  Jane Doe ', phone: '916-555-0100' });
    expect(l.name).toBe('Jane Doe');
    expect(l.phone).toBe('916-555-0100');
    expect(l.service).toBe('General inquiry');
    expect(l.suspectedSpam).toBe(false);
  });

  it('requires a name', () => {
    expect(parseLead({ phone: '916-555-0100' })).toEqual({ ok: false, error: 'Please enter your name.' });
  });

  it('requires a phone or an email', () => {
    const result = parseLead({ name: 'Jane' });
    expect(result.ok).toBe(false);
  });

  it('rejects a malformed email', () => {
    expect(parseLead({ name: 'Jane', email: 'jane@' })).toEqual({
      ok: false,
      error: 'Please enter a valid email address.',
    });
  });

  it('rejects an over-long message instead of silently truncating it', () => {
    const result = parseLead({ name: 'Jane', phone: '1', message: 'x'.repeat(MESSAGE_MAX + 1) });
    expect(result.ok).toBe(false);
  });

  it('rejects non-object bodies', () => {
    expect(parseLead(null).ok).toBe(false);
    expect(parseLead('name=Jane').ok).toBe(false);
  });

  it('ignores non-string field values', () => {
    const l = lead({ name: 'Jane', phone: '1', city: { evil: true }, message: 42 });
    expect(l.city).toBe('');
    expect(l.message).toBe('');
  });

  it('flags, but keeps, a lead whose honeypot is filled', () => {
    const l = lead({ name: 'Jane', phone: '1', website: 'http://spam.example' });
    expect(l.suspectedSpam).toBe(true);
  });

  it('keeps only known attribution keys', () => {
    const l = lead({
      name: 'Jane',
      phone: '1',
      attribution: { landing_page: '/fire-wise-landscaping', utm_source: 'google', injected: 'nope' },
    });
    expect(l.attribution).toEqual({ landing_page: '/fire-wise-landscaping', utm_source: 'google' });
  });
});

describe('leadEmail', () => {
  it('puts the name, city, and service in the subject', () => {
    const { subject } = leadEmail(
      lead({ name: 'Jane Doe', phone: '1', city: 'Granite Bay', service: 'Fire-Wise / Defensible Space' })
    );
    expect(subject).toBe('New lead: Jane Doe (Granite Bay) — Fire-Wise / Defensible Space');
  });

  it('strips line breaks from the subject', () => {
    const { subject } = leadEmail(lead({ name: 'Jane', phone: '1', service: 'A\r\nBcc: x@example.com' }));
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it('marks suspected spam in the subject and body', () => {
    const email = leadEmail(lead({ name: 'Jane', phone: '1', website: 'x' }));
    expect(email.subject.startsWith('[possible spam] ')).toBe(true);
    expect(email.text).toContain('may be a bot');
  });

  it('includes every contact field and the message in the text body', () => {
    const { text } = leadEmail(
      lead({
        name: 'Jane Doe',
        phone: '(916) 555-0100',
        email: 'jane@example.com',
        city: 'Loomis',
        message: 'Retaining wall on a slope.',
      })
    );
    expect(text).toContain('Jane Doe');
    expect(text).toContain('(916) 555-0100');
    expect(text).toContain('jane@example.com');
    expect(text).toContain('Loomis');
    expect(text).toContain('Retaining wall on a slope.');
    expect(text).toContain('Sep 23, 2026');
    expect(text).toContain('Reply to this email');
  });

  it('asks for a call back when there is no email to reply to', () => {
    expect(leadEmail(lead({ name: 'Jane', phone: '1' })).text).toContain('call or text them back');
  });

  it('reports how the prospect found the site', () => {
    const { text } = leadEmail(
      lead({
        name: 'Jane',
        phone: '1',
        page: '/fire-wise-landscaping',
        attribution: {
          landing_page: '/?utm_source=google&utm_medium=cpc',
          referrer: 'https://www.google.com/',
          utm_source: 'google',
          utm_medium: 'cpc',
          gclid: 'abc',
        },
      })
    );
    expect(text).toContain('Submitted from:  /fire-wise-landscaping');
    expect(text).toContain('Referrer:        https://www.google.com/');
    expect(text).toContain('Campaign:        google / cpc');
    expect(text).toContain('Ad click:        gclid');
  });

  it('escapes user input in the HTML body', () => {
    const { html } = leadEmail(
      lead({ name: '<script>alert(1)</script>', phone: '1', message: '<img src=x onerror=alert(1)>' })
    );
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
  });

  it('links the phone and email for one-tap callback', () => {
    const { html } = leadEmail(lead({ name: 'Jane', phone: '(916) 555-0100', email: 'jane@example.com' }));
    expect(html).toContain('href="tel:9165550100"');
    expect(html).toContain('href="mailto:jane@example.com"');
  });
});

describe('leadInbox', () => {
  afterEach(() => {
    delete process.env.LEAD_EMAIL_TO;
  });

  it('delivers to the business email by default', () => {
    expect(leadInbox()).toBe('etelford32@gmail.com');
  });

  it('can be redirected with LEAD_EMAIL_TO', () => {
    process.env.LEAD_EMAIL_TO = 'office@example.com';
    expect(leadInbox()).toBe('office@example.com');
  });
});
