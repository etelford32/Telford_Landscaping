"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2, Paperclip } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import { getAttribution, trackEvent } from "@/lib/analytics";
import { CONTRACTOR_SCOPES, MESSAGE_MAX, QUANTITIES_MAX } from "@/lib/leads";
import { plansForQuoteMailto } from "@/lib/contactLinks";

const SERVICE = "Contractor — plans for quote";

/**
 * "Send plans for a quote" form for general contractors. Posts to the same
 * /api/contact/lead endpoint as LeadForm, adding a `project` object
 * (location, scope, quantities, schedule, plans link) that the server
 * validates and lays out in the lead email (lib/leads.ts).
 *
 * Reports the same GA funnel as LeadForm, tagged with its own `service`.
 */
export default function ContractorQuoteForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = formRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        trackEvent("lead_form_view", { service: SERVICE });
        io.disconnect();
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function handleFocus() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("lead_form_start", { service: SERVICE });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const scope = fd.getAll("scope").map(String);

    // Checkbox groups can't be `required` as a group in HTML, so check here.
    if (!scope.length) {
      setError("Please choose at least one scope of work.");
      setStatus("error");
      return;
    }

    setStatus("submitting");
    setError("");
    trackEvent("lead_form_submit", { service: SERVICE });

    const str = (k: string) => String(fd.get(k) ?? "");
    const payload = {
      name: str("name"),
      phone: str("phone"),
      email: str("email"),
      service: SERVICE,
      message: str("message"),
      website: str("website"),
      page: window.location.pathname,
      attribution: getAttribution(),
      project: {
        company: str("company"),
        projectName: str("projectName"),
        location: str("location"),
        scope,
        quantities: str("quantities"),
        schedule: str("schedule"),
        bidDue: str("bidDue"),
        plansLink: str("plansLink"),
      },
    };

    try {
      const res = await fetch("/api/contact/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please call or email us instead.");
        setStatus("error");
        trackEvent("lead_form_error", { service: SERVICE, error_type: res.status >= 500 ? "server" : "validation" });
        return;
      }
      setStatus("success");
      trackEvent("generate_lead", { service: SERVICE });
      form.reset();
    } catch {
      setError("Network error. Please call or email us instead.");
      setStatus("error");
      trackEvent("lead_form_error", { service: SERVICE, error_type: "network" });
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center text-center rounded-2xl border-2 border-primary-200 bg-primary-50 p-10 min-h-[320px]">
        <CheckCircle2 className="w-14 h-14 text-primary-600 mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Plans request received</h3>
        <p className="text-gray-700 max-w-md">
          Thanks — we&rsquo;ll review the scope and get back to you within one business day. If the plan
          set is too large to link, email it to{" "}
          <a href={plansForQuoteMailto()} className="font-semibold text-primary-700 underline break-all">
            {siteConfig.email}
          </a>{" "}
          or call{" "}
          <a href={siteConfig.phoneHref} className="font-semibold text-primary-700 underline">
            {siteConfig.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  const fieldCls =
    "w-full px-4 py-3 rounded-xl border-[1.5px] border-earth-200 bg-white text-gray-900 text-[15px] " +
    "focus:outline-none focus:border-primary-600 focus:ring-[3px] focus:ring-primary-600/15 transition";
  const labelCls = "block text-[13px] font-semibold text-gray-700 mb-1.5";
  const groupCls = "sm:col-span-2 text-[12px] font-bold tracking-[0.18em] uppercase text-primary-700 pt-2";

  return (
    <form ref={formRef} onSubmit={handleSubmit} onFocus={handleFocus} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Honeypot: invisible to people, tempting to form-filling bots. */}
      <div aria-hidden="true" className="absolute -left-[10000px] w-px h-px overflow-hidden">
        <label>
          Leave this field empty
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className={groupCls}>Your company</div>
      <div>
        <label htmlFor="cq-company" className={labelCls}>Company</label>
        <input id="cq-company" name="company" type="text" autoComplete="organization" className={fieldCls} />
      </div>
      <div>
        <label htmlFor="cq-name" className={labelCls}>Contact name *</label>
        <input id="cq-name" name="name" type="text" required autoComplete="name" className={fieldCls} />
      </div>
      <div>
        <label htmlFor="cq-phone" className={labelCls}>Phone</label>
        <input id="cq-phone" name="phone" type="tel" autoComplete="tel" className={fieldCls} />
      </div>
      <div>
        <label htmlFor="cq-email" className={labelCls}>Email</label>
        <input id="cq-email" name="email" type="email" autoComplete="email" className={fieldCls} />
      </div>

      <div className={groupCls}>The job</div>
      <div>
        <label htmlFor="cq-project" className={labelCls}>Project name</label>
        <input id="cq-project" name="projectName" type="text" placeholder="e.g. Oak Ridge Phase 2" className={fieldCls} />
      </div>
      <div>
        <label htmlFor="cq-location" className={labelCls}>Project location *</label>
        <input
          id="cq-location"
          name="location"
          type="text"
          required
          placeholder="Address or cross streets, city"
          className={fieldCls}
        />
      </div>

      <fieldset className="sm:col-span-2">
        <legend className={labelCls}>Scope of work * <span className="font-normal text-gray-500">(check all that apply)</span></legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CONTRACTOR_SCOPES.map((s) => (
            <label
              key={s}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border-[1.5px] border-earth-200 bg-white text-[14.5px] text-gray-800 cursor-pointer has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
            >
              <input type="checkbox" name="scope" value={s} className="w-4 h-4 accent-primary-600" />
              {s}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="sm:col-span-2">
        <label htmlFor="cq-quantities" className={labelCls}>Quantities</label>
        <textarea
          id="cq-quantities"
          name="quantities"
          rows={4}
          maxLength={QUANTITIES_MAX}
          placeholder={"e.g. 14,000 sf planting area · 220 shrubs (5 gal) · 18 trees (24\" box)\n3,500 LF drip · 1,200 LF fiber roll · 2 acres brush clearing"}
          className={`${fieldCls} resize-y min-h-[110px]`}
        />
      </div>

      <div>
        <label htmlFor="cq-schedule" className={labelCls}>Schedule</label>
        <input
          id="cq-schedule"
          name="schedule"
          type="text"
          placeholder="Start date, duration, phasing"
          className={fieldCls}
        />
      </div>
      <div>
        <label htmlFor="cq-biddue" className={labelCls}>Bid due</label>
        <input id="cq-biddue" name="bidDue" type="date" className={fieldCls} />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="cq-plans" className={labelCls}>Link to plans</label>
        <input
          id="cq-plans"
          name="plansLink"
          type="url"
          placeholder="Plan room, Google Drive, Dropbox, or Box link"
          className={fieldCls}
        />
        <p className="mt-1.5 text-[12.5px] text-gray-500 flex items-start gap-1.5">
          <Paperclip className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Have PDFs instead?{" "}
            <a href={plansForQuoteMailto()} className="text-primary-700 font-semibold hover:underline">
              Email the plan set
            </a>{" "}
            — the form still helps us log the job.
          </span>
        </p>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="cq-notes" className={labelCls}>Notes</label>
        <textarea
          id="cq-notes"
          name="message"
          rows={3}
          maxLength={MESSAGE_MAX}
          placeholder="Specs, alternates, site access, prevailing wage, bonding or insurance requirements…"
          className={`${fieldCls} resize-y min-h-[90px]`}
        />
      </div>

      {status === "error" && (
        <p className="sm:col-span-2 text-sm text-red-600 font-medium" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-3d sm:col-span-2 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-green-600 hover:from-primary-500 hover:to-green-500 text-white font-bold px-8 py-4 rounded-xl disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send Plans for a Quote
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
      <p className="sm:col-span-2 text-[13.5px] text-gray-500">
        * Required. Include a phone or email so we can reach you. Replies within one business day.
      </p>
    </form>
  );
}
