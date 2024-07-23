import HeroSection from "@/components/home/hero-section";
import NFTCard from "@/components/home/nft-card";
import TrendingMaps from "@/components/home/trending-maps";
import Heading from "@/components/ui/heading";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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

  const trendingMaps = await prisma.maps.findMany({
    orderBy: {
      total_minted: "desc",
    },
    take: 4,
  });

  return {
    trendingMaps,
  };
};

export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const { trendingMaps } = await getData(
    searchParams.property,
    searchParams.secret
  );

  return (
    <>
      <HeroSection />
      <div className="mt-8 max-w-7xl mx-auto mb-8 p-2 md:p-0">
        <Heading label="Trending Maps" />

        {trendingMaps?.length === 0 && (
          <div className="flex items-center justify-center mt-10">
            <p className="text-xl font-semibold text-gray-500">
              No Trending Maps!
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {trendingMaps?.map((map) => {
            return (
              <NFTCard
                key={map.map_id}
                property_id={map.map_id!}
                token_id={map.token_id ? Number(map.token_id) : undefined}
                title={map.name}
                slug={map.slug}
                imgUrl={map.thumbnail ?? undefined}
                emoji={map.map_emoji ?? undefined}
                creator={{
                  wallet: map.wallet_address,
                }}
              />
            );
          })}
        </div>

        <Heading label="Tokyo Maps" />
        <TrendingMaps />
      </div>
    </>
  );
}
