import { prisma } from "@/lib/prisma";
import { shortenAddress } from "@/lib/utils";
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  props: {
    params: {
      propertyId: string;
    };
  }
) {
  const map = await prisma.maps.findFirst({
    where: {
      map_id: props.params.propertyId,
    },
    include: {
      MapsCreator: true,
    },
  });

  if (!map) {
    return new Response("Not found", { status: 404 });
  }

  const imageResponse = new ImageResponse(
    (
      <div
        tw="flex h-full"
        style={{
          ...(map.thumbnail
            ? {
                backgroundImage: `url(${map.thumbnail})`,
                objectFit: "cover",
              }
            : {}),
        }}
      >
        <div
          tw="flex flex-col w-full p-0 w-full h-full text-white text-2xl font-medium relative bg-red-500"
          style={{
            background: map.thumbnail ? "rgba(0, 0, 0, 0.75)" : "#ffffff",
          }}
        >
          <div tw="flex flex-col pt-24 justify-center items-center">
            {!map.thumbnail && map.map_emoji ? (
              <img width={90} height={90} src={map.map_emoji} alt="" />
            ) : null}

            <div
              style={{
                marginTop: map.thumbnail ? "98px" : "28px",
                fontSize: "54px",
                fontWeight: "bold",
                color: map.thumbnail ? "#fff" : "#000",
              }}
              tw="flex flex-col text-8xl text-white  pt-6 text-center"
            >
              {map.name}
            </div>
          </div>

          <div
            tw="flex justify-start items-center text-left mt-auto ml-6 text-white"
            style={{
              color: map.thumbnail ? "#fff" : "#000",
              paddingBottom: "20px",
            }}
          >
            <img
              src={
                map.MapsCreator?.profile_image ??
                "https://i.imgur.com/yZOyUGG.png"
              }
              tw="w-[56px] h-[56px] rounded-full"
            />
            <span tw="ml-5">
              {map.MapsCreator?.name ??
                shortenAddress(map?.wallet_address ?? "")}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 681,
      height: 681,
      debug: false,
      headers: {
        "Cache-Control": "public, max-age=86400, immutable",
      },
    }
  );

  return imageResponse;
}
