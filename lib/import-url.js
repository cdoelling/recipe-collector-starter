import dns from "node:dns/promises";
import net from "node:net";
import Anthropic from "@anthropic-ai/sdk";
import { HOUSE_TITLE, MOTIFS, SYSTEM, stripFence, normalizeFrontmatter } from "./transcribe.js";

const MODEL = "claude-sonnet-5-5";
const MAX_BYTES = 3 * 1024 * 1024;
const MAX_REDIRECTS = 5;
const CUISINES = [
  "Asian", "Japanese", "Chinese", "Thai", "Korean", "Vietnamese", "Italian", "Mexican",
  "Mediterranean", "French", "Indian", "Seafood", "American", "Other",
];
const WEATHERS = ["cozy", "cool", "any"];

// --- fetching ---------------------------------------------------------------

// The server fetches whatever URL it is handed, so refuse anything that points
// back at this machine or the local network.
function isPrivateAddress(ip) {
  if (net.isIPv6(ip)) {
    const v = ip.toLowerCase();
    return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80") ||
      (v.startsWith("::ffff:") && isPrivateAddress(v.slice(7)));
  }
  const [a, b] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
}

async function assertPublicUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("That doesn't look like a web address.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https links can be imported.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = net.isIP(host)
    ? [{ address: host }]
    : await dns.lookup(host, { all: true }).catch(() => {
        throw new Error(`Couldn't find ${url.hostname}.`);
      });
  if (addresses.some((a) => isPrivateAddress(a.address))) {
    throw new Error("That address points to a private network, so it can't be imported.");
  }
  return url;
}

async function fetchHtml(raw) {
  let url = await assertPublicUrl(raw);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let res;
    try {
      res = await fetch(url, {
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
        headers: {
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          accept: "text/html,application/xhtml+xml",
          "accept-language": "en-US,en;q=0.9",
        },
      });
    } catch (err) {
      throw new Error(`Couldn't load that page (${err.name === "TimeoutError" ? "timed out" : err.message}).`);
    }

    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      url = await assertPublicUrl(new URL(res.headers.get("location"), url).toString());
      continue;
    }
    if (!res.ok) throw new Error(`That site returned ${res.status}${res.status === 403 ? " (it blocks automated readers)" : ""}.`);

    const type = res.headers.get("content-type") ?? "";
    if (!/html|xml/i.test(type)) throw new Error("That link isn't a web page.");

    const chunks = [];
    let total = 0;
    for await (const chunk of res.body) {
      total += chunk.length;
      if (total > MAX_BYTES) throw new Error("That page is too large to import.");
      chunks.push(chunk);
    }
    return { html: Buffer.concat(chunks).toString("utf8"), url: url.toString() };
  }
  throw new Error("That link redirects too many times.");
}

// --- parsing ----------------------------------------------------------------

function decodeEntities(text) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", ndash: "–", mdash: "—", deg: "°", frac12: "½", frac14: "¼", frac34: "¾" };
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z0-9]+);/gi, (m, n) => named[n.toLowerCase()] ?? m);
}

const clean = (text) => decodeEntities(String(text ?? "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

function findRecipeNode(node) {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findRecipeNode(item);
      if (found) return found;
    }
    return null;
  }
  const type = node["@type"];
  if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))) return node;
  return findRecipeNode(node["@graph"]) ?? findRecipeNode(node.mainEntity) ?? null;
}

function jsonLdRecipe(html) {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = re.exec(html))) {
    try {
      const found = findRecipeNode(JSON.parse(match[1].trim()));
      if (found) return found;
    } catch {
      // A malformed block shouldn't hide a good one further down the page.
    }
  }
  return null;
}

function minutes(iso) {
  const m = String(iso ?? "").match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!m) return null;
  const total = (Number(m[1] ?? 0) * 24 + Number(m[2] ?? 0)) * 60 + Number(m[3] ?? 0);
  return total || null;
}

function flattenSteps(node) {
  if (!node) return [];
  if (typeof node === "string") {
    return node.split(/\n+/).map(clean).filter(Boolean);
  }
  if (Array.isArray(node)) return node.flatMap(flattenSteps);
  if (node.itemListElement) return flattenSteps(node.itemListElement);
  return flattenSteps(node.text ?? node.name);
}

function firstInt(value) {
  const text = Array.isArray(value) ? value[0] : value;
  const m = String(text ?? "").match(/\d+/);
  return m ? Number(m[0]) : null;
}

function authorName(author) {
  const a = Array.isArray(author) ? author[0] : author;
  return clean(typeof a === "string" ? a : a?.name);
}

function structuredFromJsonLd(node) {
  const ingredients = (Array.isArray(node.recipeIngredient) ? node.recipeIngredient : [node.recipeIngredient])
    .map(clean).filter(Boolean);
  const instructions = flattenSteps(node.recipeInstructions);
  if (!ingredients.length || !instructions.length || !node.name) return null;
  return {
    title: clean(node.name),
    description: clean(node.description),
    author: authorName(node.author),
    serves: firstInt(node.recipeYield),
    totalTime:
      minutes(node.totalTime) ?? ((minutes(node.prepTime) ?? 0) + (minutes(node.cookTime) ?? 0) || null),
    cuisineHint: clean(Array.isArray(node.recipeCuisine) ? node.recipeCuisine[0] : node.recipeCuisine),
    categoryHint: clean(Array.isArray(node.recipeCategory) ? node.recipeCategory[0] : node.recipeCategory),
    ingredients,
    instructions,
  };
}

function pageText(html) {
  const body = html
    .replace(/<(script|style|noscript|svg|nav|header|footer|aside|form)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6]|br|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(body).replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim().slice(0, 60000);
}

// --- markdown ---------------------------------------------------------------

