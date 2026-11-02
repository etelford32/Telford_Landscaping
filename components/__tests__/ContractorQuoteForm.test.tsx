import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ContractorQuoteForm from '../ContractorQuoteForm';
import { getAttribution, trackEvent } from '@/lib/analytics';

vi.mock('@/lib/analytics', async importOriginal => ({
  ...await importOriginal<typeof import('@/lib/analytics')>(),
  getAttribution: vi.fn(), trackEvent: vi.fn(),
}));

const fields = {
  Company: 'Synthetic A&B Builders',
  'Contact name *': 'Synthetic Contact',
  Phone: '916-555-0142',
  Email: 'qa@example.com',
  'Project name': 'TEST ONLY — Phase 2',
  'Project location *': 'Synthetic site, Auburn CA',
  Quantities: '1,200 SF planting\n240 LF drip',
  Schedule: '2026-12-01; 3 days; two phases',
  'Bid due': '2026-11-09',
  'Link to plans': 'https://example.com/plans.pdf?sheet=L1&rev=2',
  Notes: 'DO NOT BID. A&B <test> "quote".',
};
const attribution = {
  landing_page: '/for-contractors?utm_source=synthetic_qa',
  referrer: 'https://example.com/directory', first_seen: '2026-11-02T12:00:00.000Z',
  utm_source: 'synthetic_qa', utm_medium: 'verification', utm_campaign: 'contractor_delivery',
};
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, '', '/for-contractors');
  vi.mocked(getAttribution).mockReturnValue(attribution);
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function fillForm(scope = true) {
  render(<ContractorQuoteForm />);
  for (const [label, value] of Object.entries(fields)) {
    fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } });
  }
  if (scope) {
    fireEvent.click(screen.getByRole('checkbox', { name: 'Planting' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Irrigation' }));
  }
}
function submit() { fireEvent.click(screen.getByRole('button', { name: 'Send Plans for a Quote' })); }
function expectPreserved() {
  for (const [label, value] of Object.entries(fields)) expect(screen.getByLabelText(label, { exact: true })).toHaveValue(value);
  expect(screen.getByRole('checkbox', { name: 'Planting' })).toBeChecked();
  expect(screen.getByRole('checkbox', { name: 'Irrigation' })).toBeChecked();
  expect(screen.queryByText('Plans request received')).not.toBeInTheDocument();
  expect(trackEvent).not.toHaveBeenCalledWith('generate_lead', expect.anything());
}

describe('ContractorQuoteForm confirmation and failure behavior', () => {
  it('sends every field and attribution; confirms only after the API acknowledges', async () => {
    let release!: (response: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>(resolve => { release = resolve; }));
    fillForm(); submit();
    expect(screen.getByRole('button', { name: 'Sending…' })).toBeDisabled();
    expect(screen.queryByText('Plans request received')).not.toBeInTheDocument();
    expect(trackEvent).not.toHaveBeenCalledWith('generate_lead', expect.anything());
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/contact/lead');
    expect(JSON.parse(init.body)).toEqual({
      name: fields['Contact name *'], phone: fields.Phone, email: fields.Email,
      service: 'Contractor — plans for quote', page: '/for-contractors',
      message: fields.Notes, website: '', attribution,
      project: {
        company: fields.Company, projectName: fields['Project name'], location: fields['Project location *'],
        scope: ['Planting', 'Irrigation'], quantities: fields.Quantities, schedule: fields.Schedule,
        bidDue: fields['Bid due'], plansLink: fields['Link to plans'],
      },
    });
    release(new Response('{"ok":true}', { status: 200 }));
    expect(await screen.findByText('Plans request received')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'etelford32@gmail.com' })).toHaveAttribute('href', expect.stringContaining('mailto:etelford32@gmail.com'));
    expect(screen.getByRole('link', { name: '(279) 227-6372' })).toHaveAttribute('href', 'tel:+12792276372');
    expect(vi.mocked(trackEvent).mock.calls.filter(([name]) => name === 'generate_lead')).toEqual([
      ['generate_lead', { service: 'Contractor — plans for quote' }],
    ]);
  });

  it('blocks an empty scope before submitting', () => {
    fillForm(false); submit();
    expect(screen.getByRole('alert')).toHaveTextContent('Please choose at least one scope of work.');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([[400, 'validation'], [502, 'server']])('preserves the form after HTTP %s and tracks %s', async (status, errorType) => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: 'Test rejection — call or email instead.' }), { status }));
    fillForm(); submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Test rejection');
    expectPreserved();
    expect(screen.getByRole('button', { name: 'Send Plans for a Quote' })).toBeEnabled();
    expect(trackEvent).toHaveBeenCalledWith('lead_form_error', { service: 'Contractor — plans for quote', error_type: errorType });
  });

  it('retains fields through network failure and allows a deliberate successful retry', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    fillForm(); submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Network error');
    expectPreserved();
    expect(trackEvent).toHaveBeenCalledWith('lead_form_error', { service: 'Contractor — plans for quote', error_type: 'network' });
    fetchMock.mockResolvedValueOnce(new Response('{"ok":true}', { status: 200 }));
    submit();
    expect(await screen.findByText('Plans request received')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].body).toBe(fetchMock.mock.calls[0][1].body);
  });

  it.each(['{}', '{"ok":false}', '{"ok":"true"}', 'null'])('does not invent a success for a malformed API acknowledgement: %s', async body => {
    fetchMock.mockResolvedValue(new Response(body, { status: 200 }));
    fillForm(); submit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Please call or email');
    expectPreserved();
    expect(trackEvent).toHaveBeenCalledWith('lead_form_error', { service: 'Contractor — plans for quote', error_type: 'server' });
  });

  it('keeps the request recoverable if the server responds with non-JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }));
    fillForm(); submit();
    await screen.findByRole('alert');
    expectPreserved();
  });

  it('records form view and start once, tagged as a contractor lead', async () => {
    let onIntersection!: IntersectionObserverCallback;
    const disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', vi.fn(function (callback: IntersectionObserverCallback) {
      onIntersection = callback;
      return { observe: vi.fn(), disconnect };
    }));
    fillForm();
    onIntersection([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    fireEvent.focus(screen.getByLabelText('Company'));
    fireEvent.focus(screen.getByLabelText('Contact name *'));
    await waitFor(() => expect(trackEvent).toHaveBeenCalledWith('lead_form_view', { service: 'Contractor — plans for quote' }));
    expect(disconnect).toHaveBeenCalledOnce();
    expect(vi.mocked(trackEvent).mock.calls.filter(([name]) => name === 'lead_form_start')).toHaveLength(1);
  });
});
