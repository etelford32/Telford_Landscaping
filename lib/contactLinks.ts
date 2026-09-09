/**
 * Builders for the two actions this site exists to produce: a phone call and
 * an email. Keeping them here means every CTA on the site opens the same
 * pre-filled message, and the phone/email live in one place (siteConfig).
 */
import { siteConfig } from "./siteConfig";

/** tel: href for the business line. */
export const callHref = siteConfig.phoneHref;

/**
 * mailto: href pre-filled with a subject and a short scaffold, so a prospect
 * only has to fill blanks instead of composing from scratch — and so the
 * reply arrives with the address and a callback time already in it.
 *
 * @param projectTitle Name of the portfolio project that prompted the email.
 */
export function bidRequestMailto(projectTitle?: string): string {
  const subject = projectTitle
    ? `Bid request — something like your ${projectTitle}`
    : `Bid request — ${siteConfig.name}`;

  const opening = projectTitle
    ? `I saw the ${projectTitle} on your portfolio page and I'd like something like it on my property.`
    : `I'd like a bid on a project at my property.`;

  const body = [
    "Hi Elliot,",
    "",
    opening,
    "",
    "Property address:",
    "Best number and time to reach me:",
    "What I have in mind:",
    "",
  ].join("\r\n");

  return `mailto:${siteConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
