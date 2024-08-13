import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Record<string, string> },
) {
  const wallet_address = params.wallet_address;

  const creatorProfile = await prisma.mapsCreator.findFirst({
    where: {
      wallet_address: wallet_address.toLocaleLowerCase(),
    },
  });

  return NextResponse.json({
    bio: creatorProfile?.creator_bio ?? null,
  });
}
