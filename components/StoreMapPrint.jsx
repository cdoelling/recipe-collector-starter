import { useLayoutEffect, useRef } from "react";
import { ZONES } from "@/lib/grocery";
import { menuTheme } from "@/lib/menu-theme";

// The shopping list PDF: one landscape page shaped like a grocery store. Fresh
// food on the walls (produce left, meat along the back, dairy right, bakery and
// frozen up front), shelf-stable food in the numbered middle aisles, and a side
// panel with the week's dinners and blank "Oh Babe, Don't Forget" lines. The
// layout never changes; only the colors follow the week (lib/menu-theme.js).
// Mounted only while printing. Styles: "Store map" in globals.css.

const BLANK_LINES = 9;

// "dried thyme" and "thyme", "kosher salt" and "salt" are one jar to check.
function pantryLabels(staples) {
  const label = (s) => s.replace(/^(dried|ground|unsalted|granulated|all purpose|all-purpose)\s+/i, "");
  const out = [...new Set(staples.map(label))];
  return out.map((s) => s.charAt(0).toUpperCase() + s.slice(1));
}
const PAGE_PX = 8.5 * 96;
// If the page won't fit, a wall with more items than this widens into two columns.
const WIDE_AT = 16;

// A big week can outgrow the page. Before printing, try narrow walls first and
// shrink the type a quarter point at a time; only if that bottoms out do the
// walls widen into two columns (WIDE_AT), then shrink again (down to 6.5pt).
function useFitToPage(ref) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const store = el.querySelector(".store");
    el.style.display = "block";
    el.style.visibility = "hidden";
    const fits = () => el.offsetHeight <= PAGE_PX;
    const attempt = (wide, floor) => {
      for (const side of ["left", "right"]) {
        if (wide && Number(store.dataset[`${side}Count`]) > WIDE_AT) store.dataset[side] = "wide";
        else delete store.dataset[side];
      }
      for (let pt = 8.5; pt >= floor; pt -= 0.25) {
        el.style.setProperty("--fs", `${pt}pt`);
        if (fits()) return true;
      }
      return false;
    };
    attempt(false, 7.5) || attempt(true, 6.5);
    el.style.display = "";
    el.style.visibility = "";
  }, [ref]);
}

function Zone({ zone, items, className }) {
  return (
    <section className={`zone ${className}`}>
      <h3>
        {zone.n ? <span className="aisle-n">{zone.n}</span> : null}
        {zone.name}
      </h3>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item.key}>
              <span className="box" />
              <span>
                {item.amount ? <b>{item.amount} </b> : null}
                {item.name}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="zone-empty">Nothing here this week. Keep walking.</p>
      )}
    </section>
  );
}

export default function StoreMapPrint({ list, recipes = [] }) {
  const ref = useRef(null);
  useFitToPage(ref);
  const theme = menuTheme();
  const { palette } = theme;
  const style = {
    "--m-paper": palette.paper,
    "--m-ink": palette.ink,
    "--m-accent": palette.accent,
    "--m-soft": palette.soft,
  };
  const itemsFor = (name) => list.sections.find((s) => s.aisle === name)?.items ?? [];
  const byPlace = (place) => ZONES.find((z) => z.place === place);
  const aisles = ZONES.filter((z) => z.place === "aisle");
  const elsewhere = itemsFor("Everything else");
  const staples = pantryLabels(list.staples ?? []);

  return (
    <div ref={ref} className="print-only print-shopping-list storemap" style={style}>
      <style>{`@media print { @page { size: 11in 8.5in; margin: 0; } html, body { background: ${palette.paper} !important; } body *:not(:has(.storemap)):not(.storemap, .storemap *) { display: none !important; } }`}</style>

      <header className="storemap-head">
        <div>
          <p className="storemap-eyebrow">
            Week {theme.week} {"·"} {theme.range} {"·"} {theme.season.name}
          </p>
          <h1>Hey Babe, here&rsquo;s the list.</h1>
        </div>
        <p className="storemap-count">
          {list.count} thing{list.count === 1 ? "" : "s"} to grab {theme.ornament}
        </p>
      </header>

      <div className="storemap-body">
        <div
          className="store"
          data-left-count={itemsFor(byPlace("left").name).length}
          data-right-count={itemsFor(byPlace("right").name).length}
        >
          <Zone zone={byPlace("back")} items={itemsFor(byPlace("back").name)} className="wall wall-back" />
          <Zone zone={byPlace("left")} items={itemsFor(byPlace("left").name)} className="wall wall-left" />
          {/* Three shelving runs, two aisles each (1 over 4, 2 over 5, 3 over 6),
              so a long aisle shares its run with a short one. */}
          <div className="aisles">
            {[0, 1, 2].map((col) => (
              <div className="aisle-run" key={col}>
                {[aisles[col], aisles[col + 3]].filter(Boolean).map((z) => (
                  <Zone key={z.name} zone={z} items={itemsFor(z.name)} className="aisle-zone" />
                ))}
              </div>
            ))}
          </div>
          <Zone zone={byPlace("right")} items={itemsFor(byPlace("right").name)} className="wall wall-right" />
          <div className="front">
            <Zone zone={byPlace("front-left")} items={itemsFor(byPlace("front-left").name)} className="wall" />
            <section className="zone pantry-check">
              <h3>Babe, double check what we already have</h3>
              {staples.length ? (
                <ul>
                  {staples.map((s) => (
                    <li key={s}><span className="box" /><span>{s}</span></li>
                  ))}
                </ul>
              ) : (
                <p className="zone-empty">Nothing from the pantry this week.</p>
              )}
            </section>
            <Zone zone={byPlace("front-right")} items={itemsFor(byPlace("front-right").name)} className="wall" />
          </div>
        </div>

        <aside className="storemap-side">
          {recipes.length ? (
            <section className="side-card">
              <h3>For these dinners</h3>
              <ol>
                {recipes.map((r) => <li key={r.slug}>{r.title}</li>)}
              </ol>
            </section>
          ) : null}

          {elsewhere.length ? (
            <section className="side-card">
              <h3>Somewhere in the store</h3>
              <ul className="side-items">
                {elsewhere.map((item) => (
                  <li key={item.key}>
                    <span className="box" />
                    <span>{item.amount ? <b>{item.amount} </b> : null}{item.name}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="side-card forget">
            <h3>Oh Babe,<br />Don&rsquo;t Forget</h3>
            <ul className="blank-lines">
              {Array.from({ length: BLANK_LINES }, (_, i) => (
                <li key={i}><span className="box" /><span className="line" /></li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
