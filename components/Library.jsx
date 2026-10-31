"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Library({ items, cuisines }) {
  const [cuisine, setCuisine] = useState("all");
  const [weather, setWeather] = useState("all");
  const filtersRef = useRef(null);

  // Cuisine headings stick directly beneath the filter bar.
  useEffect(() => {
    const el = filtersRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty("--filters-h", `${Math.round(el.offsetHeight)}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shown = items.filter(
    (r) =>
      (cuisine === "all" || r.cuisine === cuisine) &&
      (weather === "all" || r.weather === weather)
  );

  // Grouped by cuisine so the headings give the scroll some rhythm.
  const groups = [];
  for (const item of [...shown].sort(
    (a, b) => a.cuisine.localeCompare(b.cuisine) || a.title.localeCompare(b.title)
  )) {
    const last = groups[groups.length - 1];
    if (!last || last.cuisine !== item.cuisine) groups.push({ cuisine: item.cuisine, items: [item] });
    else last.items.push(item);
  }

  if (!items.length) {
    return (
      <div className="empty" style={{ marginTop: 30 }}>
        <p>Nothing here yet.</p>
        <Link className="btn" href="/capture" style={{ marginTop: 16 }}>Add a recipe</Link>
      </div>
    );
  }

  return (
    <>
      <div className="filters" ref={filtersRef}>
        <div className="tagrow">
          <button className="tag" data-active={cuisine === "all"} onClick={() => setCuisine("all")}>All</button>
          {cuisines.map((c) => (
            <button key={c} className="tag" data-active={cuisine === c} onClick={() => setCuisine(c)}>{c}</button>
          ))}
          <span className="tagsep" />
          <button className="tag" data-active={weather === "cozy"} onClick={() => setWeather(weather === "cozy" ? "all" : "cozy")}>Cozy</button>
          <button className="tag" data-active={weather === "cool"} onClick={() => setWeather(weather === "cool" ? "all" : "cool")}>Cool</button>
        </div>
      </div>

      {groups.map((group) => (
        <section className="libgroup" key={group.cuisine}>
          <h2 className="libhead">
            <span>{group.cuisine}</span>
            <em>{group.items.length}</em>
          </h2>
          <ul className="liblist">
            {group.items.map((item) => (
              <li key={item.slug}>
                <Link href={`/recipe/${item.slug}`} className="librow">
                  <span className="libicon">{item.icon}</span>
                  <span className="libmain">
                    <span className="libtitle">{item.title}</span>
                    <span className="libmeta">
                      {[item.category, item.totalTime ? `${item.totalTime} min` : null]
                        .filter(Boolean)
                        .join(" · ")}
                      {item.weather !== "any" ? (
                        <em data-weather={item.weather}>
                          {item.weather === "cozy" ? "cozy weather" : "warm weather"}
                        </em>
                      ) : null}
                    </span>
                  </span>
                  <span className="libgo">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {!shown.length ? <div className="empty" style={{ marginTop: 26 }}>Nothing matches that filter.</div> : null}
    </>
  );
}
