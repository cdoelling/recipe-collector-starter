#!/usr/bin/env node
// Drains data/inbox/pending.json: turns each queued set of photos or PDFs into a recipe
// markdown file. Needs ANTHROPIC_API_KEY. Run with: npm run transcribe
import fs from "node:fs";
import path from "node:path";
import {
  hasApiKey, transcribeAttachments, saveRecipeMarkdown, readPending, removePending,
  filesOf, mediaTypeForFile,
} from "../lib/transcribe.js";
import { INBOX_DIR } from "../lib/paths.js";
import { startImageGeneration, blurbOf } from "../lib/generate-image.js";
import { startFactCheck } from "../lib/fact-check.js";

if (!hasApiKey()) {
  console.error("ANTHROPIC_API_KEY is not set. Put it in .env.local or export it, then rerun.");
  process.exit(1);
}

const pending = readPending();
if (!pending.length) {
  console.log("Nothing pending.");
  process.exit(0);
}

console.log(`Transcribing ${pending.length} queued recipe${pending.length === 1 ? "" : "s"}…\n`);

let failures = 0;
for (const entry of pending) {
  const names = filesOf(entry);
  const attachments = names
    .filter((name) => fs.existsSync(path.join(INBOX_DIR, name)))
    .map((name) => ({
      mediaType: mediaTypeForFile(name) ?? "image/jpeg",
      data: fs.readFileSync(path.join(INBOX_DIR, name)).toString("base64"),
    }));

  if (!attachments.length) {
    console.log(`· ${entry.id}: files are gone, dropping from the queue`);
    removePending(entry.id);
    continue;
  }

  try {
    const markdown = await transcribeAttachments(attachments);
    const saved = saveRecipeMarkdown(markdown, { sources: names });
    removePending(entry.id);
    console.log(`✓ ${saved.title} → data/recipes/${saved.slug}.md`);
    // Awaited, unlike the web route: the process exits when the queue drains.
    console.log(`  drawing the card picture with Codex (can take a few minutes)…`);
    await startImageGeneration({ slug: saved.slug, title: saved.title, blurb: blurbOf(markdown) });
    console.log(`  fact-checking against the source…`);
    const check = await startFactCheck(saved.slug);
    console.log(check ? `  ${check.fixes.length} fixed, ${check.notes.length} to look at` : `  fact check failed (see data/inbox/fact-check-errors.log)`);
  } catch (err) {
    failures++;
    console.error(`✗ ${entry.id}: ${err.message ?? err}`);
  }
}

process.exit(failures ? 1 : 0);
