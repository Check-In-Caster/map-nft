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

  const getToken = await prisma.propertyInfo.findFirst({
    where: {
      token_id: Number(tokenId),
    },
    include: {
      Locations: true,
    },
  });

  const image = `${DOMAIN}/api/image/` + getToken?.property_id;

  if (getToken) {
    return new Response(
      JSON.stringify({
        name: `Fan of ${getToken.Locations?.location}`,
        description: `${getToken.Locations?.category} in ${getToken.Locations?.country}
${getToken.Locations?.map_url}`,
        image: `${image}`,
        imageURI: `${image}`,
        external_url: `${DOMAIN}`,
        attributes: [
          {
            trait_type: "score",
            value: getToken.score,
          },
          {
            trait_type: "country",
            value: getToken.Locations?.country,
          },
          {
            trait_type: "category",
            value: getToken.Locations?.category,
          },
          {
            trait_type: "coordinates",
            value: JSON.stringify(getToken.Locations?.coordinates),
          },
          {
            trait_type: "map",
            value: JSON.stringify(getToken.Locations?.map_url),
          },
        ],
      })
    );
  }

  return new Response(
    JSON.stringify({
      error: "Token not found",
    })
  );
}
