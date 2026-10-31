import Link from "next/link";
import { allRecipes } from "@/lib/recipes";
import { readWeek } from "@/lib/week";
import { buildShoppingList, listAsText } from "@/lib/shopping";
import ShoppingList from "@/components/ShoppingList";

export const dynamic = "force-dynamic";

export default function ListPage() {
  const recipes = allRecipes();
  const week = readWeek();
  const chosen = week.slots.map((s) => recipes.find((r) => r.slug === s)).filter(Boolean);
  const list = buildShoppingList(chosen);

  return (
    <>
      <div style={{ paddingTop: 30 }}>
        <p className="eyebrow">{list.count} item{list.count === 1 ? "" : "s"} to buy</p>
        <h1 className="page">Shopping list</h1>
        <p className="lede">
          {chosen.length
            ? `From ${chosen.map((r) => r.title).join(", ")}.`
            : "Fill some slots on the This Week page and they'll show up here."}
        </p>
      </div>

      {chosen.length ? (
        <ShoppingList list={list} text={listAsText(list)} recipes={chosen} />
      ) : (
        <div className="empty" style={{ marginTop: 30 }}>
          <p>No slots filled yet.</p>
          <Link className="btn" href="/" style={{ marginTop: 16 }}>Roll this week</Link>
        </div>
      )}
    </>
  );
}
