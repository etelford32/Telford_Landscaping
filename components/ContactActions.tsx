import type { ReactNode } from "react";
import { Phone, Mail } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";
import { callHref, bidRequestMailto } from "@/lib/contactLinks";

type Variant = "solid" | "light" | "outline" | "bare";

const VARIANTS: Record<Variant, string> = {
  // Green gradient key — the primary action on a light background.
  solid:
    "btn-3d inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-primary-600 to-green-600 " +
    "hover:from-primary-500 hover:to-green-500 text-white font-bold px-7 py-3.5 rounded-xl",
  // White key for dark sections.
  light:
    "btn-3d btn-3d-dark inline-flex items-center justify-center gap-2.5 bg-white text-primary-900 " +
    "font-bold px-7 py-3.5 rounded-xl hover:bg-primary-50",
  // Secondary action on a light background.
  outline:
    "btn-3d btn-3d-dark inline-flex items-center justify-center gap-2.5 bg-white text-primary-800 " +
    "font-semibold px-7 py-3.5 rounded-xl border-[1.5px] border-earth-200",
  // No chrome — the caller styles it entirely.
  bare: "",
};

interface ActionProps {
  /**
   * Where on the page this CTA lives, e.g. "hero" — reported to analytics as
   * cta_location by the site-wide click listener (lib/analytics.ts).
   */
  context: string;
  variant?: Variant;
  className?: string;
  /** Defaults to an icon + the phone number / email address. */
  children?: ReactNode;
}

/** Click-to-call link. On desktop it still opens the default dialer/Skype. */
export function CallLink({ context, variant = "solid", className = "", children }: ActionProps) {
  return (
    <a
      href={callHref}
      className={`${VARIANTS[variant]} ${className}`.trim()}
      data-contact="phone"
      data-cta-location={context}
    >
      {children ?? (
        <>
          <Phone className="w-4 h-4 flex-shrink-0" /> {siteConfig.phone}
        </>
      )}
    </a>
  );
}

interface EmailLinkProps extends ActionProps {
  /** Portfolio project title, folded into the pre-filled subject and body. */
  project?: string;
}

/** Click-to-email link with a pre-filled subject and message scaffold. */
export function EmailLink({
  context,
  project,
  variant = "outline",
  className = "",
  children,
}: EmailLinkProps) {
  return (
    <a
      href={bidRequestMailto(project)}
      className={`${VARIANTS[variant]} ${className}`.trim()}
      data-contact="email"
      data-cta-location={context}
    >
      {children ?? (
        <>
          <Mail className="w-4 h-4 flex-shrink-0" /> {siteConfig.email}
        </>
      )}
    </a>
  );
}
