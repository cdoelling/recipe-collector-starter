import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execFile } from "node:child_process";
import { RECIPES_DIR, INBOX_DIR } from "./paths.js";

const ART_DIR = path.join(process.cwd(), "public", "recipe-art");
const TIMEOUT_MS = 10 * 60 * 1000;
const inFlight = new Set();

const codexBin = () =>
  process.env.CODEX_BIN || (fs.existsSync("/opt/homebrew/bin/codex") ? "/opt/homebrew/bin/codex" : "codex");

function logFailure(slug, message) {
  console.error(`Image generation failed for "${slug}": ${message}`);
  try {
    fs.mkdirSync(INBOX_DIR, { recursive: true });
    fs.appendFileSync(
      path.join(INBOX_DIR, "image-errors.log"),
      `${new Date().toISOString()} ${slug}: ${message}\n`
    );
  } catch {
    // Logging must never be the thing that fails.
  }
}

function runCodex(prompt, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      codexBin(),
      ["exec", "--skip-git-repo-check", "-s", "workspace-write", prompt],
      { cwd, stdio: ["ignore", "pipe", "pipe"], env: process.env }
    );
    let tail = "";
    const keep = (d) => { tail = (tail + d).slice(-2000); };
    child.stdout.on("data", keep);
    child.stderr.on("data", keep);
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Codex took longer than 10 minutes."));
    }, TIMEOUT_MS);
    child.on("error", (err) => { clearTimeout(timer); reject(err); });
    child.on("close", (code) => {
      clearTimeout(timer);
      code === 0 ? resolve(tail) : reject(new Error(`Codex exited with ${code}: ${tail.slice(-400)}`));
    });
  });
}

const toJpeg = (png, jpg) =>
  new Promise((resolve, reject) =>
    execFile(
      "sips",
      ["-s", "format", "jpeg", "-s", "formatOptions", "85", "--resampleWidth", "1200", png, "--out", jpg],
      (err) => (err ? reject(err) : resolve())
    )
  );

function addImageLine(slug) {
  const file = path.join(RECIPES_DIR, `${slug}.md`);
  let md = fs.readFileSync(file, "utf8");
  if (/^image:/m.test(md.split(/^## /m)[0])) return;
  md = md.replace(/^(title: .*\n)/m, `$1image: /recipe-art/${slug}.jpg\n`);
  fs.writeFileSync(file, md);
}

async function generate({ slug, title, blurb }) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rc-img-"));
  const png = path.join(tmp, `${slug}.png`);
  // Same recipe prompt as the library's ink-and-wash set.
  const prompt =
    `Do not ask questions or wait for confirmation; generate immediately. ` +
    `Use your image generation capability to create one image and save it as ${png}. ` +
    `Prompt: Pen-and-ink sketch with loose watercolor washes, visible linework, sketchbook feel, ` +
    `off-white paper, relaxed and imperfect, of the finished dish '${title}'${blurb ? ` (${blurb})` : ""}. ` +
    `3:2 landscape, the dish in the upper two-thirds of the frame with empty space along the bottom ` +
    `for overlaid text. No text, no watermark, no hands. Reply with the saved file path only.`;

  try {
    await runCodex(prompt, tmp);
    if (!fs.existsSync(png) || fs.statSync(png).size < 10000) {
      throw new Error("Codex finished but no image was saved.");
    }
    fs.mkdirSync(ART_DIR, { recursive: true });
    await toJpeg(png, path.join(ART_DIR, `${slug}.jpg`));
    addImageLine(slug);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

export const blurbOf = (markdown) =>
  markdown.match(/^blurb:\s*(.+?)\s*$/m)?.[1]?.replace(/^["']|["']$/g, "") ?? "";

// Fire and forget: the recipe is already saved with its generated illustration,
// and the picture swaps in on the next load once Codex is done. The returned
// promise never rejects, so scripts can await it before exiting.
export function startImageGeneration({ slug, title, blurb }) {
  if (inFlight.has(slug)) return Promise.resolve();
  inFlight.add(slug);
  return generate({ slug, title, blurb })
    .catch((err) => logFailure(slug, err.message ?? String(err)))
    .finally(() => inFlight.delete(slug));
}
