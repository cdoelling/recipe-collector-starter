import { NextResponse } from "next/server";
import { readPantry, writePantry } from "@/lib/shopping";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ staples: readPantry() });
}

export async function POST(request) {
  const { add, remove } = await request.json();
  let staples = readPantry();
  if (add) staples = [...staples, add];
  if (remove) staples = staples.filter((s) => s.toLowerCase() !== String(remove).toLowerCase());
  return NextResponse.json({ staples: writePantry(staples) });
}
