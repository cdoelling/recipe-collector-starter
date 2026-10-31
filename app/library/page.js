import { allRecipes } from "@/lib/recipes";
import Library from "@/components/Library";
import { CardArt } from "@/components/Card";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const recipes = allRecipes();
  const cuisines = [...new Set(recipes.map((r) => r.cuisine))].sort();

  return (
    <>
      <div style={{ paddingTop: 30 }}>
        <p className="eyebrow">{recipes.length} recipe{recipes.length === 1 ? "" : "s"}</p>
        <h1 className="page">The library</h1>
      </div>
      <Library
        cuisines={cuisines}
        items={recipes.map((recipe) => ({
          slug: recipe.slug,
          title: recipe.title,
          cuisine: recipe.cuisine,
          category: recipe.category,
          weather: recipe.weather,
          totalTime: recipe.totalTime,
          // Square crop — at this size the art reads as an icon, not a scene.
          icon: <CardArt recipe={recipe} aspect={1} className="" />,
        }))}
      />
    </>
  );
}
