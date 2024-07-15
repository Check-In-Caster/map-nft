import OpenLocationCode from "@/lib/openlocationcode";
import { prisma } from "@/lib/prisma";
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

const TextInfo = ({ label }: { label: string | null | undefined }) => {
  return (
    <div
      style={{
        marginTop: "18px",
        fontWeight: "bold",
      }}
      className="flex flex-col text-3xl mt-10 pt-6"
    >
      {label}
    </div>
  );
};

export async function GET(
  req: NextRequest,
  props: {
    params: {
      propertyId: string;
    };
  }
) {
  const property = await prisma.propertyInfo.findFirst({
    where: {
      property_id: props.params.propertyId,
    },
    include: {
      Locations: true,
    },
  });

  const coordinates = property?.Locations?.coordinates as {
    lat: number;
    lng: number;
  };

  const openLocationCode = new OpenLocationCode();

  const longPlusCode = openLocationCode.encode(
    coordinates.lat,
    coordinates.lng,
    10
  );
  const shortPlusCode = openLocationCode.shorten(
    longPlusCode,
    coordinates.lat.toFixed(1),
    coordinates.lng.toFixed(1)
  );

  console.log(shortPlusCode);
  let address = property?.Locations?.address ?? "";
  let firstCommaIndex = address.indexOf(",");
  let result = address.slice(firstCommaIndex + 1).trim();

  const imageResponse = new ImageResponse(
    (
      <div tw="flex flex-col  p-4 bg-black w-full h-full text-white text-2xl font-medium relative">
        <TextInfo label={property?.country} />
        <TextInfo label={property?.Locations?.category} />
        <TextInfo label={result ?? ""} />
        <TextInfo label={shortPlusCode} />
        <TextInfo label={`${coordinates.lat} ${coordinates?.lng}`} />
        <TextInfo
          label={
            Number(property?.score) != 0 ? String(property?.score ?? "") : ""
          }
        />
      </div>
    ),
    {
      width: 681,
      height: 681,
      headers: {
        "Cache-Control": "public, max-age=86400, immutable",
      },
    }
  );

  return imageResponse;
}
