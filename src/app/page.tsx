import { getMapsToken } from "@/components/home/actions";
import FeatureBanner from "@/components/home/feature-banner";
import HeroSection from "@/components/home/hero-section";
import PropertyModal from "@/components/home/property-modal";
import TrendingProperty from "@/components/home/trending-property";
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

  const defaultProperty = await prisma.propertyInfo.findFirst({
    where: {
      property_id: "d69f511d-46d0-4d18-a520-f40782d9f4fb",
    },
    include: {
      Locations: true,
    },
  });

  const trendingProperties = await prisma.propertyInfo.findMany({
    where: {
      Locations: {
        country: {
          not: "China",
        },
      },
    },
    orderBy: {
      total_minted: "desc",
    },
    take: 4,
    include: {
      Locations: true,
    },
  });

  const trumpProperties = await prisma.propertyInfo.findMany({
    where: {
      property_id: {
        in: [
          "dbaf00bb-156f-4fb9-a542-6dda53fefe17",
          "d6b05b20-0dfe-4410-a3fb-afc9ee290eac",
          "2300f474-4d77-4381-9392-b12433dc77e7",
          "808a359d-08dc-4edd-9a21-4b1a685bb86b",
        ],
      },
    },
    include: {
      Locations: true,
    },
  });

  // [FIX] - cache these results.
  const owners = await prisma.propertySales.groupBy({
    by: ["wallet_address"],
  });

  const properties = await prisma.propertySales.aggregate({
    _sum: {
      quantity: true,
    },
  });

  const property = propertyId
    ? await prisma.propertyInfo.findUnique({
        include: {
          Locations: true,
        },
        where: {
          property_id: propertyId,
        },
      })
    : null;

  return {
    owners: owners.length.toString(),
    properties: (properties?._sum?.quantity ?? 0).toString(),
    property: property,
    defaultProperty: defaultProperty,
    trendingProperties: trendingProperties,
    trumpProperties: trumpProperties,
  };
};

export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const {
    owners,
    properties,
    property,
    defaultProperty,
    trendingProperties,
    trumpProperties,
  } = await getData(searchParams.property, searchParams.secret);
  const mapToken = await getMapsToken();

  return (
    <>
      {searchParams.property && (
        <PropertyModal
          referral={searchParams.ref}
          property={
            property as PropertyInfo & { Locations: Partial<Locations> }
          }
        />
      )}
      <HeroSection
        mapToken={mapToken}
        defaultProperty={defaultProperty as Properties[number]}
      />
      <FeatureBanner />
      <div className="mt-8 max-w-7xl mx-auto mb-8 p-2 md:p-0">
        <Heading label="Trending Properties" />

        <div className="grid grid-cols-2 gap-5 my-10 ">
          <div className="bg-white border border-gray-900 text-center font-medium py-6">
            <p className="text-xl">Total Onchain Property Owners 🎩</p>
            <p className={`text-3xl mt-2 ${inter.className}`}>
              {formatNumberWithCommas(owners.toString())}
            </p>
          </div>
          <div className="bg-white border border-gray-900 text-center font-medium py-6">
            <p className="text-xl">Total Onchain Properties 🏠</p>
            <p className={`text-3xl mt-2 ${inter.className}`}>
              {formatNumberWithCommas(properties.toString())}
            </p>
          </div>
        </div>

        <TrendingProperty properties={trendingProperties as Properties} />

        <TopPortfolios />

        {/* <div className="text-center my-10">
          <button className="bg-[#EF9854] text-[#000] border border-gray-900 py-2 px-5">
            Check Your Eligibility for Airdrop
          </button>
        </div> */}

        <Leaderboard />
        <Heading label="What Trump Owned in the 90s" />

        <div className="grid place-items-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-x-5 gap-y-10 py-5 sm:py-10 p-2 md:p-0">
          <TrumpProperties properties={trumpProperties as Properties} />

          <div className="border col-span-1 border-gray-900 max-w-[350px] sm:max-w-[400px] order-1 sm:order-2 p-2 relative">
            <img src="/assets/images/trump.png" alt="" />
          </div>
        </div>
      </div>
    </>
  );
}
