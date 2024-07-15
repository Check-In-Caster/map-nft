"use client";

import EmptyLocationCard from "@/components/home/empty-location-card";
import AppleMap from "@/components/home/map";
import NFTCard from "@/components/home/nft-card";
import Heading from "@/components/ui/heading";
import ShareRefLink from "@/components/ui/share-link";
import { formatNumberWithCommas, shortenAddress } from "@/lib/utils";
import { Locations, PropertyInfo, PropertySales } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { useAccount } from "wagmi";

const MyStats = ({
  userProperties,
  profile,
  checkInCount,
  mapToken,
  stats,
  walletAddress,
}: {
  checkInCount?: number;
  userProperties: (PropertySales & {
    count?: number;
    PropertyInfo?: PropertyInfo & { Locations: Locations };
  })[];
  profile?: {
    profileName: string;
    profileBio: string;
    profileImage: string;
    profileHandle: string;
  };
  mapToken: string;
  walletAddress: string;
  stats: { propery_count: number; propertyScore: number };
}) => {
  const wallet = useAccount();
  const [active, setActive] = useState("Properties");

  // useEffect(() => {
  //   (async () => {
  //     // where.collectionAddresses
  //     const API_ENDPOINT = process.env.API_ENDPOINT;

  //     const zdk = new ZDK({
  //       endpoint: API_ENDPOINT,
  //       networks: [
  //         {
  //           chain: ZDKChain.Mainnet,
  //           network: ZDKNetwork.Ethereum,
  //         },
  //       ],
  //       apiKey: "", // optional!
  //     });

  //     const response = await zdk.tokens({
  //       where: {
  //         collectionAddresses: ["0x224B2491F28F4a6Bde6b515b2371136FE38F5ba2"],
  //         ownerAddresses: [walletAddress],
  //       },
  //     });

  //     console.log(response);
  //   })();
  // }, []);

  return (
    <div className="mt-8 w-full max-w-7xl mx-auto mb-8">
      <Heading label="My Portfolio" />
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center">
          <Image
            src={profile?.profileImage ?? "https://i.imgur.com/yZOyUGG.png"}
            alt=""
            height={160}
            width={160}
            className="rounded-full h-40 w-40 mr-5 object-cover"
          />
          <div>
            <h2 className="font-bold text-4xl">{profile?.profileName}</h2>
            <p className="text-3xl font-light text-gray-500">
              {profile?.profileHandle
                ? `@${profile?.profileHandle}`
                : shortenAddress(walletAddress)}
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between min-w-[500px] my-10 md:my-0">
          <div className="border border-gray-900 p-2 py-1 w-2/3 my-3 md:my-0 md:min-w-40 h-40">
            <p className="text-lg font-medium">Properties</p>
            <p className="text-3xl font-semibold mt-14">
              {stats.propery_count}
            </p>
          </div>
          <div className="border border-gray-900 p-2 py-1 w-2/3 my-3 md:my-0 md:min-w-40 h-40">
            <p className="text-lg font-medium">Property Score</p>
            <p className="text-3xl font-semibold mt-14">
              {stats.propertyScore
                ? formatNumberWithCommas(stats.propertyScore)
                : 0}
            </p>
          </div>
          <div className="border border-gray-900 p-2 py-1 w-2/3 my-3 md:my-0 md:min-w-40 h-40">
            <p className="text-lg font-medium">Checkins</p>
            <p className="text-3xl font-semibold mt-14">{checkInCount}</p>
          </div>
        </div>
      </div>
      <div>
        <div className="flex mt-20 justify-center items-center">
          <div className="ml-auto">
            <ShareRefLink wallet_address={walletAddress} />
          </div>
        </div>
        {userProperties.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-2xl font-semibold">No properties found</p>
            <p className="text-lg font-light mt-5">
              You haven{`'`}t minted any properties yet
            </p>

            {wallet.address?.toLocaleLowerCase() ===
            walletAddress.toLocaleLowerCase() ? (
              <div className="grid col-span-2 gap-1 md:grid-cols-4 md:gap-10 py-10">
                <EmptyLocationCard count={8} />
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <div className="grid col-span-2 gap-1 md:grid-cols-4 md:gap-10 py-10">
              {userProperties.map((property) => (
                <NFTCard
                  hide_mint_btn={
                    wallet.address?.toLocaleLowerCase() ===
                    walletAddress.toLocaleLowerCase()
                  }
                  key={property.sale_id}
                  property_id={property.property_id!}
                  token_id={property.PropertyInfo?.token_id ?? undefined}
                  userMinted={property.count ?? 0}
                  title={property.PropertyInfo?.Locations.location ?? ""}
                  location={property.PropertyInfo?.country ?? ""}
                  score={
                    property.PropertyInfo?.score
                      ? Number(property.PropertyInfo?.score)
                      : 0
                  }
                  rating={property.PropertyInfo?.Locations.rating ?? 0}
                  ratingCount={
                    property.PropertyInfo?.ratings
                      ? Number(property.PropertyInfo?.ratings)
                      : 0
                  }
                  buttonText="Mint"
                  imgUrl={property?.PropertyInfo?.Locations.image ?? ""}
                  flipBackDetails={{
                    country: property?.PropertyInfo?.Locations.country ?? "",
                    type: property?.PropertyInfo?.Locations.category ?? "",
                    address: property?.PropertyInfo?.Locations.location ?? "",
                    code: "",
                    coordinates: `{${
                      (
                        property?.PropertyInfo?.Locations.coordinates as {
                          lat: string;
                        }
                      ).lat
                    } , ${
                      (
                        property?.PropertyInfo?.Locations.coordinates as {
                          lng: string;
                        }
                      ).lng
                    }}`,
                    id: "",
                    edition: `${
                      property.PropertyInfo?.total_minted ?? "0"
                    }/1000`,
                  }}
                  type={property.PropertyInfo?.type ?? ""}
                  buttonClassName={"bg-[#000] text-[#fff]"}
                />
              ))}
              {wallet.address?.toLocaleLowerCase() ===
              walletAddress.toLocaleLowerCase() ? (
                <EmptyLocationCard count={4} />
              ) : null}
            </div>

            <div className="grid place-items-center">
              <>
                <a
                  href="/"
                  className={`border border-gray-900 py-2 px-6 disabled:opacity-50 ${"bg-[#EF9854] text-[#000]"}`}
                >
                  Collect More
                </a>
              </>
            </div>

            <div className="pb-10 pt-5 h-[800px]">
              <AppleMap
                token={mapToken}
                coordinatesArray={userProperties
                  .map((property) => {
                    const coordinates = property.PropertyInfo?.Locations
                      .coordinates as { lat: number; lng: number } | undefined;
                    if (coordinates)
                      return {
                        lat: coordinates.lat,
                        lng: coordinates.lng,
                      };
                  })
                  .filter((c): c is { lat: number; lng: number } => !!c)}
              />
            </div>
          </>
        )}
      </div>
      {/* <div className="text-center my-10 mb-20">
        <button className="bg-[#EF9854] text-[#000] border border-gray-900 py-2 px-5">
          Claim Property Airdrop 🎁
        </button>
      </div> */}
    </div>
  );
};

export default MyStats;
