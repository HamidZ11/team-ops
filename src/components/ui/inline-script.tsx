"use client";

/**
 * Runs a small script during HTML parsing, before first paint (Next's
 * "preventing flash before hydration" pattern). On the client the tag is inert
 * text, so React doesn't warn or re-run it.
 *
 * Must be a Client Component: `typeof window` has to be evaluated in the
 * browser. As a Server Component it always rendered type="text/javascript",
 * so a client-side navigation made React create an executable <script> and warn.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
