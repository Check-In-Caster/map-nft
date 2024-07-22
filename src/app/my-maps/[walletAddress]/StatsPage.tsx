"use client";

import NFTCard from "@/components/home/nft-card";
import Heading from "@/components/ui/heading";
import ShareRefLink from "@/components/ui/share-link";
import { shortenAddress } from "@/lib/utils";
import { Maps, MapsCollected, MapsLiked } from "@prisma/client";
import Image from "next/image";
import { useAccount } from "wagmi";

const MyStats = ({
  profile,
  stats,
  checkInCount,
  walletAddress,
  maps,
}: {
  checkInCount?: number;

  maps?: {
    created: Maps[];
    liked: { map: Maps & MapsCollected }[];
    collected: { map: Maps & MapsLiked }[];
  };

  profile?: {
    profileName: string;
    profileBio: string;
    profileImage: string;
    profileHandle: string;
  };
  stats?: {
    maps_created: string;
    maps_collected: string;
  };
  walletAddress: string;
}) => {
  const wallet = useAccount();

  return (
    <div className="mt-8 w-full max-w-7xl mx-auto mb-8">
      <Heading label="My Maps" />
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
        <div className="flex flex-col md:flex-row space-x-5 items-center justify-between min-w-[500px] my-10 md:my-0">
          <div className="py-4 text-center bg-white p-2 w-full md:w-2/3 my-3 md:my-0 md:min-w-40 h-24">
            <p className="text-lg font-medium">Maps Created</p>
            <p className="text-3xl font-semibold mt-2">{stats?.maps_created}</p>
          </div>
          <div className="py-4 text-center bg-white p-2 w-full md:w-2/3 my-3 md:my-0 md:min-w-40 h-24">
            <p className="text-lg font-medium">Maps Collected</p>
            <p className="text-3xl font-semibold mt-2">
              {stats?.maps_collected}
            </p>
          </div>
          <div className="py-4 text-center bg-white p-2 w-full md:w-2/3 my-3 md:my-0 md:min-w-40 h-24">
            <p className="text-lg font-medium">Checkins</p>
            <p className="text-3xl font-semibold mt-2">{checkInCount}</p>
          </div>
        </div>
      </div>
      <div>
        <div className="flex md:mt-20 justify-center items-center">
          <div className="ml-auto">
            <ShareRefLink wallet_address={walletAddress} />
          </div>
        </div>

        <div className="mt-8 max-w-7xl mx-auto mb-8 p-2 md:p-0">
          <Heading label="Maps Created" />

          {maps?.created.length === 0 && (
            <div className="flex items-center justify-center mt-10">
              <p className="text-xl font-semibold text-gray-500">
                No Maps Created
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {maps?.created.map((map) => {
              return (
                <NFTCard
                  key={map.map_id}
                  property_id={map.map_id!}
                  token_id={map.token_id ? Number(map.token_id) : undefined}
                  title={map.name}
                  slug={map.slug}
                  imgUrl={map.thumbnail ?? undefined}
                  emoji={map.map_emoji ?? undefined}
                  creator={{
                    wallet: map.wallet_address,
                  }}
                />
              );
            })}
          </div>

          <Heading label="Maps Collected" />

          {maps?.created.length === 0 && (
            <div className="flex items-center justify-center mt-10">
              <p className="text-xl font-semibold text-gray-500">
                No Maps Collected
              </p>
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {maps?.collected.map((collected) => {
              return (
                <NFTCard
                  key={collected.map.map_id}
                  property_id={collected.map.map_id!}
                  token_id={
                    collected.map.token_id
                      ? Number(collected.map.token_id)
                      : undefined
                  }
                  title={collected.map.name}
                  slug={collected.map.slug}
                  imgUrl={collected.map.thumbnail ?? undefined}
                  emoji={collected.map.map_emoji ?? undefined}
                  creator={{
                    wallet: collected.map.wallet_address,
                  }}
                />
              );
            })}
          </div>

          <Heading label="Maps Liked" />

          {maps?.liked.length === 0 && (
            <div className="flex items-center justify-center mt-10">
              <p className="text-xl font-semibold text-gray-500">
                No Maps Liked
              </p>
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {maps?.liked.map((like) => {
              return (
                <NFTCard
                  key={like.map.map_id}
                  property_id={like.map.map_id!}
                  token_id={
                    like.map.token_id ? Number(like.map.token_id) : undefined
                  }
                  title={like.map.name}
                  slug={like.map.slug}
                  imgUrl={like.map.thumbnail ?? undefined}
                  emoji={like.map.map_emoji ?? undefined}
                  creator={{
                    wallet: like.map.wallet_address,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyStats;
