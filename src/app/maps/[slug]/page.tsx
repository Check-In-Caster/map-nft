import { getMapsToken } from "@/components/home/actions";
import AppleMap from "@/components/home/map";
import NFTCard from "@/components/home/nft-card";
import OSFont from "@/components/home/os-font";
import { prisma } from "@/lib/prisma";
import { shortenAddress } from "@/lib/utils";
import { Lexend } from "next/font/google";
import Image from "next/image";

import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import EditMapButton from "./EditMapButton";
import LikeMap from "./LikeMap";
import ShareMap from "./ShareMap";

const lexend = Lexend({
  subsets: ["latin"],
  weight: "300",
});

const PlaceCard = ({
  property_id,
  name,
  map_url,
  image,
  rating,
  category,
  wallet_address,
  placeDescription,
}: {
  property_id: string;
  name: string;
  map_url: string;
  image: string;
  rating: number;
  category: string;
  wallet_address: string;
  placeDescription: React.ReactNode;
}) => {
  const propertyLink = `https://property.checkin.gg?property=${property_id}&ref=${wallet_address}`;

  return (
    <>
      <div className="flex flex-col items-center bg-white py-10 shadow-md space-y-5">
        <a href={map_url} target="_BLANK" className="text-xl">
          <img
            src={image}
            alt="place"
            className="rounded w-[220px] h-[220px]"
          />
        </a>

        <div className="relative flex flex-col text-center space-y-2 flex-1">
          <a href={map_url} target="_BLANK" className="text-xl">
            {name}
          </a>

          <div className="flex items-center justify-center text-center font-normal">
            {rating}
            <img
              src="/assets/icons/ratings.svg"
              alt=""
              className="inline pr-4 pl-1"
            />
          </div>
          <div className="font-thin text-center text-gray-500">{category}</div>
          <div className="font-thin text-center w-[260px] my-4">
            {placeDescription ? `" ${placeDescription} "` : null}
          </div>
          <a
            href={propertyLink}
            target="_blank"
            className="bg-white text-center border border-[#5844C1]  py-1.5  block mt-8"
          >
            Mint Place
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

  const session = await getServerSession();
  const wallet_address = session?.user?.name?.toLocaleLowerCase() ?? "";

  const minted = await prisma.mapsCollected.findFirst({
    where: {
      wallet_address: wallet_address,
      map_id: searchParams.map_id,
    },
  });

  const map = await prisma.maps.findFirst({
    where: {
      slug,
    },
    include: {
      MapsPlaces: true,
      MapsCreator: true,
    },
  });

  if (!map) {
    notFound();
  }

  const creator = map.MapsCreator;

  const liked = await prisma.mapsLiked.findFirst({
    where: {
      wallet_address: map.wallet_address,
      map_id: map.map_id,
    },
  });

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

  return (
    <div className="mt-8 max-w-7xl mx-auto mb-8 p-2 md:p-0">
      <section className="flex justify-between">
        <div>
          <h1 className="text-4xl">{map?.name}</h1>
          <OSFont
            as="h2"
            defaultFont="lexend"
            className="text-xl mt-2 font-light tracking-normal"
          >
            {map?.description}
          </OSFont>

          <div className="flex gap-2 items-center mt-6">
            <Image
              src={creator?.profile_image ?? "https://i.imgur.com/yZOyUGG.png"}
              alt={creator?.name ?? ""}
              height={28}
              width={28}
              className="rounded-full h-7 w-7 object-cover"
            />
            <span className="text-sm">
              {creator.name ?? shortenAddress(map?.wallet_address ?? "")}
            </span>
          </div>

          <div
            className={`${lexend.className} mt-2 font-light tracking-normal`}
          >
            {creator?.creator_bio}
          </div>

          <div className="flex items-center space-x-5">
            <NFTCard
              key={map.map_id}
              eth_amount={map.eth_amount}
              userMinted={Number(map.total_minted ?? 0)}
              property_id={map.map_id!}
              token_id={map.token_id ? Number(map.token_id) : undefined}
              title={map.name}
              slug={map.slug}
              imgUrl={map.thumbnail ?? "https://via.placeholder.com/160"}
              emoji={map.map_emoji ?? ""}
              creator={{
                wallet: map.wallet_address,
                farcaster: {
                  imgUrl:
                    creator?.profile_image ?? "https://i.imgur.com/yZOyUGG.png",
                  name: creator?.name ?? "",
                },
              }}
              hideCard
              hide_view_btn
              buttonClassName="bg-[#5844C1] text-white mt-3 px-10 py-2 text-lg"
              mintButtonText="Mint Map"
            />

            <EditMapButton
              map_id={map.map_id}
              wallet_address={map.wallet_address}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <LikeMap map_id={map.map_id} liked={liked ? true : false} />

          <ShareMap slug={map.slug} />
        </div>
      </section>

      {map.eth_amount && !minted && map.wallet_address !== wallet_address ? (
        <>
          <p className="text-center my-32 text-xl">
            Mint this map to get access to all the places listed on this map.
          </p>
        </>
      ) : (
        <section className="mt-8 md:flex gap-x-5 relative">
          <div className="flex-1 flex flex-col gap-y-5 w-[150px] h-[670px] overflow-scroll">
            {mapPlaces.map((place, i) => (
              <PlaceCard
                property_id={place.property_id}
                name={
                  place.Locations?.location
                    ? `${i + 1}. ${place.Locations?.location}`
                    : ""
                }
                key={place.property_id}
                image={
                  place.Locations?.image ?? "https://via.placeholder.com/160"
                }
                rating={place.Locations?.rating ?? 0}
                category={place.Locations?.category ?? ""}
                wallet_address={map.wallet_address}
                map_url={place?.Locations?.map_url ?? ""}
                placeDescription={map?.MapsPlaces[i].description}
              />
            ))}
          </div>

          <div className="flex-[2] min-h-96 sticky">
            <AppleMap token={mapToken} coordinatesArray={mapCoordinates} />
          </div>
        </section>
      )}
    </div>
  );
};

export default MapDetailsPage;
