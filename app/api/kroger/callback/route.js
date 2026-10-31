import { NextResponse } from "next/server";
import { handleCallback } from "@/lib/kroger";

export const dynamic = "force-dynamic";

// Where Kroger returns after login. We swap the code for tokens (saved to
// data/kroger.json) and drop the customer back on the list, connected.
export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL(`/list?kroger=${error ?? "denied"}`, request.url));
  }
  try {
    await handleCallback(code, state);
    return NextResponse.redirect(new URL("/list?kroger=connected", request.url));
  } catch (err) {
    return NextResponse.redirect(new URL(`/list?kroger=${err.code ?? "error"}`, request.url));
  }
}
