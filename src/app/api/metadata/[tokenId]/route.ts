import { DOMAIN } from "@/config";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Record<string, string> }
) {
  const tokenId = params.tokenId;

  if (tokenId == "0") {
    return new Response(
      JSON.stringify({
        name: `Maps by Checkin`,
        description: "Curate, Mint, Earn. Your Recommendations, onchain.",
        external_url: `${DOMAIN}/`,

        image: `${DOMAIN}/assets/images/cover_image.png`,
        imageURI: `${DOMAIN}/assets/images/cover_image.png`,
        attributes: [],
      })
    );
  }

  const getToken = await prisma.maps.findFirst({
    where: {
      token_id: String(tokenId),
    },
  });

  const image = `${DOMAIN}/api/image/` + getToken?.map_id;

  if (getToken) {
    return new Response(
      JSON.stringify({
        name: `${getToken.name}`,
        description: `${getToken.description}`,
        image: `${image}`,
        imageURI: `${image}`,
        external_url: `${DOMAIN}`,
        attributes: [],
      })
    );
  }

  return new Response(
    JSON.stringify({
      error: "Token not found",
    })
  );
}
