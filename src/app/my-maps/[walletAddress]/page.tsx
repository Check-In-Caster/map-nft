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

  return {
    checkInCount: 1,
    stats: { propery_count: 1 },
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
  const { checkInCount, stats } = await getProperties(
    walletAddress ?? "",
    profile?.profileTokenId ?? null,
    searchParams.secret
  );

  const mapToken = await getMapsToken();

  return (
    <MyStats
      profile={profile}
      checkInCount={checkInCount}
      mapToken={mapToken}
      walletAddress={walletAddress}
    />
  );
};

export default Page;
