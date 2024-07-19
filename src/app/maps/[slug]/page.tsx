import { Heart, Share } from "lucide-react";
import Image from "next/image";
import { Lexend } from "next/font/google";
import { shortenAddress } from "@/lib/utils";
import { getMapsToken } from "@/components/home/actions";
import AppleMap from "@/components/home/map";
import { prisma } from "@/lib/prisma";
import { getFarcasterAccount } from "@/lib/airstack";
import { notFound } from "next/navigation";
import NFTCard from "@/components/home/nft-card";

const lexend = Lexend({
  subsets: ["latin"],
});

const PlaceCard = ({
  property_id,
  name,
  image,
  rating,
  category,
  wallet_address,
  placeDescription,
}: {
  property_id: string;
  name: string;
  image: string;
  rating: number;
  category: string;
  wallet_address: string;
  placeDescription: React.ReactNode;
}) => {
  const propertyLink = `https://property.checkin.gg?property=${property_id}&ref=${wallet_address}`;

  return (
    <>
      <div className="flex">
        <div className="w-40">
          <img src={image} alt="place" className="rounded aspect-square w-40" />
        </div>
        <div className="pl-6 relative flex flex-col">
          <div className="text-xl">{name}</div>
          <div className="flex items-center font-normal">
            {rating}
            <img
              src="/assets/icons/ratings.svg"
              alt=""
              className="inline pr-4 pl-1"
            />
          </div>
          <div className="font-light">{category}</div>
          <div className="font-thin">{placeDescription}</div>
          <a
            href={propertyLink}
            target="_blank"
            className="bg-white text-center border border-[#5844C1] mt-3 py-1.5"
          >
            Mint
          </a>
        </div>
      </div>
    </>
  );
};

const MapDetailsPage = async ({
  params,
  searchParams,
}: {
  params: {
    slug: string;
  };
  searchParams: Record<string, string>;
}) => {
  const { slug } = params;

  const map = await prisma.maps.findFirst({
    where: {
      slug,
    },
    include: {
      MapsPlaces: true,
    },
  });

  if (!map) {
    notFound();
  }

  const mapToken = await getMapsToken();

  let mapPlaces = await prisma.propertyInfo.findMany({
    where: {
      property_id: {
        in: map?.MapsPlaces.map((place) => place.property_id),
      },
    },
    include: {
      Locations: true,
    },
  });

  // sorting the mapPlaces array based on the order of the map.MapsPlaces array
  const mapPlacesMap = new Map(
    mapPlaces.map((place) => [place.property_id, place])
  );
  mapPlaces = [];
  for (const place of map.MapsPlaces) {
    if (mapPlacesMap.has(place.property_id)) {
      mapPlaces.push(
        mapPlacesMap.get(place.property_id) as (typeof mapPlaces)[number]
      );
    }
  }

  const mapCoordinates = mapPlaces.map((place) => {
    const coordinates = place.Locations?.coordinates as {
      lat: number;
      lng: number;
    };
    return {
      lat: coordinates.lat ?? 0,
      lng: coordinates.lng ?? 0,
    };
  });

  const farcasterProfile =
    map.wallet_address != ""
      ? await getFarcasterAccount(map?.wallet_address)
      : null;

  return (
    <div className="mt-8 max-w-7xl mx-auto mb-8 p-2 md:p-0">
      <section className="flex justify-between">
        <div>
          <h1 className="text-4xl">{map?.name}</h1>
          <h2
            className={`text-xl mt-2 ${lexend.className} font-light tracking-normal`}
          >
            {map?.description}
          </h2>

          <div className="flex gap-2 items-center mt-3">
            <Image
              src={
                farcasterProfile?.profileImage ??
                "https://i.imgur.com/yZOyUGG.png"
              }
              alt={farcasterProfile?.profileName ?? ""}
              height={28}
              width={28}
              className="rounded-full h-7 w-7 object-cover"
            />
            <span className="text-sm">
              {farcasterProfile?.profileName ??
                shortenAddress(map?.wallet_address ?? "")}
            </span>
          </div>

          <div>
            <NFTCard
              key={map.map_id}
              property_id={map.map_id!}
              token_id={undefined}
              title={map.name}
              slug={map.slug}
              imgUrl={map.thumbnail ?? "https://via.placeholder.com/160"}
              emoji={map.map_emoji ?? ""}
              creator={{
                wallet: map.wallet_address,
                farcaster: {
                  imgUrl:
                    farcasterProfile?.profileImage ??
                    "https://i.imgur.com/yZOyUGG.png",
                  name: farcasterProfile?.profileName,
                },
              }}
              hideCard
              hide_view_btn
              buttonClassName="bg-[#5844C1] text-white mt-3 px-10 py-2 text-lg"
              mintButtonText="Mint to Support"
            />
          </div>
        </div>
        <div className="flex gap-4 items-start">
          <button className="rounded-full p-2 hover:shadow-md hover:bg-white outline-none focus:outline-none focus-within:outline-none">
            <Heart />
          </button>
          <button className="rounded-full p-2 hover:shadow-md hover:bg-white outline-none focus:outline-none focus-within:outline-none">
            <Share />
          </button>
        </div>
      </section>

      <section className="mt-8 flex gap-x-2">
        <div className="flex-1 flex flex-col gap-y-5">
          {mapPlaces.map((place, i) => (
            <PlaceCard
              property_id={place.property_id}
              name={place.Locations?.location ?? ""}
              key={place.property_id}
              image={
                place.Locations?.image ?? "https://via.placeholder.com/160"
              }
              rating={place.Locations?.rating ?? 0}
              category={place.Locations?.category ?? ""}
              wallet_address={map.wallet_address}
              placeDescription={map?.MapsPlaces[i].description}
            />
          ))}
        </div>

        <div className="flex-[2] min-h-96">
          <AppleMap token={mapToken} coordinatesArray={mapCoordinates} />
        </div>
      </section>
    </div>
  );
};

export default MapDetailsPage;
