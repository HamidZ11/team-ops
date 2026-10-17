import type { Metadata } from "next";
import { InlineScript } from "@/components/ui/inline-script";
import { SIDEBAR_BOOTSTRAP } from "@/prototypes/unified/sidebar-bootstrap";
import { UnifiedApp } from "@/prototypes/unified/unified-app";

export const metadata: Metadata = { title: "Meridian" };

/** Meridian: the Unified design is the application. */
export default function Home() {
  return (
    <>
      {/* Apply the saved sidebar preference before first paint. */}
      <InlineScript html={SIDEBAR_BOOTSTRAP} />
      <UnifiedApp />
    </>
  );
}