// Quote a YAML scalar only when plain style would break it.
function yamlValue(value) {
  const v = String(value);
  return /: |:$|^[\s"'\[\]{}&*!|>%@`#-]|\s#|^\s*$/.test(v) ? JSON.stringify(v) : v;
}

function pick(value, allowed, fallback) {
  const hit = allowed.find((a) => a.toLowerCase() === String(value ?? "").toLowerCase());
  return hit ?? fallback;
}

// The steps and ingredients come straight from the page; the model is only
// asked for the judgement calls the library needs (house title, cuisine, weather, motif…).
async function classify(structured) {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: `You label recipes for a personal recipe library. Reply with ONLY a JSON object, no code fences:
{"title": a house title for the dish. ${HOUSE_TITLE},
 "cuisine": one of ${JSON.stringify(CUISINES)},
 "category": short dish type such as Pasta, Soup, Salad, Fish, Tacos, Roast, Steak, Chicken,
 "weather": "cozy" for braises, soups, stews, roasts, baked pasta and anything warming; "cool" for salads, cold noodles, grilled fish and light summer plates; "any" if it works year round,
 "motif": one of ${JSON.stringify(MOTIFS)},
 "tags": 3 to 5 lowercase keywords,
 "blurb": one sentence, max 20 words, describing the dish}`,
    messages: [
      {
        role: "user",
        content: `Title: ${structured.title}\nDescription: ${structured.description}\nSite says cuisine: ${structured.cuisineHint || "?"}, category: ${structured.categoryHint || "?"}\nIngredients:\n${structured.ingredients.slice(0, 40).join("\n")}`,
      },
    ],
  });
  const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  try {
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? "{}");
  } catch {
    return {};
  }
}

async function markdownFromStructured(structured, sourceUrl) {
  const label = await classify(structured).catch(() => ({}));
  const tags = (Array.isArray(label.tags) ? label.tags : [])
    .map((t) => String(t).toLowerCase().replace(/[,\[\]]/g, "").trim())
    .filter(Boolean)
    .slice(0, 5);
  const blurb = clean(label.blurb) || structured.description.slice(0, 140);

  const lines = [
    "---",
    `title: ${yamlValue(clean(label.title) || structured.title)}`,
    `cuisine: ${pick(label.cuisine, CUISINES, pick(structured.cuisineHint, CUISINES, "Other"))}`,
    label.category ? `category: ${yamlValue(clean(label.category))}` : null,
    structured.totalTime ? `totalTime: ${structured.totalTime}` : null,
    structured.serves ? `serves: ${structured.serves}` : null,
    `weather: ${pick(label.weather, WEATHERS, "any")}`,
    `motif: ${pick(label.motif, MOTIFS, "plate")}`,
    `source: ${yamlValue(sourceUrl)}`,
    structured.author ? `author: ${yamlValue(structured.author)}` : null,
    blurb ? `blurb: ${yamlValue(blurb)}` : null,
    tags.length ? `tags: [${tags.join(", ")}]` : null,
    "---",
    "",
    "## Ingredients",
    "",
    ...structured.ingredients.map((i) => `- ${i}`),
    "",
    "## Instructions",
    "",
    ...structured.instructions.map((step, i) => `${i + 1}. ${step.replace(/^\d+[.)]\s*/, "")}`),
  ];
  return lines.filter((l) => l !== null).join("\n");
}

// No structured data on the page: have the model transcribe the page text the
// same way it transcribes a photo.
async function markdownFromText(text, sourceUrl) {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `This is the text of a web page (${sourceUrl}). Transcribe the recipe on it. If the page does not contain a recipe, reply with exactly: NO_RECIPE\n\n${text}`,
      },
    ],
  });
  if (response.stop_reason === "refusal") throw new Error("The model declined to read that page.");
  const out = response.content.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  if (out.includes("NO_RECIPE")) throw new Error("Couldn't find a recipe on that page.");

  let md = normalizeFrontmatter(stripFence(out));
  const frontmatter = md.split(/^## /m)[0];
  if (!/^title:/m.test(frontmatter) || !/^## Ingredients/m.test(md) || !/^## Instructions/m.test(md)) {
    throw new Error("Couldn't find a recipe on that page.");
  }
  if (!/^source:/m.test(frontmatter)) {
    md = md.replace(/^(title: .*\n)/m, `$1source: ${yamlValue(sourceUrl)}\n`);
  }
  return md;
}

export async function importRecipeFromUrl(rawUrl) {
  const { html, url } = await fetchHtml(String(rawUrl ?? "").trim());
  const structured = (() => {
    const node = jsonLdRecipe(html);
    return node ? structuredFromJsonLd(node) : null;
  })();
  if (structured) return markdownFromStructured(structured, url);

  const text = pageText(html);
  if (text.length < 200) {
    throw new Error("That page has no readable text. It may load its content with JavaScript or sit behind a login.");
  }
  return markdownFromText(text, url);
}

// The page as the fact check sees it: the site's own structured recipe when it
// has one, otherwise the readable text.
export async function fetchSourceText(rawUrl) {
  const { html } = await fetchHtml(String(rawUrl ?? "").trim());
  const node = jsonLdRecipe(html);
  const structured = node ? structuredFromJsonLd(node) : null;
  if (structured) {
    return [
      structured.title,
      structured.serves ? `Serves: ${structured.serves}` : null,
      structured.totalTime ? `Total time: ${structured.totalTime} min` : null,
      "Ingredients:", ...structured.ingredients.map((i) => `- ${i}`),
      "Instructions:", ...structured.instructions.map((step, i) => `${i + 1}. ${step}`),
      "", "Page text:", pageText(html).slice(0, 30000),
    ].filter((l) => l !== null).join("\n");
  }
  return pageText(html);
}
