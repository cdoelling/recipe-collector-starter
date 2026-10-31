import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { RECIPES_DIR, INBOX_DIR } from "./paths.js";
import { slugify } from "./recipes.js";

export const MOTIFS = ["bowl", "fish", "pot", "pasta", "taco", "salad", "pizza", "flame", "plate"];

export function hasApiKey() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// What the Claude API accepts, and what each type saves as in the inbox.
export const ACCEPTED = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
};

// The API caps an image at 5 MB; PDFs get more room but the whole request has
// to stay under 32 MB once base64 has inflated it by a third.
export const SIZE_LIMITS = { image: 5 * 1024 * 1024, pdf: 15 * 1024 * 1024 };

export const isPdf = (mediaType) => mediaType === "application/pdf";

export function extensionFor(mediaType) {
  return ACCEPTED[mediaType] ?? ".bin";
}

export function mediaTypeForFile(name) {
  const ext = path.extname(name).toLowerCase();
  const found = Object.entries(ACCEPTED).find(([, e]) => e === ext);
  if (found) return found[0];
  return ext === ".jpeg" ? "image/jpeg" : null;
}

// The house title (docs/VOICE.md). Shared with link imports in lib/import-url.js.
export const HOUSE_TITLE = `Titles are in the house voice too, never the source's own name. About 6
words at most, title case. The dish must stay recognizable: a classic keeps its name and gets
a nudge ("Cacio e Pepe e Patience", "Lasagne Bolognese, Layer by Layer"). Otherwise a pun, a
little scene or a verdict ("Rigatoni Takes a Leek", "Jerk Chicken Tacos on Island Time",
"Smash Burgers, No Apologies"). A variation names what's different ("Passed-Out Cacio e Pepe"
for a drunken one). No wordplay on accents, languages or how anyone talks.`;

export const SYSTEM = `You transcribe recipes into a single markdown file. The source may be
photographs of a page, a screenshot, or a PDF.

Output ONLY the markdown file. No preamble, no code fences, no commentary.

The file must have exactly this shape:

---
title: <a house title for the dish, see below>
cuisine: <one of: Asian, Japanese, Chinese, Thai, Korean, Vietnamese, Italian, Mexican, Mediterranean, French, Indian, Seafood, American, Other>
category: <a short dish type, e.g. Pasta, Soup, Salad, Fish, Tacos, Roast>
totalTime: <total minutes from start to eating, as a plain integer>
serves: <integer, or omit the line if the source does not say>
weather: <cozy | cool | any>
motif: <one of: bowl, fish, pot, pasta, taco, salad, pizza, flame, plate>
source: <URL or publication if visible, otherwise omit the line>
blurb: <one or two short sentences, under 30 words: what the dish is, then a wink>
tags: [<3-5 lowercase keywords>]
---

## Before we start

<2-4 sentences in the house voice: the one thing that makes this dish work, or the mistake to avoid>

## Ingredients

- <one ingredient per line, quantity first, e.g. "2 tablespoons soy sauce">

## Instructions

1. <one step per line, numbered, in order>

## Kitchen's closed

<one line in the house voice: a storage tip, cleanup truth, leftovers plan or serving move>

The house voice: half confident nonna, half tired friend who's very good at this. Short
sentences, second person, contractions. Plain instruction first; a quip after it on about a
third of the steps, never all. Confessions ("I have served the clumpy version and called it
rustic"), reassurance at scary steps ("It will hiss at you. That's normal."). **Bold** at most
one warning per recipe, the one that ruins the dish if ignored. Jokes only at the cook's
expense. No jokes about food safety.

${HOUSE_TITLE}

Rules:
- Be faithful to the facts. Never invent ingredients or steps that are not in the source.
- If several files are given, they are pages of ONE recipe. Merge them in order.
- If a PDF holds more than one recipe, transcribe only the first one.
- Rewrite the steps in the house voice, in your own words. Keep every step, in order, with
  every time, temperature and amount exactly as the source gives it.
- Ingredients are transcribed exactly; the voice never touches them.
- Ingredient sub-headings (e.g. "For the sauce") become a bold line: **For the sauce**
- weather means when this dish is nice to eat: "cozy" for braises, soups, stews, roasts,
  baked pasta and anything warming; "cool" for salads, cold noodles, ceviche, grilled fish
  and light summer plates; "any" if it genuinely works year round.
- totalTime must be a single integer. If the source gives prep and cook separately, add them.
- If something is genuinely unreadable, write [unclear] rather than guessing.`;

