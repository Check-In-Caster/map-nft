import { getMapsToken } from "@/components/home/actions";
import { prisma } from "@/lib/prisma";
import MapForm from "../../create/MapForm";

const getMapDetails = async (id: string) => {
  const map = await prisma.maps.findFirst({
    where: {
      map_id: id,
    },
    include: {
      MapsPlaces: true,
    },
  });

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
  console.log(map);

  const mapToken = await getMapsToken();

  if (!map)
    return (
      <div className="mt-8 w-full max-w-7xl mx-auto mb-8">Map not found</div>
    );

  return (
    <MapForm
      heading="Edit Map"
      buttonText="Submit"
      mapToken={mapToken}
      values={{
        map_id: map.map_id,
        name: map.name,
        description: map.description!,
        emoji: map.map_emoji!,
        places: map.MapsPlaces.map((place) => ({
          location_id: place.location_id!,
          description: place.description!,
        })),
      }}
    />
  );
};

export default Page;
