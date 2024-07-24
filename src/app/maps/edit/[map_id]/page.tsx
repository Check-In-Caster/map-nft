import { getMapsToken } from "@/components/home/actions";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import MapForm from "../../create/MapForm";

const getMapDetails = async (id: string) => {
  const session = await getServerSession();

  const map = await prisma.maps.findFirst({
    where: {
      map_id: id,
    },
    include: {
      MapsPlaces: true,
    },
  });

  console.log(map);

  if (
    map?.wallet_address.toLocaleLowerCase() !=
    session?.user?.name?.toLocaleLowerCase()
  ) {
    return null;
  }

  return map;
};

const Page = async ({
  params,
  searchParams,
}: {
  params: {
    map_id: string;
  };
  searchParams: Record<string, string>;
}) => {
  const map = await getMapDetails(params.map_id);

  if (!map) {
    return redirect("/");
  }

  if (!map)
    return (
      <div className="mt-8 w-full max-w-7xl mx-auto mb-8">Map not found</div>
    );

  const mapToken = await getMapsToken();
  return (
    <MapForm
      heading="Edit Map"
      buttonText="Submit"
      mapToken={mapToken}
      bio="hide"
      values={{
        map_id: map.map_id,
        name: map.name,
        description: map.description!,
        thumbnail: map.thumbnail!,
        emoji: map.map_emoji!,
        places: map.MapsPlaces.map((place) => ({
          property_id: place.property_id!,
          description: place.description!,
        })),
      }}
    />
  );
};

export default Page;
