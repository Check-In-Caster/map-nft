import { getMapsToken } from "@/components/home/actions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import MapForm from "./MapForm";

const Page = async () => {
  const mapToken = await getMapsToken();
  const session = await getServerSession();
  const wallet_address = session?.user?.name?.toLocaleLowerCase() ?? "";

  const creatorProfile = await prisma.mapsCreator.findFirst({
    where: {
      wallet_address: wallet_address,
    },
  });

  return (
    <MapForm mapToken={mapToken} bio={creatorProfile?.creator_bio ?? null} />
  );
};

export default Page;
