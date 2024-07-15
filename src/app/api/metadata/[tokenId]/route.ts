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
        name: `Onchain Property by Checkin`,
        description:
          "Own Property NFTs, the onchain version of famous places like Eiffel Tower or your favorite local cafe! Owning Property NFTs unlock ephemeral games and rewards!",
        external_url: `https://property.checkin.gg/`,

        image: `https://property.checkin.gg/assets/images/cover_image.png`,
        imageURI: `https://property.checkin.gg/assets/images/cover_image.png`,
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

  const image =
    "https://property.checkin.gg/api/image/" + getToken?.property_id;

  if (getToken) {
    return new Response(
      JSON.stringify({
        name: `Fan of ${getToken.Locations?.location}`,
        description: `${getToken.Locations?.category} in ${getToken.Locations?.country}
${getToken.Locations?.map_url}`,
        image: `${image}`,
        imageURI: `${image}`,
        external_url: `https://property.checkin.gg/`,
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
