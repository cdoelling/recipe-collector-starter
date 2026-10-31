import { NextResponse } from "next/server";
import {
  hasApiKey, transcribeAttachments, saveRecipeMarkdown, saveAttachments, addPending,
  ACCEPTED, SIZE_LIMITS, isPdf,
} from "@/lib/transcribe";
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

  // `images` is the old field name; `files` is what the capture page sends now.
  const incoming = Array.isArray(body.files) ? body.files : Array.isArray(body.images) ? body.images : [];
  if (!incoming.length) return NextResponse.json({ error: "Nothing received." }, { status: 400 });
  if (incoming.length > 10) return NextResponse.json({ error: "Ten files max per recipe." }, { status: 400 });

  const parsed = [];
  for (const file of incoming) {
    const mediaType = file.mediaType ?? "image/jpeg";
    if (!ACCEPTED[mediaType]) {
      return NextResponse.json({ error: `Unsupported file type ${mediaType}.` }, { status: 400 });
    }
    const data = String(file.data ?? "").replace(/^data:[^,]+,/, "");
    if (!data) return NextResponse.json({ error: "A file came through empty." }, { status: 400 });

    const bytes = Buffer.byteLength(data, "base64");
    const limit = isPdf(mediaType) ? SIZE_LIMITS.pdf : SIZE_LIMITS.image;
    if (bytes > limit) {
      const mb = Math.round(limit / 1024 / 1024);
      return NextResponse.json(
        { error: isPdf(mediaType) ? `That PDF is over ${mb} MB.` : `A photo is over ${mb} MB even after resizing.` },
        { status: 400 }
      );
    }
    parsed.push({ mediaType, data });
  }

  const files = saveAttachments(parsed);

  if (!hasApiKey()) {
    const id = files[0].replace(/\.[^.]+$/, "");
    addPending({ id, files, createdAt: new Date().toISOString() });
    return NextResponse.json({
      status: "queued",
      files,
      message:
        "Saved to the inbox. No ANTHROPIC_API_KEY is set, so it's waiting for transcription.",
    });
  }

  try {
    const markdown = await transcribeAttachments(parsed);
    const saved = saveRecipeMarkdown(markdown, { sources: files });
    // The fact check runs after the card art so the two never write the file at once.
    startImageGeneration({ slug: saved.slug, title: saved.title, blurb: blurbOf(markdown) })
      .then(() => startFactCheck(saved.slug));
    return NextResponse.json({ status: "saved", slug: saved.slug, title: saved.title, files, imagePending: true });
  } catch (err) {
    const id = files[0].replace(/\.[^.]+$/, "");
    addPending({ id, files, createdAt: new Date().toISOString(), error: String(err.message ?? err) });
    return NextResponse.json(
      { status: "queued", files, error: String(err.message ?? err),
        message: "Transcription failed, so the files were queued instead." },
      { status: 502 }
    );
  }
}
