import Link from "next/link";
import { cardSvg } from "@/lib/art";

export function CardArt({ recipe, className = "art", aspect }) {
  // A recipe with an `image:` in its frontmatter gets that picture instead of
  // the generated themed illustration.
  if (recipe.image) {
    return (
      <div className={className}>
        <img src={recipe.image} alt={recipe.title} loading="lazy" />
      </div>
    );
  }
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: cardSvg(recipe, { aspect }) }} />
  );
}

export function Chips({ recipe }) {
  return (
    <div className="meta">
      <span className="chip" data-tone="pop">{recipe.cuisine}</span>
      {recipe.totalTime ? <span className="chip">{recipe.totalTime} min</span> : null}
      {recipe.weather !== "any" ? (
        <span className="chip" data-tone={recipe.weather === "cozy" ? "hot" : "cool"}>
          {recipe.weather === "cozy" ? "cozy" : "cool"}
        </span>
      ) : null}
    </div>
  );
}

export default function Card({ recipe }) {
  return (
    <Link href={`/recipe/${recipe.slug}`} className="card">
      <CardArt recipe={recipe} />
      <div className="plate">
        <h3 className="title">{recipe.title}</h3>
        <Chips recipe={recipe} />
      </div>
    </Link>
  );
}
