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
          "557b7107-f020-493b-9c01-483b49876bcf",
          "5cca9abb-5d94-471c-8277-55b3cab5f72b",
          "80f8ee6e-1645-4557-85a9-97bc36a073b5",
          "91ddd21c-96b5-412f-ba85-8872b1f4ce12",
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
