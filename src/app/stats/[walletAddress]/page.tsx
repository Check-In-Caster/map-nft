import { getMapsToken } from "@/components/home/actions";
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

  const propertyCounts = await prisma.propertySales.groupBy({
    by: ["property_id"],
    where: {
      wallet_address: wallet_address,
    },
    _sum: {
      quantity: true,
    },
  });

  const propertyDetails = await prisma.propertySales.findMany({
    where: {
      wallet_address: wallet_address,
    },
    select: {
      property_id: true,
      PropertyInfo: {
        include: {
          Locations: true,
        },
      },
    },
  });

  let userPropertyCount = 0;
  let propertyScore = 0;

  const userProperties = propertyCounts.map((count) => {
    const details = propertyDetails.find(
      (detail) => detail.property_id === count.property_id
    );

    if (count._sum.quantity) {
      userPropertyCount += count._sum.quantity;
      propertyScore +=
        count._sum.quantity * Number(details?.PropertyInfo?.score ?? 0);
    }

    return {
      property_id: count.property_id,
      count: count._sum.quantity,
      PropertyInfo: details ? details.PropertyInfo : null,
    };
  });

  let count = 0;

  if (profileTokenId) {
    count = await prisma.checkin.count({
      where: {
        fid: String(profileTokenId),
      },
    });
  }

  return {
    userProperties,
    checkInCount: count,
    stats: { propery_count: userPropertyCount, propertyScore },
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
  const { userProperties, checkInCount, stats } = await getProperties(
    walletAddress ?? "",
    profile?.profileTokenId ?? null,
    searchParams.secret
  );

  const mapToken = await getMapsToken();

  return (
    <MyStats
      userProperties={userProperties as any}
      profile={profile}
      checkInCount={checkInCount}
      mapToken={mapToken}
      stats={stats}
      walletAddress={walletAddress}
    />
  );
};

export default Page;
