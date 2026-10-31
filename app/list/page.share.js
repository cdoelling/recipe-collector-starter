import ShareList from "@/components/ShareList";
import { allRecipes } from "@/lib/recipes";
import { readPantry } from "@/lib/shopping";

export default function ShareListPage() {
  // Full recipes: the list needs ingredients and the booklet prints the steps.
  return <ShareList recipes={allRecipes()} pantry={readPantry()} />;
}
