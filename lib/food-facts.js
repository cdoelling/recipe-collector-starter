// Bite-sized food history, shared by the upload loading screen and the weekly
// menu PDF. Checked for the public site: anything that's a good story rather
// than documented history says "Legend has it." `keys` are lowercase words
// that, when found in a recipe's title or ingredients, pair the fact with
// that dish on the menu. No fs here, so client components can import it.

export const FACTS = [
  { text: "Honey barely spoils. Archaeologists have found pots of it in Egyptian tombs, thousands of years old and still edible.", keys: ["honey"] },
  { text: "Early cultivated carrots were purple or yellow. The orange carrot was developed by Dutch growers around the 1600s.", keys: ["carrot"] },
  { text: "In the 1830s, tomato ketchup was sold as medicine, pitched as a cure for indigestion.", keys: ["ketchup"] },
  { text: "Pre-sliced bread wasn't sold until 1928, in Chillicothe, Missouri.", keys: ["bread", "bun"] },
  { text: "Legend has it the 4th Earl of Sandwich wanted a meal he could eat one-handed at the card table, and the sandwich was born.", keys: ["bun"] },
  { text: "Black pepper was so valuable in medieval Europe that it was used to pay rent, dowries and taxes.", keys: ["peppercorn", "pepe"] },
  { text: "Popcorn is ancient. Popped kernels thousands of years old have been found preserved in Peru.", keys: ["corn"] },
  { text: "The croissant descends from the Austrian kipferl and reached Paris in the 1800s. The story that its crescent celebrates a victory over the Ottomans is legend.", keys: [] },
  { text: "Early Champagne makers considered the bubbles a flaw and tried to get rid of them.", keys: ["wine"] },
  { text: "Legend has it Europeans feared tomatoes as poisonous because acidic tomatoes leached lead from wealthy diners' pewter plates.", keys: ["tomato"] },
  { text: "It takes about 150 hand-picked crocus flowers to make a single gram of saffron.", keys: ["saffron"] },
  { text: "Fortune cookies aren't Chinese. They most likely trace to Japanese bakers in early-1900s California.", keys: [] },
  { text: "Cashews are never sold in the shell. It holds a caustic oil related to the one in poison ivy.", keys: ["cashew"] },
  { text: "The Aztecs drank their chocolate bitter and spiced, and used cacao beans as money.", keys: ["chocolate", "cacao"] },
  { text: "Belgium and France both claim the French fry, and neither is backing down.", keys: ["fries", "russet"] },
  { text: "Legend has it the pretzel's twist was shaped by monks to look like arms crossed in prayer.", keys: ["pretzel"] },
  { text: "Legend has it Worcestershire sauce began as a failed batch, forgotten in a cellar for years until someone tasted it again.", keys: ["worcestershire"] },
  { text: "Vanilla is one of the world's most expensive spices, partly because almost every flower is pollinated by hand.", keys: ["vanilla"] },
  { text: "Ancient Romans seasoned nearly everything with garum, a fermented fish sauce. Think of it as their ketchup.", keys: ["fish sauce"] },
  { text: "When the fork arrived in medieval Europe, some clergy preached against it as sinfully fussy.", keys: [] },
  { text: "Medieval Norwegians sometimes paid their taxes in butter.", keys: ["butter"] },
  { text: "The oldest noodles ever found, about 4,000 years old, turned up in China, and they were made from millet.", keys: ["noodle", "ramen", "soba"] },
  { text: "\"Pasta\" simply means \"dough\" in Italian.", keys: ["pasta", "spaghetti", "rigatoni", "orecchiette", "pappardelle", "lasagna", "casarecce", "tonnarelli"] },
  { text: "Bagels were being boiled before baking as far back as 1600s Poland.", keys: [] },
  { text: "Sourdough starters can live for generations. Some bakeries keep starters more than 100 years old.", keys: [] },
  { text: "Wheat was one of the first crops humans ever farmed, more than 10,000 years ago in the Fertile Crescent.", keys: ["flour", "panko"] },
  { text: "Cheesemaking is at least 7,000 years old. Residue has been found in ancient pottery from what's now Poland.", keys: ["cheddar", "fontina", "pepper jack", "cream cheese"] },
  { text: "Parmesan is so valuable that at least one Italian bank accepts wheels of it as loan collateral.", keys: ["parm", "reggiano"] },
  { text: "Blue cheese gets its veins from mold, traditionally encouraged by aging the wheels in caves.", keys: [] },
  { text: "Mozzarella was traditionally made from water buffalo milk in southern Italy.", keys: ["mozzarella", "burrata"] },
  { text: "Cinnamon is tree bark, and the ancient world prized it as a gift fit for kings and gods.", keys: ["cinnamon"] },
  { text: "In 1667 the Dutch let the English keep Manhattan, and kept Run, a tiny island that grew nutmeg.", keys: ["nutmeg"] },
  { text: "The word \"salary\" comes from the Latin for salt. Legend has it Roman soldiers were paid in it.", keys: ["flaky sea salt"] },
  { text: "Star anise and anise taste alike but aren't related at all.", keys: ["star anise"] },
  { text: "MSG was discovered in 1908 by a Japanese chemist trying to work out why kombu broth tasted so savory.", keys: ["msg"] },
  { text: "People drank chocolate for thousands of years before anyone made a solid chocolate bar in the 1800s.", keys: [] },
  { text: "Legend has it coffee was discovered by an Ethiopian goat herder whose goats got frisky after eating the cherries.", keys: [] },
  { text: "Legend has it tea was discovered in China in 2737 BCE, when leaves blew into an emperor's pot of boiling water.", keys: [] },
  { text: "White chocolate isn't technically chocolate. It has cocoa butter but no cocoa solids.", keys: [] },
  { text: "Instant coffee existed for decades before World War II soldiers made it popular.", keys: [] },
  { text: "Botanically, bananas are berries and strawberries aren't.", keys: [] },
  { text: "A pineapple takes about two years to grow.", keys: ["pineapple"] },
  { text: "Apples float because they're roughly a quarter air.", keys: ["apple"] },
  { text: "Wild watermelons were pale and bitter. The sweet red ones are the work of centuries of breeding.", keys: ["watermelon"] },
  { text: "Peanuts aren't nuts. They're legumes that grow underground.", keys: ["peanut"] },
  { text: "Botanically, an avocado is a berry with a single seed.", keys: ["avocado"] },
  { text: "Turkeys were domesticated in Mexico. The English name comes from a mix-up with a different bird imported through Turkey.", keys: ["turkey"] },
  { text: "Spam launched in 1937 and became a wartime staple because it didn't need refrigerating.", keys: [] },
  { text: "\"Wiener\" comes from Wien, the German name for Vienna, where that sausage style comes from.", keys: [] },
  { text: "Mesopotamians were brewing beer at least 5,000 years ago.", keys: ["beer"] },
  { text: "Marco Polo did not bring pasta to Italy. Italians were already eating it.", keys: ["pasta", "spaghetti", "rigatoni"] },
  { text: "Medieval feasts featured \"subtleties,\" elaborate sculptures made entirely of sugar.", keys: ["sugar"] },
  { text: "Wealthy ancient Greeks and Romans ate their banquets lying down on couches.", keys: [] },
  { text: "Before refrigerators, ice was cut from frozen lakes in New England and shipped as far as India.", keys: [] },
  { text: "Trail mix caught on with hikers in the 1960s and '70s, but fruit-and-nut mixes go back much further.", keys: ["nuts"] },
  { text: "The Titanic's last first-class dinner ran about ten courses, including oysters and foie gras.", keys: ["oysters"] },
  { text: "Sugar was once so costly that wealthy households kept it in locked boxes.", keys: ["brown sugar"] },
  { text: "Legend has it the ice cream sundae was invented to dodge laws banning ice cream sodas on Sundays.", keys: [] },
  { text: "Marshmallows were first made from the sap of the marsh mallow plant, as medicine.", keys: [] },
  { text: "Candy corn has been made roughly the same way since the 1880s.", keys: [] },
  { text: "Cotton candy was co-invented by a dentist in 1897 and sold as \"fairy floss.\"", keys: [] },
  { text: "Legend has it mayonnaise is named for Mahón, a port on Menorca, where it was first whipped up in the 1700s.", keys: ["mayo", "mayonnaise", "aioli"] },
  { text: "Ancient Greeks and Romans used mustard seed as both spice and medicine.", keys: ["mustard", "dijon"] },
  { text: "Soy sauce brewing goes back more than 2,000 years in China.", keys: ["soy sauce", "tamari"] },
  { text: "Sriracha is named for Si Racha, the Thai seaside town where the original sauce was made.", keys: ["sriracha"] },
  { text: "A \"jiffy\" is a real unit of time in physics, far shorter than a blink.", keys: [] },
  { text: "Rice is the staple food for more than half the people on Earth.", keys: ["rice"] },
  { text: "The hottest chili pepper on record measures over 2.6 million Scoville units.", keys: ["cayenne", "calabrian", "jalapeño", "chile", "chili"] },
  { text: "Legend has it lobster was so plentiful in colonial New England that it was considered poverty food, even fed to prisoners.", keys: ["lobster", "shrimp", "scallop"] },
  { text: "Oysters were so cheap in 1800s New York that they were everyday street food.", keys: ["oysters"] },
  { text: "Corn was so central to Aztec life that it had its own god, Centeotl.", keys: ["corn", "tortilla"] },
  { text: "Ancient Egyptians left some of the earliest evidence of organized beekeeping, over 4,500 years ago.", keys: ["honey"] },
  { text: "Ramen came to Japan from China, and instant ramen, invented in 1958, made it a national obsession.", keys: ["ramen"] },
  { text: "Chinese emperors kept official food tasters to guard against poison.", keys: [] },
  { text: "Before tomatoes took over, ketchup was made from mushrooms, walnuts or even oysters.", keys: ["ketchup", "mushroom"] },
  { text: "Legend has it the potato chip was invented in 1853 by a chef fed up with a customer who kept sending back his fries.", keys: ["potato chip"] },
  { text: "Root beer traces back to colonial brews of herbs, roots and bark.", keys: [] },
  { text: "Graham crackers are named for Sylvester Graham, a 19th-century preacher of bland eating.", keys: [] },
  { text: "Caesar salad is named for Caesar Cardini, a restaurateur in Tijuana, not the Roman emperor.", keys: [] },
  { text: "Bubble gum was invented by accident in 1928 by an accountant at a gum company.", keys: [] },
  { text: "Cranberries, blueberries and Concord grapes are among the few fruits native to North America.", keys: [] },
  { text: "Most \"wasabi\" outside Japan is dyed horseradish. Real wasabi is hard and costly to grow.", keys: ["horseradish"] },
  { text: "Kiwi fruit was sold as the \"Chinese gooseberry\" until New Zealand growers renamed it in 1959.", keys: [] },
  { text: "Baklava is claimed by several countries of the old Ottoman Empire, including Greece and Turkey.", keys: [] },
  { text: "Legend has it the doughnut hole was invented in the 1800s by a ship captain who hated the soggy middle.", keys: [] },
  { text: "Chili peppers come from the Americas and only reached Asia after European contact.", keys: ["chile", "chili", "jalapeño", "poblano", "red pepper flakes"] },
  { text: "Legend has it tofu was invented in China over 2,000 years ago when someone curdled soy milk by accident.", keys: [] },
  { text: "Legend has it the Cornish pasty's thick crimped edge was a handle for miners with dirty hands.", keys: ["puff pastry"] },
  { text: "Sweden celebrates a national Cinnamon Roll Day every October 4.", keys: [] },
  { text: "Cooks in China were using woks roughly 2,000 years ago.", keys: ["sesame oil", "shaoxing"] },
  { text: "Legend has it pizza Margherita was named for Queen Margherita in 1889, topped to match the Italian flag.", keys: ["basil"] },
  { text: "The oldest known written recipes are on Mesopotamian clay tablets nearly 4,000 years old. Several are stews.", keys: ["broth", "stew"] },
  { text: "The Popsicle was invented in 1905 by an 11-year-old who left a soda mix outside on a cold night.", keys: [] },
  { text: "Kopi luwak, among the priciest coffees in the world, is made from beans that passed through a civet.", keys: [] },
  { text: "Legend has it medieval monks handed out pretzels to children who said their prayers.", keys: [] },
  { text: "Ancient Romans ground spices in a mortarium, the ancestor of the mortar and pestle.", keys: ["garam masala", "curry powder", "cumin"] },
  { text: "Honeybees visit around two million flowers to make a single pound of honey.", keys: ["honey", "maple"] },
  { text: "Chewing gum's ancestors include chicle, a tree sap chewed by the ancient Maya.", keys: [] },
  { text: "\"Restaurant\" comes from the French for a restorative broth sold to Parisians in the 1760s.", keys: ["broth"] },
];

