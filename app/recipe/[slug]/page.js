import Link from "next/link";
import { notFound } from "next/navigation";
import { readRecipe, groupIngredients, formatQty } from "@/lib/recipes";
import { CardArt } from "@/components/Card";
import Rich from "@/components/Rich";
import { readCheck } from "@/lib/fact-check";

export const dynamic = "force-dynamic";

export default async function RecipePage({ params }) {
  const { slug } = await params;
  const recipe = readRecipe(slug);
  if (!recipe) notFound();

  // Ingredients keep their "For the sauce" groupings from the markdown.
  const groups = groupIngredients(recipe.ingredients);
  // The share site reuses this page; the fact check stays in the private app.
  const check = process.env.SHARE_BUILD === "1" ? null : readCheck(slug);

  return (
    <>
      <div className="hero">
        <CardArt recipe={recipe} aspect={16 / 9} />
        <div className="plate">
          <h1 className="title">{recipe.title}</h1>
          <div className="meta">
            <span className="chip" data-tone="pop">{recipe.cuisine}</span>
            {recipe.totalTime ? <span className="chip">{recipe.totalTime} min total</span> : null}
            {recipe.serves ? <span className="chip">serves {recipe.serves}</span> : null}
            {recipe.weather !== "any" ? (
              <span className="chip" data-tone={recipe.weather === "cozy" ? "hot" : "cool"}>
                {recipe.weather === "cozy" ? "cozy weather" : "warm weather"}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {recipe.blurb ? <p className="lede" style={{ marginBottom: 26 }}>{recipe.blurb}</p> : null}

      {recipe.note ? (
        <aside className="voice-note">
          <h3>Before we start</h3>
          <p><Rich text={recipe.note} /></p>
        </aside>
      ) : null}

      <div className="cols">
        <div className="panel">
          <h3>Ingredients</h3>
          {groups.map((g, i) => (
            <div key={i}>
              {g.group ? <p className="ing-group">{g.group}</p> : null}
              <ul className="ing">
                {g.items.map((ing, j) => (
                  <li key={j}>
                    <span className="qty">
                      {[ing.qty != null ? formatQty(ing.qty) : null, ing.unit].filter(Boolean).join(" ")}
                    </span>
                    <span>
                      {ing.item}
                      {ing.note ? <span className="note">{ing.note}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="panel">
          <h3>Instructions</h3>
          <ol className="steps">
            {recipe.instructions.map((step, i) => <li key={i}><span><Rich text={step} /></span></li>)}
          </ol>
        </div>
      </div>

      {recipe.closer ? (
        <p className="voice-closer">
          <span>Kitchen&apos;s closed</span> <Rich text={recipe.closer} />
        </p>
      ) : null}

      {check ? (
        <details className="fact-check" data-open={check.notes.length ? "look" : "ok"}>
          <summary>
            Fact-checked against {{ photo: "the photo", photos: "the photos", url: "the page", none: "nothing (no source)" }[check.source.kind]}
            {" · "}{check.fixes.length} fixed
            {check.notes.length ? ` · ${check.notes.length} to look at` : ""}
          </summary>
          {check.fixes.length ? (
            <>
              <p className="fact-check-head">Fixed</p>
              <ul>
                {check.fixes.map((fix, i) => (
                  <li key={i}>
                    {fix.why}
                    {fix.source_quote ? <span className="note">Source: “{fix.source_quote}”</span> : null}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          {check.notes.length ? (
            <>
              <p className="fact-check-head">To look at</p>
              <ul>
                {check.notes.map((note, i) => (
                  <li key={i}>
                    {note.issue}
                    {note.suggestion ? <span className="note">{note.suggestion}</span> : null}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <p className="note">Checked {new Date(check.checkedAt).toLocaleDateString()} · npm run check {slug}</p>
        </details>
      ) : null}

      <div className="btn-row">
        <Link className="btn" data-variant="ghost" href="/library">← Back to library</Link>
        {recipe.source ? (
          <a className="btn" data-variant="ghost" href={recipe.source} target="_blank" rel="noreferrer">
            Original source ↗
          </a>
        ) : null}
      </div>
    </>
  );
}
