import { notFound } from "next/navigation";
import { ConceptPicker } from "@/prototypes/concept-picker";
import { EXPLORE_ENABLED } from "@/prototypes/explore-enabled";

/** Design exploration: concept index and experiments. Development only. */
export default function ExploreLayout({ children }: LayoutProps<"/explore">) {
  if (!EXPLORE_ENABLED) notFound();
  return (
    <>
      {children}
      <ConceptPicker />
    </>
  );
}
