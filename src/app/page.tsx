import HeroSection from "@/components/home/hero-section";
import NFTCard from "@/components/home/nft-card";
import TrendingMaps from "@/components/home/trending-maps";
import Heading from "@/components/ui/heading";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

const getData = async (propertyId: string, secret: string) => {
  const settings = await prisma.settings.findFirst({
    where: {
      name: "map_maintenance",
    },
  });

  const maintenance_mode = settings?.value;

  if (maintenance_mode === "true" && secret != process.env.ACCESS_SECRET) {
    return redirect("/maintenance");
  }

  const trendingMaps = await prisma.maps.findMany({
    orderBy: {
      total_minted: "desc",
    },
    include: {
      MapsCreator: true,
    },
    take: 4,
  });

  const featuredMaps = await prisma.maps.findMany({
    where: {
      map_id: {
        in: [
          "61ec5242-7f0e-4a40-89b8-4f671a2415ff",
          "62b48d20-4e65-410e-84ef-3345d91872f1",
          "b08b84a4-4609-41a1-b5d3-314952b555b0",
          "1d5c1c67-5e83-4225-8176-602de2088cc4",
        ],
      },
    },
    include: {
      MapsCreator: true,
    },
    orderBy: {
      total_minted: "desc",
    },
    take: 4,
  });

  return {
    trendingMaps,
    featuredMaps,
  };
};

export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const { trendingMaps, featuredMaps } = await getData(
    searchParams.property,
    searchParams.secret,
  );

  return (
    <>
      <HeroSection />
      <div className="mx-auto mb-8 mt-8 max-w-7xl p-2 md:p-0">
        <Heading label="Trending Maps" />

        {trendingMaps?.length === 0 && (
          <div className="mt-10 flex items-center justify-center">
            <p className="text-xl font-semibold text-gray-500">
              No Trending Maps!
            </p>
          </div>
        )}

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {trendingMaps?.map((map) => {
            return (
              <NFTCard
                key={map.map_id}
                eth_amount={map.eth_amount}
                userMinted={Number(map.total_minted ?? 0)}
                property_id={map.map_id!}
                token_id={map.token_id ? Number(map.token_id) : undefined}
                title={map.name}
                slug={map.slug}
                imgUrl={map.thumbnail ?? undefined}
                emoji={map.map_emoji ?? undefined}
                creator={{
                  wallet: map.wallet_address,
                  farcaster: {
                    imgUrl: map.MapsCreator?.profile_image ?? undefined,
                    name: map.MapsCreator?.name ?? undefined,
                  },
                }}
              />
            );
          })}
        </div>

        <div className="mt-10 grid place-items-center text-center">
          <Link
            href="/maps"
            className="mt-7 inline bg-[#0067D9] px-6 py-2 text-lg tracking-wider text-white"
          >
            View all maps
          </Link>
        </div>

        <Heading label="Tokyo Maps" />
        <TrendingMaps maps={featuredMaps} />
      </div>
    </>
  );
}
