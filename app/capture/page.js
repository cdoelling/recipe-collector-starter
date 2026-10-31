import { hasApiKey, readPending, filesOf } from "@/lib/transcribe";
import Capture from "@/components/Capture";

export const dynamic = "force-dynamic";

export default function CapturePage() {
  return (
    <>
      <div style={{ paddingTop: 30 }}>
        <p className="eyebrow">Photos, PDF or link → recipe</p>
        <h1 className="page">Add a recipe</h1>
      </div>
      <Capture
        autoTranscribe={hasApiKey()}
        pending={readPending().map((entry) => ({ ...entry, files: filesOf(entry) }))}
      />
    </>
  );
}
