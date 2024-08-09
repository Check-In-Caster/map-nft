import { getMapsToken } from "@/components/home/actions";
import AppleMap from "@/components/home/map";
import NFTCard from "@/components/home/nft-card";
import OSFont from "@/components/home/os-font";
import { prisma } from "@/lib/prisma";
import { shortenAddress } from "@/lib/utils";
import { Lexend } from "next/font/google";
import Image from "next/image";

import { getServerSession } from "next-auth";
import Link from "next/link";
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
      <div className="flex flex-col items-center space-y-5 bg-white py-10 shadow-md">
        <a href={map_url} target="_BLANK" className="text-xl">
          <img
            src={image}
            alt="place"
            className="h-[220px] w-[220px] rounded"
          />
        </a>

        <div className="relative flex flex-1 flex-col space-y-2 text-center">
          <a href={map_url} target="_BLANK" className="text-xl">
            {name}
          </a>

          <div className="flex items-center justify-center text-center font-normal">
            {rating}
            <img
              src="/assets/icons/ratings.svg"
              alt=""
              className="inline pl-1 pr-4"
            />
          </div>
          <div className="text-center font-thin text-gray-500">{category}</div>
          <div className="my-4 w-[260px] text-center font-thin">
            {placeDescription ? `" ${placeDescription} "` : null}
          </div>
          <a
            href={propertyLink}
            target="_blank"
            className="mt-8 block border border-[#5844C1]  bg-white  py-1.5 text-center"
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

  const minted = await prisma.mapsCollected.findFirst({
    where: {
      wallet_address: wallet_address,
      map_id: map.map_id,
    },
  });

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
    mapPlaces.map((place) => [place.property_id, place]),
  );
  mapPlaces = [];
  for (const place of map.MapsPlaces) {
    if (mapPlacesMap.has(place.property_id)) {
      mapPlaces.push(
        mapPlacesMap.get(place.property_id) as (typeof mapPlaces)[number],
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
    <div className="mx-auto mb-8 mt-8 max-w-7xl p-2 md:p-0">
      <section className="flex justify-between">
        <div>
          <h1 className="text-4xl">{map?.name}</h1>
          <OSFont
            as="h2"
            defaultFont="lexend"
            className="mt-2 text-xl font-light tracking-normal"
          >
            {map?.description}
          </OSFont>

          <Link
            href={`/my-maps/${map.wallet_address}`}
            passHref
            className="mt-6 flex items-center gap-2"
          >
            <Image
              src={creator?.profile_image ?? "https://i.imgur.com/yZOyUGG.png"}
              alt={creator?.name ?? ""}
              height={28}
              width={28}
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="text-sm">
              {creator.name ?? shortenAddress(map?.wallet_address ?? "")}
            </span>
          </Link>

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
        <div className="flex flex-col items-start gap-4 md:flex-row">
          <LikeMap map_id={map.map_id} liked={liked ? true : false} />

          <ShareMap slug={map.slug} />
        </div>
      </section>

      {map.eth_amount && !minted && map.wallet_address !== wallet_address ? (
        <>
          <p className="my-20 text-center md:my-32 md:text-xl">
            Mint this map to get access to all the places listed on this map.
          </p>
        </>
      ) : (
        <section className="relative mt-8 gap-x-5 md:flex">
          <div className="flex h-[670px] flex-1 flex-col gap-y-5 overflow-scroll md:w-[150px]">
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

          <div className="sticky min-h-96 flex-[2]">
            <AppleMap token={mapToken} coordinatesArray={mapCoordinates} />
          </div>
        </section>
      )}
    </div>
  );
};

export default MapDetailsPage;
