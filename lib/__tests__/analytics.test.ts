import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackEvent, trackClick, captureAttribution, getAttribution } from '../analytics';

let gtag: ReturnType<typeof vi.fn>;

beforeEach(() => {
  gtag = vi.fn();
  (window as unknown as { gtag: unknown }).gtag = gtag;
});

afterEach(() => {
  delete (window as unknown as { gtag?: unknown }).gtag;
  document.body.innerHTML = '';
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
});

function render(html: string): void {
  document.body.innerHTML = html;
}

describe('trackEvent', () => {
  it('is a no-op when GA is not loaded', () => {
    delete (window as unknown as { gtag?: unknown }).gtag;
    expect(() => trackEvent('generate_lead')).not.toThrow();
  });
});

describe('trackClick', () => {
  it('records phone clicks with the section they came from', () => {
    render('<header data-cta-location="hero"><a href="tel:+12792276372"><span id="t">Call</span></a></header>');
    trackClick(document.getElementById('t'));
    expect(gtag).toHaveBeenCalledWith('event', 'contact_click', { method: 'phone', cta_location: 'hero' });
  });

  it('records email clicks, preferring the link’s own location over its section’s', () => {
    render(
      '<section data-cta-location="gallery"><a id="t" href="mailto:x@example.com" data-cta-location="lightbox">Email</a></section>'
    );
    trackClick(document.getElementById('t'));
    expect(gtag).toHaveBeenCalledWith('event', 'contact_click', { method: 'email', cta_location: 'lightbox' });
  });

  it('records tagged CTAs', () => {
    render('<section data-cta-location="services"><a id="t" href="#contact" data-cta="service-hardscape">Get a bid</a></section>');
    trackClick(document.getElementById('t'));
    expect(gtag).toHaveBeenCalledWith('event', 'cta_click', {
      cta_id: 'service-hardscape',
      cta_location: 'services',
      link_url: '#contact',
    });
  });

  it('falls back to "unknown" when nothing names the location', () => {
    render('<a id="t" href="tel:+1">Call</a>');
    trackClick(document.getElementById('t'));
    expect(gtag).toHaveBeenCalledWith('event', 'contact_click', { method: 'phone', cta_location: 'unknown' });
  });

  it('ignores untagged links and non-link clicks', () => {
    render('<a id="a" href="/plants">Plants</a><p id="p">text</p>');
    trackClick(document.getElementById('a'));
    trackClick(document.getElementById('p'));
    trackClick(null);
    expect(gtag).not.toHaveBeenCalled();
  });
});

describe('attribution', () => {
  it('captures the landing page, referrer, and campaign parameters on first visit', () => {
    window.history.replaceState(null, '', '/fire-wise-landscaping?utm_source=google&utm_medium=cpc&gclid=abc&x=1');
    captureAttribution();
    expect(getAttribution()).toMatchObject({
      landing_page: '/fire-wise-landscaping?utm_source=google&utm_medium=cpc&gclid=abc&x=1',
      utm_source: 'google',
      utm_medium: 'cpc',
      gclid: 'abc',
    });
  });

  it('keeps the first touch on later visits', () => {
    window.history.replaceState(null, '', '/?utm_source=newsletter');
    captureAttribution();
    window.history.replaceState(null, '', '/portfolio?utm_source=facebook');
    captureAttribution();
    expect(getAttribution()?.utm_source).toBe('newsletter');
  });

  it('starts over once the first touch is more than 90 days old', () => {
    window.localStorage.setItem(
      'tl_attribution',
      JSON.stringify({ landing_page: '/old', referrer: '', first_seen: '2020-01-01T00:00:00Z' })
    );
    window.history.replaceState(null, '', '/portfolio');
    captureAttribution();
    expect(getAttribution()?.landing_page).toBe('/portfolio');
  });

  it('returns null when nothing is stored or storage is unreadable', () => {
    expect(getAttribution()).toBeNull();
    window.localStorage.setItem('tl_attribution', '{not json');
    expect(getAttribution()).toBeNull();
  });
});
