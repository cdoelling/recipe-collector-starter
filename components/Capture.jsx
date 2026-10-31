"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingScreen from "./LoadingScreen";

const MAX_EDGE = 1600;   // plenty for reading a recipe page, small enough to upload fast
const QUALITY = 0.85;
const MAX_FILES = 10;
const PDF_LIMIT_MB = 15;

// Chrome (desktop and Android) has no HEIC decoder at all, so a HEIC file
// picked from the Photos library — as opposed to a fresh camera capture,
// which iOS already hands back as a JPEG — fails createImageBitmap there
// unless it's decoded in JS first. heic-to wraps a current libheif build;
// older decoders (heic2any) choke with ERR_LIBHEIF on modern iPhone HEIC.
async function heicBitmap(file) {
  const { heicTo } = await import("heic-to/next");
  return heicTo({ blob: file, type: "bitmap" });
}

// iPhones hand back HEIC and 12 MP JPEGs. Re-encoding through a canvas fixes
// both the format and the size before anything leaves the device.
async function downscale(file, fileIsHeic) {
  const bitmap = fileIsHeic ? await heicBitmap(file) : await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const dataUrl = canvas.toDataURL("image/jpeg", QUALITY);
  return { kind: "image", mediaType: "image/jpeg", data: dataUrl.split(",")[1], preview: dataUrl };
}

// A PDF goes to the API untouched — chunked so a big file doesn't blow the stack.
async function readPdf(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return {
    kind: "pdf",
    mediaType: "application/pdf",
    data: btoa(binary),
    name: file.name,
    size: file.size,
  };
}

const ICON_PROPS = {
  width: 30, height: 30, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true,
};

const OPTIONS = [
  {
    id: "photos",
    label: "Photos",
    hint: "Snap or pick a recipe page",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M4 8h3l1.6-2.4h6.8L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
        <circle cx="12" cy="13.2" r="3.6" />
      </svg>
    ),
  },
  {
    id: "pdf",
    label: "PDF",
    hint: "Upload a saved recipe",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6M9 16.5h6" />
      </svg>
    ),
  },
  {
    id: "url",
    label: "Link",
    hint: "Import from a website",
    icon: (
      <svg {...ICON_PROPS}>
        <path d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1 1" />
        <path d="M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1-1" />
      </svg>
    ),
  },
];