export const FOOD_FACTS = FACTS.map((f) => f.text);

// Small seeded RNG so the same week always draws the same facts and look.
export function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const haystack = (recipe) =>
  [recipe.title, ...(recipe.ingredients ?? []).map((i) => i.item ?? i.raw ?? "")].join(" ").toLowerCase();

// One fact per recipe, never repeated within the week. The most specific fact
// whose keys match the dish wins; otherwise the week's seed picks from what's left.
export function factsForWeek(recipes, seed) {
  const rand = seeded(seed);
  const used = new Set();
  const pick = (pool) => {
    const open = pool.filter((i) => !used.has(i));
    if (!open.length) return null;
    const i = open[Math.floor(rand() * open.length)];
    used.add(i);
    return i;
  };
  const all = FACTS.map((_, i) => i);
  const out = {};
  for (const recipe of recipes) {
    const text = haystack(recipe);
    // Longest matching key = most specific ("potato chip" beats "corn").
    const score = (i) => Math.max(0, ...FACTS[i].keys.filter((k) => text.includes(k)).map((k) => k.length));
    const matched = all.filter((i) => score(i) > 0 && !used.has(i));
    const best = Math.max(0, ...matched.map(score));
    const i = pick(matched.filter((m) => score(m) === best)) ?? pick(all);
    out[recipe.slug] = i == null ? null : FACTS[i].text;
  }
  return out;
}