export async function transcribeAttachments(files, { model = "claude-sonnet-5-5" } = {}) {
  const client = new Anthropic();
  const response = await client.messages.create({
    model,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          ...files.map((file) =>
            isPdf(file.mediaType)
              ? {
                  type: "document",
                  source: { type: "base64", media_type: "application/pdf", data: file.data },
                }
              : {
                  type: "image",
                  source: { type: "base64", media_type: file.mediaType, data: file.data },
                }
          ),
          {
            type: "text",
            text:
              files.length > 1
                ? `These ${files.length} files are one recipe, in order. Transcribe it.`
                : isPdf(files[0]?.mediaType)
                  ? "Transcribe the recipe in this PDF."
                  : "Transcribe this recipe.",
          },
        ],
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The model declined to transcribe this recipe.");
  }

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  return normalizeFrontmatter(stripFence(text));
}

export function stripFence(text) {
  const fenced = text.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```\s*$/);
  return (fenced ? fenced[1] : text).trim();
}

// The model is told to close the frontmatter with a second `---`, but
// occasionally drops it — the ingredient list then reads as more YAML and
// gray-matter throws when the whole file is later opened. Rebuild the
// boundary from the first heading instead of trusting the model's own
// delimiters, so a dropped or stray `---` can't corrupt the saved file.
export function normalizeFrontmatter(text) {
  const lines = text.split("\n");
  if (lines[0]?.trim() !== "---") return text;

  const headingIndex = lines.findIndex((line, i) => i > 0 && /^##\s/.test(line));
  if (headingIndex === -1) return text;

  const frontmatter = lines.slice(1, headingIndex).filter((line) => line.trim() !== "---");
  while (frontmatter.length && frontmatter[frontmatter.length - 1].trim() === "") {
    frontmatter.pop();
  }

  const body = lines.slice(headingIndex).join("\n");
  return `---\n${frontmatter.join("\n")}\n---\n\n${body}`;
}

// Pull the title out of frontmatter without a full YAML parse, so we can name the file.
export function titleFromMarkdown(md) {
  const match = md.match(/^---\s*[\s\S]*?^title:\s*(.+?)\s*$/m);
  return match ? match[1].replace(/^["']|["']$/g, "") : null;
}

export function saveRecipeMarkdown(md, { sources = [] } = {}) {
  const title = titleFromMarkdown(md) ?? "Untitled Recipe";
  let slug = slugify(title);
  let file = path.join(RECIPES_DIR, `${slug}.md`);
  let n = 2;
  while (fs.existsSync(file)) {
    slug = `${slugify(title)}-${n++}`;
    file = path.join(RECIPES_DIR, `${slug}.md`);
  }

  // Record which inbox files this came from, so the original is one tap away.
  let out = md;
  if (sources.length) {
    out = md.replace(/^---\n/, `---\nsources: [${sources.map((p) => JSON.stringify(p)).join(", ")}]\n`);
  }

  fs.mkdirSync(RECIPES_DIR, { recursive: true });
  fs.writeFileSync(file, out.endsWith("\n") ? out : `${out}\n`);
  return { slug, file, title };
}

// --- pending queue (used when no API key is configured) ---------------------

const PENDING_FILE = path.join(INBOX_DIR, "pending.json");

export function readPending() {
  try {
    const json = JSON.parse(fs.readFileSync(PENDING_FILE, "utf8"));
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

export function writePending(entries) {
  fs.mkdirSync(INBOX_DIR, { recursive: true });
  fs.writeFileSync(PENDING_FILE, JSON.stringify(entries, null, 2));
  return entries;
}

export function addPending(entry) {
  return writePending([...readPending(), entry]);
}

// Entries written before PDF support used `photos` for the same thing.
export function filesOf(entry) {
  return entry.files ?? entry.photos ?? [];
}

export function removePending(id) {
  return writePending(readPending().filter((e) => e.id !== id));
}

export function saveAttachments(files) {
  fs.mkdirSync(INBOX_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return files.map((file, i) => {
    const name = `${stamp}-${i + 1}${extensionFor(file.mediaType)}`;
    fs.writeFileSync(path.join(INBOX_DIR, name), Buffer.from(file.data, "base64"));
    return name;
  });
}