function prettySize(bytes) {
  return bytes > 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function Capture({ autoTranscribe, pending }) {
  const router = useRouter();
  const cameraRef = useRef(null);
  const photosRef = useRef(null);
  const pdfRef = useRef(null);
  const [mode, setMode] = useState(null); // null | "photos" | "pdf" | "url"
  const [url, setUrl] = useState("");
  const [files, setFiles] = useState([]);
  const [state, setState] = useState({ phase: "idle" });
  const [dragging, setDragging] = useState(false);
  // Default is bulk: every file becomes its own recipe, so a stack of recipe
  // cards can go in as one batch. Flip this on for a recipe that spans
  // several photos (e.g. two cookbook pages) and needs them merged into one.
  const [mergeAsOne, setMergeAsOne] = useState(false);

  const accept = async (list) => {
    const picked = [...list];
    if (!picked.length) return;
    setState({ phase: "preparing" });
    try {
      const prepared = [];
      for (const file of picked) {
        const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
        if (isPdf) {
          if (file.size > PDF_LIMIT_MB * 1024 * 1024) {
            throw new Error(`${file.name} is ${prettySize(file.size)} — the limit is ${PDF_LIMIT_MB} MB.`);
          }
          prepared.push(await readPdf(file));
        } else {
          const { isHeic } = await import("heic-to/next");
          prepared.push(await downscale(file, await isHeic(file)));
        }
      }
      setFiles((prev) => [...prev, ...prepared].slice(0, MAX_FILES));
      setState({ phase: "idle" });
    } catch (err) {
      setState({ phase: "error", message: `Couldn't read that file: ${err.message ?? err}` });
    }
  };

  const onInput = async (event) => {
    await accept(event.target.files ?? []);
    event.target.value = "";
  };

  const onDrop = async (event) => {
    event.preventDefault();
    setDragging(false);
    await accept(event.dataTransfer?.files ?? []);
  };

  const uploadGroup = async (group) => {
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ files: group }),
      });
      return await res.json();
    } catch (err) {
      return { status: "error", error: String(err.message ?? err) };
    }
  };

  const importUrl = async (event) => {
    event.preventDefault();
    if (!url.trim() || state.phase === "importing") return;
    setState({ phase: "importing" });
    try {
      const res = await fetch("/api/import-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json();
      if (json.status === "saved") {
        setUrl("");
        router.refresh();
        setState({ phase: "saved", slug: json.slug, title: json.title, imagePending: json.imagePending });
      } else {
        setState({ phase: "error", message: json.error ?? "Import failed." });
      }
    } catch (err) {
      setState({ phase: "error", message: `Import failed: ${err.message ?? err}` });
    }
  };

  const submit = async () => {
    const batch = files.map(({ mediaType, data }) => ({ mediaType, data }));
    // One recipe per file by default; merged only when the toggle says these
    // photos are pages of a single recipe.
    const groups = mergeAsOne || batch.length <= 1 ? [batch] : batch.map((f) => [f]);

    setState({ phase: "uploading", done: 0, total: groups.length });
    const results = [];
    for (const group of groups) {
      results.push(await uploadGroup(group));
      setState({ phase: "uploading", done: results.length, total: groups.length });
    }

    setFiles([]);
    setMergeAsOne(false);
    router.refresh();

    if (groups.length === 1) {
      const json = results[0];
      if (json.status === "saved") setState({ phase: "saved", slug: json.slug, title: json.title });
      else if (json.status === "queued") setState({ phase: "queued", message: json.message ?? json.error });
      else setState({ phase: "error", message: json.error ?? "Upload failed." });
    } else {
      setState({ phase: "batch", results });
    }
  };

  const full = files.length >= MAX_FILES;

  return (
    <>
      <LoadingScreen active={state.phase === "uploading"} done={state.done} total={state.total} />

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={onInput} />
      <input ref={photosRef} type="file" accept="image/*" multiple hidden onChange={onInput} />
      <input ref={pdfRef} type="file" accept="application/pdf,.pdf" multiple hidden onChange={onInput} />

      <div className="capture-options" role="tablist" aria-label="How do you want to add a recipe?">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={mode === o.id}
            className="capture-option"
            data-active={mode === o.id}
            onClick={() => setMode(o.id)}
          >
            <span className="capture-option-icon">{o.icon}</span>
            <strong>{o.label}</strong>
            <span className="capture-option-hint">{o.hint}</span>
          </button>
        ))}
      </div>

      {mode === "photos" ? (
        <>
          <div
            className="dropzone"
            data-dragging={dragging}
            onClick={() => cameraRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <span className="big">📸</span>
            <p><strong>Tap to photograph a recipe</strong></p>
            <p style={{ fontSize: 14 }}>
              Up to {MAX_FILES} at a time — each becomes its own recipe. Or drop files here.
            </p>
          </div>
          <div className="btn-row">
            <button className="btn" data-variant="ghost" onClick={() => photosRef.current?.click()} disabled={full}>
              🖼 Choose photos
            </button>
          </div>
        </>
      ) : null}

      {mode === "pdf" ? (
        <>
          <div
            className="dropzone"
            data-dragging={dragging}
            onClick={() => pdfRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <span className="big">📄</span>
            <p><strong>Choose a PDF recipe</strong></p>
            <p style={{ fontSize: 14 }}>Up to {PDF_LIMIT_MB} MB each. Or drop a PDF here.</p>
          </div>
          <div className="btn-row">
            <button className="btn" data-variant="ghost" onClick={() => pdfRef.current?.click()} disabled={full}>
              📄 Choose PDFs
            </button>
          </div>
        </>
      ) : null}

      {mode === "url" ? (
        autoTranscribe ? (
          <form className="url-import" onSubmit={importUrl}>
            <label className="eyebrow" htmlFor="recipe-url">Recipe link</label>
            <input
              id="recipe-url"
              className="field"
              type="url"
              inputMode="url"
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={state.phase === "importing"}
              autoFocus
            />
            <p className="url-import-note">
              Pulls the title, ingredients and steps from the page, saves the recipe, then draws a new ink-and-wash
              picture for it in the background.
            </p>
            <div className="btn-row" style={{ marginTop: 14 }}>
              <button className="btn" type="submit" disabled={!url.trim() || state.phase === "importing"}>
                {state.phase === "importing" ? "Reading the page…" : "Import recipe"}
              </button>
            </div>
          </form>
        ) : (
          <div className="notice" data-tone="warn">
            Importing from a link needs <code style={{ display: "inline", padding: "2px 6px" }}>ANTHROPIC_API_KEY</code>{" "}
            in <code style={{ display: "inline", padding: "2px 6px" }}>.env.local</code>.
          </div>
        )
      ) : null}

      {files.length ? (
        <>
          <div className="thumbs">
            {files.map((f, i) =>
              f.kind === "pdf" ? (
                <span className="thumb-doc" key={i} title={f.name}>
                  <b>PDF</b>
                  <em>{f.name}</em>
                  <i>{prettySize(f.size)}</i>
                </span>
              ) : (
                <img key={i} src={f.preview} alt={`Page ${i + 1}`} />
              )
            )}
          </div>

          {files.length > 1 ? (
            <div className="btn-row" style={{ marginTop: 12 }}>
              <button className="tag" data-active={!mergeAsOne} onClick={() => setMergeAsOne(false)}>
                {files.length} separate recipes
              </button>
              <button className="tag" data-active={mergeAsOne} onClick={() => setMergeAsOne(true)}>
                Pages of one recipe
              </button>
            </div>
          ) : null}

          <div className="btn-row">
            <button className="btn" onClick={submit} disabled={state.phase === "uploading"}>
              {state.phase === "uploading"
                ? state.total > 1
                  ? `${autoTranscribe ? "Reading" : "Saving"} ${state.done}/${state.total}…`
                  : autoTranscribe ? "Reading the recipe…" : "Saving…"
                : mergeAsOne || files.length === 1
                  ? `${autoTranscribe ? "Transcribe" : "Save"} ${files.length} file${files.length === 1 ? "" : "s"}`
                  : `${autoTranscribe ? "Transcribe" : "Save"} as ${files.length} recipes`}
            </button>
            <button className="btn" data-variant="ghost" onClick={() => { setFiles([]); setMergeAsOne(false); }}>
              Clear
            </button>
          </div>
        </>
      ) : null}

      {state.phase === "preparing" ? <div className="notice">Reading…</div> : null}
      {state.phase === "importing" ? <div className="notice">Reading the page and pulling out the recipe…</div> : null}

      {state.phase === "saved" ? (
        <div className="notice" data-tone="ok">
          <strong>{state.title}</strong> is in the library.{" "}
          <Link href={`/recipe/${state.slug}`} style={{ textDecoration: "underline" }}>Open it →</Link>
          {state.imagePending ? (
            <div style={{ marginTop: 6 }}>
              A new illustration is being drawn. It usually takes a minute or two, then shows up on the recipe.
            </div>
          ) : null}
        </div>
      ) : null}

      {state.phase === "queued" ? (
        <div className="notice" data-tone="warn">
          {state.message}
          <code>{`Ask Claude Code, in ~/Desktop/recipe-collector:\n"transcribe the pending recipes"`}</code>
        </div>
      ) : null}

      {state.phase === "error" ? (
        <div className="notice" data-tone="bad">{state.message}</div>
      ) : null}

      {state.phase === "batch" ? (
        <div
          className="notice"
          data-tone={state.results.every((r) => r.status === "saved") ? "ok" : "warn"}
        >
          <strong>
            {state.results.filter((r) => r.status === "saved").length} of {state.results.length}{" "}
            recipes saved.
          </strong>
          <ul style={{ margin: "10px 0 0", paddingLeft: 18 }}>
            {state.results.map((r, i) => (
              <li key={i}>
                {r.status === "saved" ? (
                  <Link href={`/recipe/${r.slug}`} style={{ textDecoration: "underline" }}>
                    {r.title}
                  </Link>
                ) : r.status === "queued" ? (
                  `Queued — ${r.message ?? r.error}`
                ) : (
                  `Failed — ${r.error ?? "Upload failed."}`
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!autoTranscribe ? (
        <div className="notice" style={{ marginTop: 26 }}>
          <strong>Automatic transcription is off.</strong> No <code style={{ display: "inline", padding: "2px 6px" }}>ANTHROPIC_API_KEY</code>{" "}
          is set, so uploads are saved to the inbox and wait for you to transcribe them in Claude Code.
          Set the key in <code style={{ display: "inline", padding: "2px 6px" }}>.env.local</code> to have the app do it on upload.
        </div>
      ) : null}

      {pending.length ? (
        <>
          <div className="section-head"><h2>Waiting to be transcribed</h2></div>
          {pending.map((entry) => (
            <div key={entry.id} className="notice" data-tone="warn">
              <strong>{entry.files.length} file{entry.files.length === 1 ? "" : "s"}</strong> ·{" "}
              {new Date(entry.createdAt).toLocaleString()}
              {entry.error ? <div style={{ marginTop: 6 }}>Last error: {entry.error}</div> : null}
              <div className="thumbs">
                {entry.files.map((name) =>
                  name.toLowerCase().endsWith(".pdf") ? (
                    <a key={name} className="thumb-doc" href={`/api/photo/${name}`} target="_blank" rel="noreferrer">
                      <b>PDF</b>
                      <em>{name}</em>
                    </a>
                  ) : (
                    <a key={name} href={`/api/photo/${name}`} target="_blank" rel="noreferrer">
                      <img src={`/api/photo/${name}`} alt={name} />
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </>
      ) : null}
    </>
  );
}
