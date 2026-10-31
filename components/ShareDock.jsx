"use client";

import Dock from "@/components/Dock";
import { CardArt } from "@/components/Card";
import { useLocalWeek, writeLocalWeek } from "@/lib/local-week";

// The app's seven-slot dock, filled from the visitor's browser instead of
// data/week.json.
export default function ShareDock({ recipes }) {
  const week = useLocalWeek();
  const booked = week.slots.map((slug) => recipes.find((r) => r.slug === slug)).filter(Boolean);

  const slots = Array.from({ length: 7 }, (_, i) => {
    const recipe = booked[i];
    if (!recipe) return null;
    return {
      slug: recipe.slug,
      title: recipe.title,
      art: <CardArt recipe={recipe} aspect={1} className="" />,
    };
  });

  return (
    <Dock
      slots={slots}
      hasList={booked.length > 0}
      onRemove={(slug) => writeLocalWeek({ slots: week.slots.filter((s) => s !== slug) })}
    />
  );
}
