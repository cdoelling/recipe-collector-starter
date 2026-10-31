import { notFound } from "next/navigation";
import LoadingPreview from "@/components/LoadingPreview";

export const dynamic = "force-dynamic";

export default function LoadingPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <>
      <div style={{ paddingTop: 30 }}>
        <p className="eyebrow">Dev only</p>
        <h1 className="page">Loading animations</h1>
        <p className="lede">Every icon the upload screen can show, side by side.</p>
      </div>
      <LoadingPreview />
    </>
  );
}
