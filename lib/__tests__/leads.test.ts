import { describe, it, expect, afterEach } from 'vitest';
import { parseLead, leadEmail, leadInbox, MESSAGE_MAX, QUANTITIES_MAX, type Lead } from '../leads';

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

const CONTRACTOR = {
  name: 'Sam Builder',
  phone: '916-555-0199',
  email: 'sam@gcbuilders.example',
  service: 'Contractor — plans for quote',
  project: {
    company: 'GC Builders Inc.',
    projectName: 'Oak Ridge Phase 2',
    location: 'Sierra College Blvd & King Rd, Loomis',
    scope: ['Irrigation', 'Planting', 'Bogus scope'],
    quantities: '220 shrubs (5 gal)\n3,500 LF drip',
    schedule: 'Start Jan 12, 6 weeks',
    bidDue: '2026-11-20',
    plansLink: 'https://drive.example.com/plans?id=1&v=2',
  },
};

describe('contractor quote requests', () => {
  it('parses the project and keeps only known scopes, in canonical order', () => {
    const l = lead(CONTRACTOR);
    expect(l.project?.scope).toEqual(['Planting', 'Irrigation']);
    expect(l.project?.location).toBe('Sierra College Blvd & King Rd, Loomis');
    expect(l.project?.company).toBe('GC Builders Inc.');
  });

  it('leaves ordinary leads without a project', () => {
    expect(lead({ name: 'Jane', phone: '1' }).project).toBeUndefined();
  });

  it('requires a project location', () => {
    expect(parseLead({ ...CONTRACTOR, project: { ...CONTRACTOR.project, location: '  ' } })).toEqual({
      ok: false,
      error: 'Please enter the project location.',
    });
  });

  it('requires at least one recognised scope', () => {
    expect(parseLead({ ...CONTRACTOR, project: { ...CONTRACTOR.project, scope: ['Roofing'] } })).toEqual({
      ok: false,
      error: 'Please choose at least one scope of work.',
    });
    expect(parseLead({ ...CONTRACTOR, project: { ...CONTRACTOR.project, scope: 'Planting' } }).ok).toBe(false);
  });

  it('rejects over-long quantities and non-object projects', () => {
    const long = { ...CONTRACTOR, project: { ...CONTRACTOR.project, quantities: 'x'.repeat(QUANTITIES_MAX + 1) } };
    expect(parseLead(long).ok).toBe(false);
    expect(parseLead({ ...CONTRACTOR, project: 'plans' }).ok).toBe(false);
  });

  it('puts company, location, and scope in the subject', () => {
    expect(leadEmail(lead(CONTRACTOR)).subject).toBe(
      'Plans for quote: GC Builders Inc. / Sam Builder — Sierra College Blvd & King Rd, Loomis — Planting, Irrigation'
    );
  });

  it('includes location, scope, quantities, schedule, and plans in the body', () => {
    const { text, html } = leadEmail(lead(CONTRACTOR));
    expect(text).toContain('New subcontract quote request');
    expect(text).toContain('Company:         GC Builders Inc.');
    expect(text).toContain('Location:        Sierra College Blvd & King Rd, Loomis');
    expect(text).toContain('Scope:           Planting, Irrigation');
    expect(text).toContain('Schedule:        Start Jan 12, 6 weeks');
    expect(text).toContain('Bid due:         2026-11-20');
    expect(text).toContain('3,500 LF drip');
    expect(html).toContain('<a href="https://drive.example.com/plans?id=1&amp;v=2">');
  });

  it('does not link a plans value that is not an http(s) URL', () => {
    const l = lead({ ...CONTRACTOR, project: { ...CONTRACTOR.project, plansLink: 'javascript:alert(1)' } });
    expect(leadEmail(l).html).not.toContain('href="javascript:');
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
