import ShareHome from "@/components/ShareHome";
import { allRecipes } from "@/lib/recipes";
import { seasonFor } from "@/lib/season";

export default function ShareHomePage() {
  // The roll only needs what a card shows; steps stay on the recipe pages.
  const recipes = allRecipes().map(({ instructions, ingredients, blurb, note, closer, ...card }) => card);
  return <ShareHome recipes={recipes} season={seasonFor()} />;
}
