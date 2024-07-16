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
  // const property = await prisma.propertyInfo.findFirst({
  //   where: {
  //     property_id: props.params.propertyId,
  //   },
  //   include: {
  //     Locations: true,
  //   },
  // });

  const imageResponse = new ImageResponse(
    (
      <div tw="flex flex-col w-full justify-center items-center  p-4 bg-white w-full h-full text-white text-2xl font-medium relative">
        <img
          width={72}
          height={72}
          src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f35c.png"
          alt=""
        />

        <div
          style={{
            marginTop: "18px",
            fontSize: "54px",
            fontWeight: "bold",
            color: "black",
          }}
          className="flex flex-col text-8xl mt-10 pt-6"
        >
          Top 10 Ramen in Tokyo
        </div>

        <div
          className="text-[#000] flex justify-start"
          style={{ color: "#000" }}
        >
          User
        </div>
      </div>
    ),
    {
      width: 681,
      height: 681,
      debug: true,
      headers: {
        "Cache-Control": "public, max-age=86400, immutable",
      },
    }
  );

  return imageResponse;
}
