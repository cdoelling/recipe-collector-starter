import { NextResponse } from "next/server";
import { hasApiKey, saveRecipeMarkdown } from "@/lib/transcribe";
import { importRecipeFromUrl } from "@/lib/import-url";
import { startImageGeneration, blurbOf } from "@/lib/generate-image";
import { startFactCheck } from "@/lib/fact-check";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON." }, { status: 400 });
  }

  const url = String(body.url ?? "").trim();
  if (!url) return NextResponse.json({ error: "Paste a recipe link first." }, { status: 400 });
  if (!hasApiKey()) {
    return NextResponse.json(
      { error: "Importing from a link needs ANTHROPIC_API_KEY set in .env.local." },
      { status: 400 }
    );
  }

  let markdown;
  try {
    markdown = await importRecipeFromUrl(url);
  } catch (err) {
    return NextResponse.json({ status: "error", error: String(err.message ?? err) }, { status: 422 });
  }

  const saved = saveRecipeMarkdown(markdown);
  // The fact check runs after the card art so the two never write the file at once.
  startImageGeneration({ slug: saved.slug, title: saved.title, blurb: blurbOf(markdown) })
    .then(() => startFactCheck(saved.slug));

  return NextResponse.json({ status: "saved", slug: saved.slug, title: saved.title, imagePending: true });
}
