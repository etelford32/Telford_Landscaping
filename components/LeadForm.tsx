"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import { getAttribution, trackEvent } from "@/lib/analytics";
import { MESSAGE_MAX } from "@/lib/leads";

interface LeadFormProps {
  /** Pre-fills the hidden "service" field so we know which page the lead came from. */
  service?: string;
  /** Text for the submit button. */
  submitLabel?: string;
  /** Optional short line under the button. */
  note?: string;
}

/**
 * Reusable "request a bid" form. Posts to /api/contact/lead, which emails the
 * lead to the inbox, and reports success / failure inline. Shared by the
 * homepage contact section, the portfolio, and each of the fire-wise /
 * water-smart / native lead pages.
 *
 * Reports each funnel step to GA — lead_form_view → lead_form_start →
 * lead_form_submit → generate_lead (or lead_form_error) — tagged with
 * `service` so every placement can be compared (see lib/analytics.ts).
 */
export default function LeadForm({
  service = "General inquiry",
  submitLabel = "Request Free Consultation",
  note = "Replies within one business day. No pressure, no phone trees.",
}: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const startedRef = useRef(false);

  // lead_form_view: once, when the form is mostly on screen.
  useEffect(() => {
    const el = formRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        trackEvent("lead_form_view", { service });
        io.disconnect();
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [service]);

  // lead_form_start: once, on the first field focus.
  function handleFocus() {
    if (startedRef.current) return;
    startedRef.current = true;
    trackEvent("lead_form_start", { service });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    trackEvent("lead_form_submit", { service });

    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      city: String(fd.get("city") ?? ""),
      service,
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
      page: window.location.pathname,
      attribution: getAttribution(),
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
        trackEvent("lead_form_error", { service, error_type: res.status >= 500 ? "server" : "validation" });
        return;
      }
      setStatus("success");
      trackEvent("generate_lead", { service, lead_city: payload.city || undefined });
      form.reset();
    } catch {
      setError("Network error. Please call or email us instead.");
      setStatus("error");
      trackEvent("lead_form_error", { service, error_type: "network" });
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center text-center rounded-2xl border-2 border-primary-200 bg-primary-50 p-10 min-h-[280px]">
        <CheckCircle2 className="w-14 h-14 text-primary-600 mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Request received</h3>
        <p className="text-gray-700 max-w-sm">
          Thanks — we&rsquo;ll be in touch within one business day. If it&rsquo;s urgent, call or text{" "}
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

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onFocus={handleFocus}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {/* Honeypot: invisible to people, tempting to form-filling bots. */}
      <div aria-hidden="true" className="absolute -left-[10000px] w-px h-px overflow-hidden">
        <label>
          Leave this field empty
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input
        name="name"
        type="text"
        required
        placeholder="Full name"
        aria-label="Full name"
        className={fieldCls}
      />
      <input
        name="phone"
        type="tel"
        placeholder="Phone"
        aria-label="Phone"
        className={fieldCls}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        aria-label="Email"
        className={`${fieldCls} sm:col-span-2`}
      />
      <select name="city" aria-label="City" defaultValue="" className={`${fieldCls} sm:col-span-2`}>
        <option value="" disabled>
          City
        </option>
        {siteConfig.cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
        <option value="Other">Other</option>
      </select>
      <textarea
        name="message"
        placeholder="Tell us about the property and what you have in mind"
        aria-label="Project details"
        rows={4}
        maxLength={MESSAGE_MAX}
        className={`${fieldCls} sm:col-span-2 resize-y min-h-[110px]`}
      />

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
            {submitLabel}
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
      <p className="sm:col-span-2 text-[13.5px] text-gray-500">{note}</p>
    </form>
  );
}
