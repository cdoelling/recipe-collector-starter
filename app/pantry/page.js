import { readPantry } from "@/lib/shopping";
import Pantry from "@/components/Pantry";

export const dynamic = "force-dynamic";

export default function PantryPage() {
  const staples = readPantry();
  return (
    <>
      <div style={{ paddingTop: 30 }}>
        <p className="eyebrow">{staples.length} staples</p>
        <h1 className="page">What&apos;s already in the cabinet</h1>
        <p className="lede">
          Anything on this list is left off the shopping list. Take something off if you&apos;d
          rather be reminded to check you still have it.
        </p>
      </div>
      <Pantry initial={staples} />
    </>
  );
}
