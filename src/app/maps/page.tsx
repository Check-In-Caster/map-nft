import NFTCard from "@/components/home/nft-card";
import Heading from "@/components/ui/heading";
import Pagination from "@/components/ui/pagination";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const getData = async (secret: string, page: number) => {
  const limit = 12;

  const settings = await prisma.settings.findFirst({
    where: {
      name: "map_maintenance",
    },
  });

  const maintenance_mode = settings?.value;

  if (maintenance_mode === "true" && secret != process.env.ACCESS_SECRET) {
    return redirect("/maintenance");
  }

  const offset = ((page ?? 1) - 1) * limit;

  const trendingMaps = await prisma.maps.findMany({
    orderBy: {
      total_minted: "desc",
    },
    include: {
      MapsCreator: true,
    },
    take: limit,
    skip: offset,
  });

  const totalMaps = await prisma.maps.count();

  return {
    trendingMaps,
    totalMaps,
  };
};

export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const { trendingMaps, totalMaps } = await getData(
    searchParams.secret,
    Number(searchParams?.page ?? 1)
  );

  return (
    <>
      <div className="mt-8 max-w-7xl mx-auto mb-8 p-2 md:p-0">
        <Heading label="Maps" />

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
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

        <Pagination totalMaps={totalMaps} />
      </div>
    </>
  );
}
