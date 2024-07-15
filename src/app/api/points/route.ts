import { getPoints } from "@/lib/helpers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const points = getPoints("category", 4, 10000);

  return NextResponse.json({ message: points });
}
