import { notFound } from "next/navigation";
import { ConceptPicker } from "@/prototypes/concept-picker";
import { EXPLORE_ENABLED } from "@/prototypes/explore-enabled";

/** Concepts A and B, kept for reference. Development only. */
export default function PrototypesLayout({ children }: LayoutProps<"/prototypes">) {
  if (!EXPLORE_ENABLED) notFound();
  return (
    <>
      {children}
      <ConceptPicker />
    </>
  );
}
