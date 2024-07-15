import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") notFound();

  if (!req.url.includes("confirm")) {
    return NextResponse.json(
      {
        message: "-_-",
        url: req.url,
      },
      { status: 200 }
    );
  }

  const getProperty = await prisma.propertyInfo.findMany({
    where: {
      token_id: {
        not: null,
      },
    },
  });

  for (const property of getProperty) {
    const total_minted = await prisma.propertySales.count({
      where: {
        property_id: property.property_id,
      },
    });
    console.log(property, total_minted);

    await prisma.propertyInfo.update({
      where: {
        property_id: property.property_id,
      },
      data: {
        total_minted: total_minted,
      },
    });
  }

  return NextResponse.json({ message: "updated records" });
}
