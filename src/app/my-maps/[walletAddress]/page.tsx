import { getFarcasterAccount } from "@/lib/airstack";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MyStats from "./StatsPage";

const getProperties = async (
  wallet_address: string,
  profileTokenId?: number,
  secret?: string
) => {
  const settings = await prisma.settings.findFirst({
    where: {
      name: "property_maintenance",
    },
  });

  const maintenance_mode = settings?.value;

  if (maintenance_mode === "true" && secret != "QWKGJTSV") {
    return redirect("/maintenance");
  }

  const mapsCreatedCount = await prisma.maps.count({
    where: { wallet_address: wallet_address },
  });
  const mapsCollectedCount = await prisma.mapsCollected.count({
    where: { wallet_address: wallet_address },
  });

  let count = 0;

  if (profileTokenId) {
    count = await prisma.checkin.count({
      where: {
        fid: String(profileTokenId),
      },
    });
  }

  const mapsCreted = await prisma.mapsCollected.findMany({
    where: { wallet_address: wallet_address },
    take: 50,
  });

  const mapsCollected = await prisma.mapsCollected.findMany({
    where: { wallet_address: wallet_address },
    include: {
      map: true,
    },
    take: 50,
  });

  const mapsLiked = await prisma.mapsLiked.findMany({
    where: { wallet_address: wallet_address },
    include: {
      map: true,
    },
    take: 50,
  });

  return {
    checkInCount: count,
    maps: {
      collected: mapsCollected,
      liked: mapsLiked,
      created: mapsCreted,
    },
    stats: {
      maps_created: mapsCreatedCount.toString(),
      maps_collected: mapsCollectedCount.toString(),
    },
  };
};

const Page = async ({
  params,
  searchParams,
}: {
  params: {
    walletAddress: string;
  };
  searchParams: Record<string, string>;
}) => {
  const walletAddress = params.walletAddress.toLocaleLowerCase();

  const profile =
    walletAddress != "" ? await getFarcasterAccount(walletAddress) : null;
  const { checkInCount, stats, maps } = await getProperties(
    walletAddress ?? "",
    profile?.profileTokenId ?? null,
    searchParams.secret
  );

  return (
    <MyStats
      profile={profile}
      checkInCount={checkInCount}
      stats={stats}
      walletAddress={walletAddress}
      // @ts-ignore
      maps={maps}
    />
  );
};

export default Page;
