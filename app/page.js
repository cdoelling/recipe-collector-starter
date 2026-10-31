import { allRecipes } from "@/lib/recipes";
import { readWeek, SLOT_COUNT } from "@/lib/week";
import { getWeather } from "@/lib/weather";
import WeekBoard from "@/components/WeekBoard";
import Card from "@/components/Card";
import WeatherPanel from "@/components/WeatherPanel";

export const dynamic = "force-dynamic";

export default async function Home() {
  const recipes = allRecipes();
  const week = readWeek();
  const weather = await getWeather();
  const rolled = week.rolled.map((slug) => recipes.find((r) => r.slug === slug)).filter(Boolean);

  return (
    <>
      <div style={{ paddingTop: 30 }}>
        <h1 className="page">Hey Babe, what sounds good?</h1>
      </div>

      <WeatherPanel weather={weather} />

      <WeekBoard
        hasRecipes={recipes.length > 0}
        hasRolled={week.rolled.length > 0}
        booked={week.slots}
        slotsLeft={SLOT_COUNT - week.slots.length}
        items={rolled.map((recipe) => ({
          slug: recipe.slug,
          title: recipe.title,
          card: <Card recipe={recipe} />,
        }))}
      />
    </>
  );
}
