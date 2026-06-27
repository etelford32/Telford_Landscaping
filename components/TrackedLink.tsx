'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { trackCtaClick } from '@/lib/analytics';

type TrackedLinkProps = ComponentProps<typeof Link> & {
  /** Stable identifier for this CTA, e.g. 'open_design_tool'. */
  ctaId: string;
  /** Where the CTA lives, e.g. 'hero' or 'design_tool_section'. */
  ctaLocation: string;
};

/**
 * A next/link that fires a `cta_click` analytics event when clicked. Lets us
 * keep server-rendered pages while still tracking the key conversion CTAs.
 */
export default function TrackedLink({
  ctaId,
  ctaLocation,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        trackCtaClick(ctaId, ctaLocation);
        onClick?.(e);
      }}
    />
  );
}
