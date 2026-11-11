"use client";

import Link from "next/link";
import { useAuth } from "@/lib/authContext";

/**
 * The one place a signed-out visitor can find sign-in. It lives in the footer
 * on purpose: accounts are for the design tool, and the header is reserved
 * for the two things a landscaping customer does — call, or ask for an
 * estimate.
 */
export default function FooterAccountLink() {
  const { user, loading, logout } = useAuth();
  if (loading) return null;

  if (!user) {
    return (
      <Link href="/login" data-cta="footer-sign-in" className="hover:text-primary-400 transition-colors">
        Design Tool Sign In
      </Link>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-x-2">
      <span>Signed in as {user.name}</span>
      <span aria-hidden>·</span>
      <button type="button" onClick={() => logout()} className="underline underline-offset-2 hover:text-primary-400 transition-colors">
        Sign out
      </button>
    </span>
  );
}
