"use client";

import Link from "next/link";
import ShoppingList from "@/components/ShoppingList";
import { buildShoppingList, listAsText } from "@/lib/grocery";
import { useLocalWeek } from "@/lib/local-week";

// app/list/page.js for the share site: built in the browser from the visitor's
// slots, with the pantry staples baked in at build time. No cart send.
export default function ShareList({ recipes, pantry }) {
  const week = useLocalWeek();
  const chosen = week.slots.map((s) => recipes.find((r) => r.slug === s)).filter(Boolean);
  const list = buildShoppingList(chosen, pantry);

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
        <ShoppingList list={list} text={listAsText(list)} recipes={chosen} cart={false} />
      ) : (
        <div className="empty" style={{ marginTop: 30 }}>
          <p>No slots filled yet.</p>
          <Link className="btn" href="/" style={{ marginTop: 16 }}>Roll this week</Link>
        </div>
      )}
    </>
  );
}
