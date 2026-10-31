import { allRecipes } from "@/lib/recipes";

// The app's recipe page, prerendered once per recipe.
export { default } from "./page.js";

export const dynamicParams = false;

export function generateStaticParams() {
  return allRecipes().map((r) => ({ slug: r.slug }));
}
