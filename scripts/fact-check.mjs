#!/usr/bin/env node
// Re-runs the fact check on recipes already in the library: compares each one
// against its source photo, PDF or page, fixes clear-cut errors in place and
// writes data/checks/<slug>.json. Needs ANTHROPIC_API_KEY.
//   npm run check <slug> [<slug>…]
//   npm run check -- --all
import fs from "node:fs";
import { hasApiKey } from "../lib/transcribe.js";
import { factCheckRecipe } from "../lib/fact-check.js";
import { RECIPES_DIR } from "../lib/paths.js";

if (!hasApiKey()) {
  console.error("ANTHROPIC_API_KEY is not set. Put it in .env.local or export it, then rerun.");
  process.exit(1);
}

const args = process.argv.slice(2);
const slugs = args.includes("--all")
  ? fs.readdirSync(RECIPES_DIR).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")).sort()
  : args.map((a) => a.replace(/^data\/recipes\//, "").replace(/\.md$/, ""));

if (!slugs.length) {
  console.error("Name a recipe (npm run check <slug>) or check them all (npm run check -- --all).");
  process.exit(1);
}

let failures = 0;
for (const slug of slugs) {
  if (!fs.existsSync(`${RECIPES_DIR}/${slug}.md`)) {
    failures++;
    console.error(`✗ ${slug}: no such recipe`);
    continue;
  }
  try {
    const check = await factCheckRecipe(slug);
    const against = { photo: "the photo", photos: "the photos", url: "the page", none: "no source" }[check.source.kind];
    console.log(`✓ ${slug} (${against}): ${check.fixes.length} fixed, ${check.notes.length} to look at`);
    for (const fix of check.fixes) console.log(`    fixed: ${fix.why}`);
    for (const note of check.notes) console.log(`    look:  ${note.issue}`);
  } catch (err) {
    failures++;
    console.error(`✗ ${slug}: ${err.message ?? err}`);
  }
}

process.exit(failures ? 1 : 0);
