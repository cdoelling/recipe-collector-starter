import { groupIngredients, formatQty } from "@/lib/format";
import { factsForWeek } from "@/lib/food-facts";
import { menuTheme } from "@/lib/menu-theme";
import { CardArt } from "@/components/Card";
import Rich from "@/components/Rich";

// The "menu of the week" PDF: cover, the menu, a page per dinner (with its
// house-voice note, closer and a food-history fact), then the shopping list.
// Only mounted while printing, so the week's date, look and facts come from
// the moment you press the button. Styles: "Menu of the week" in globals.css.

// Eager <img> rather than CardArt's lazy one: lazy images inside a hidden
// print-only block never load, and usePrint waits on these before printing.
function Art({ recipe, className }) {
  if (recipe.image) return <img className={className} src={recipe.image} alt="" />;
  return <CardArt recipe={recipe} className={className} />;
}

const meta = (recipe) =>
  [
    recipe.cuisine,
    recipe.totalTime ? `${recipe.totalTime} min` : null,
    recipe.serves ? `serves ${recipe.serves}` : null,
  ].filter(Boolean).join(" · ");

export default function MenuPrint({ recipes, list }) {
  const theme = menuTheme();
  const facts = factsForWeek(recipes, theme.seed);
  const { palette } = theme;
  const style = {
    "--m-paper": palette.paper,
    "--m-ink": palette.ink,
    "--m-accent": palette.accent,
    "--m-soft": palette.soft,
  };

  return (
    <div className="print-only print-recipe-booklet menu" data-layout={theme.layout} style={style}>
      {/* Full-bleed color: no page margins (the sections pad themselves) and a
          tinted page behind them. Only mounted while the menu prints, so the
          plain shopping list keeps its normal margins. */}
      <style>{`@media print { @page { margin: 0; } html, body { background: ${palette.paper} !important; } }`}</style>
      <section className="menu-cover">
        <div className="menu-cover-frame">
          <p className="menu-eyebrow">
            Week {theme.week} {"·"} {theme.range}
          </p>
          <p className="menu-season">
            {theme.ornament} {theme.season.name} {theme.ornament}
          </p>
          <h1 className="menu-headline">{theme.headline}</h1>
          <div className="menu-cover-art" data-count={Math.min(recipes.length, 7)}>
            {recipes.slice(0, 7).map((r) => (
              <Art key={r.slug} recipe={r} className="menu-thumb" />
            ))}
          </div>
        </div>
      </section>

      <section className="menu-card" data-full={recipes.length > 5 || undefined}>
        <p className="menu-eyebrow">On the menu</p>
        <h2 className="menu-title">This week&rsquo;s dinners</h2>
        <ol className="menu-list">
          {recipes.map((r, i) => (
            <li key={r.slug}>
              <span className="menu-num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{r.title}</h3>
                {r.blurb ? <p className="menu-blurb">{r.blurb}</p> : null}
                <p className="menu-meta">{meta(r)}</p>
              </div>
              <Art recipe={r} className="menu-list-art" />
            </li>
          ))}
        </ol>
        <p className="menu-ornament">{theme.ornament}</p>
      </section>

      {recipes.map((recipe, i) => (
        <article className="menu-recipe" key={recipe.slug}>
          <Art recipe={recipe} className="menu-hero" />
          <header>
            <p className="menu-eyebrow">
              No. {String(i + 1).padStart(2, "0")} {"·"} {meta(recipe)}
            </p>
            <h2 className="menu-title">{recipe.title}</h2>
            {recipe.blurb ? <p className="menu-blurb">{recipe.blurb}</p> : null}
          </header>

          {recipe.note ? (
            <aside className="menu-note">
              <h4>Before we start</h4>
              <p><Rich text={recipe.note} /></p>
            </aside>
          ) : null}

          <div className="menu-cols">
            <div>
              <h4>Ingredients</h4>
              {groupIngredients(recipe.ingredients).map((g, gi) => (
                <div key={gi}>
                  {g.group ? <p className="print-ing-group">{g.group}</p> : null}
                  <ul className="print-ing">
                    {g.items.map((ing, j) => {
                      const amount = [ing.qty != null ? formatQty(ing.qty) : null, ing.unit].filter(Boolean).join(" ");
                      return (
                        <li key={j}>
                          <span>
                            {amount ? <b>{amount} </b> : null}
                            {ing.item}
                            {ing.note ? <span className="print-note">, {ing.note}</span> : null}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              {facts[recipe.slug] ? (
                <aside className="menu-fact">
                  <h4>Dinner-table trivia</h4>
                  <p>{facts[recipe.slug]}</p>
                </aside>
              ) : null}
            </div>
            <div>
              <h4>Instructions</h4>
              <ol className="menu-steps">
                {recipe.instructions.map((step, si) => (
                  <li key={si}><Rich text={step} /></li>
                ))}
              </ol>
            </div>
          </div>

          {recipe.closer ? (
            <p className="menu-closer">
              <span>Kitchen&rsquo;s closed</span> <Rich text={recipe.closer} />
            </p>
          ) : null}
        </article>
      ))}

      {list?.sections?.length ? (
        <section className="menu-shopping">
          <p className="menu-eyebrow">Last page, first stop</p>
          <h2 className="menu-title">The shopping list</h2>
          <div className="menu-aisles">
            {list.sections.map((section) => (
              <div className="print-aisle" key={section.aisle}>
                <h2>{section.aisle}</h2>
                <ul>
                  {section.items.map((item) => (
                    <li key={item.key}>
                      <span className="print-check">{"☐"}</span>
                      <span className="print-amt">{item.amount ?? ""}</span>
                      <span>{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
