import { NextResponse } from "next/server";
import { isConnected, sendListToCart } from "@/lib/kroger";

export const dynamic = "force-dynamic";

// Lets the list know whether it should offer "Send to cart" or "Connect".
export async function GET() {
  return NextResponse.json({ connected: isConnected() });
}

// Body: { items: [{ term, name, quantity }] }. Matches each to a product and
// adds the matches to the customer's Kroger cart.
export async function POST(request) {
  const { items } = await request.json();
  if (!Array.isArray(items) || !items.length) {
    return NextResponse.json({ error: "no items" }, { status: 400 });
  }
  try {
    const result = await sendListToCart(items);
    return NextResponse.json(result);
  } catch (err) {
    // Not connected (or token gone) → tell the client to start the OAuth flow.
    if (err.code === "not_connected") {
      return NextResponse.json({ error: "not_connected" }, { status: 401 });
    }
    return NextResponse.json({ error: err.code ?? "error", message: err.message }, { status: 500 });
  }
}
