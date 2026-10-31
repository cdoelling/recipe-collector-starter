// Share build only (SHARE_BUILD=1 → pageExtensions ["share.js"]): the read-only
// site published to GitHub Pages. Same look as app/layout.js, but the week
// lives in each visitor's browser, so the dock reads it there.
import { Archivo_Black, Space_Mono, Jost } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import ShareDock from "@/components/ShareDock";
import { allRecipes } from "@/lib/recipes";

const archivo = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--f-archivo" });
const mono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--f-mono" });
const jost = Jost({ subsets: ["latin"], variable: "--f-jost" });

const FONTS = [archivo, mono, jost]
  .map((f) => f.variable)
  .join(" ");

const LINKS = [
  ["/", "This Week"],
  ["/library", "Library"],
  ["/list", "List"],
];

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

export default function ShareLayout({ children }) {
  // Just what a card needs — the dock is on every page.
  const recipes = allRecipes().map(({ slug, title, cuisine, weather, motif, image }) => ({
    slug, title, cuisine, weather, motif, image,
  }));

  return (
    <html lang="en" className={FONTS}>
      <body>
        <Nav links={LINKS} />
        <main className="shell">{children}</main>
        <ShareDock recipes={recipes} />
      </body>
    </html>
  );
}
