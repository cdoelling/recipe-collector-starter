import { NextResponse } from "next/server";
import { authorizeUrl } from "@/lib/kroger";

export const dynamic = "force-dynamic";

// Bounces the browser to Kroger's login/consent screen. Kroger sends the
// customer back to /api/kroger/callback with an authorization code.
export async function GET() {
  try {
    return NextResponse.redirect(authorizeUrl());
  } catch (err) {
    return NextResponse.json({ error: err.code ?? "error", message: err.message }, { status: 500 });
  }
}
