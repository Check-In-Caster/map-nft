import { getMapsToken } from "@/components/home/actions";
import FeatureBanner from "@/components/home/feature-banner";
import HeroSection from "@/components/home/hero-section";
import PropertyModal from "@/components/home/property-modal";
import TrendingMaps from "@/components/home/trending-maps";
import TrumpProperties from "@/components/home/trump-properties";
import Heading from "@/components/ui/heading";
import { inter } from "@/fonts";
import { prisma } from "@/lib/prisma";
import { formatNumberWithCommas } from "@/lib/utils";
import { Properties } from "@/types/property";
import { Locations, PropertyInfo } from "@prisma/client";
import { redirect } from "next/navigation";
import Leaderboard from "./leaderboard/page";
import TopPortfolios from "@/components/home/top-portfolios";

const getData = async (propertyId: string, secret: string) => {
  const settings = await prisma.settings.findFirst({
    where: {
      name: "property_maintenance",
    },
  });

  const maintenance_mode = settings?.value;

  if (maintenance_mode === "true" && secret != "QWKGJTSV") {
    return redirect("/maintenance");
  }

  // const defaultProperty = await prisma.propertyInfo.findFirst({
  //   where: {
  //     property_id: "d69f511d-46d0-4d18-a520-f40782d9f4fb",
  //   },
  //   include: {
  //     Locations: true,
  //   },
  // });

  // const trendingProperties = await prisma.propertyInfo.findMany({
  //   where: {
  //     Locations: {
  //       country: {
  //         not: "China",
  //       },
  //     },
  //   },
  //   orderBy: {
  //     total_minted: "desc",
  //   },
  //   take: 4,
  //   include: {
  //     Locations: true,
  //   },
  // });

  // // [FIX] - cache these results.
  // const owners = await prisma.propertySales.groupBy({
  //   by: ["wallet_address"],
  // });

  // const properties = await prisma.propertySales.aggregate({
  //   _sum: {
  //     quantity: true,
  //   },
  // });

  // const property = propertyId
  //   ? await prisma.propertyInfo.findUnique({
  //       include: {
  //         Locations: true,
  //       },
  //       where: {
  //         property_id: propertyId,
  //       },
  //     })
  //   : null;

  return {
    // owners: owners.length.toString(),
    // properties: (properties?._sum?.quantity ?? 0).toString(),
    // property: property,
    // defaultProperty: defaultProperty,
    // trendingProperties: trendingProperties,
    // trumpProperties: trumpProperties,
  };
};

export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  // const { property, trendingProperties } = await getData(
  //   searchParams.property,
  //   searchParams.secret
  // );

  // await getData(searchParams.property, searchParams.secret);

  return (
    <>
      {/* {searchParams.property && (
        <PropertyModal
          referral={searchParams.ref}
          property={
            property as PropertyInfo & { Locations: Partial<Locations> }
          }
        />
      )} */}
      <HeroSection />
      <div className="mt-8 max-w-7xl mx-auto mb-8 p-2 md:p-0">
        <Heading label="Trending Maps" />
        <TrendingMaps />

        <Heading label="Tokyo Maps" />
        <TrendingMaps />
      </div>
    </>
  );
}
