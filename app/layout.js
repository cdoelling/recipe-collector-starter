import { Archivo_Black, Space_Mono, Jost } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Dock from "@/components/Dock";
import { allRecipes } from "@/lib/recipes";
import { readWeek, SLOT_COUNT } from "@/lib/week";
import { CardArt } from "@/components/Card";

const archivo = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--f-archivo" });
const mono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--f-mono" });
const jost = Jost({ subsets: ["latin"], variable: "--f-jost" });

const FONTS = [archivo, mono, jost]
  .map((f) => f.variable)
  .join(" ");

export const metadata = {
  title: "Recipe Collector",
  description: "Seven dinners a week, picked for the weather.",
  appleWebApp: { capable: true, title: "Recipes", statusBarStyle: "black-translucent" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }) {
  const recipes = allRecipes();
  const week = readWeek();

  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => {
    const recipe = recipes.find((r) => r.slug === week.slots[i]);
    if (!recipe) return null;
    return {
      slug: recipe.slug,
      title: recipe.title,
      art: <CardArt recipe={recipe} aspect={1} className="" />,
    };
  });

  return (
    <html lang="en" className={FONTS}>
      <body>
        <Nav />
        <main className="shell">{children}</main>
        <Dock
          slots={slots}
          hasList={week.slots.length > 0}
        />
      </body>
    </html>
  );
}
