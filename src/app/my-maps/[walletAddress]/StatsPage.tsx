"use client";

import TrendingMaps from "@/components/home/trending-maps";
import Heading from "@/components/ui/heading";
import ShareRefLink from "@/components/ui/share-link";
import { shortenAddress } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { useAccount } from "wagmi";

const MyStats = ({
  profile,
  mapToken,
  walletAddress,
}: {
  checkInCount?: number;

  profile?: {
    profileName: string;
    profileBio: string;
    profileImage: string;
    profileHandle: string;
  };
  mapToken: string;
  walletAddress: string;
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
          <div className="py-4 text-center bg-white p-2 w-2/3 my-3 md:my-0 md:min-w-40 h-24">
            <p className="text-lg font-medium">Maps Created</p>
            <p className="text-3xl font-semibold mt-2">1</p>
          </div>
          <div className="py-4 text-center bg-white p-2 w-2/3 my-3 md:my-0 md:min-w-40 h-24">
            <p className="text-lg font-medium">Maps Collected</p>
            <p className="text-3xl font-semibold mt-2">2</p>
          </div>
          <div className="py-4 text-center bg-white p-2 w-2/3 my-3 md:my-0 md:min-w-40 h-24">
            <p className="text-lg font-medium">Checkins</p>
            <p className="text-3xl font-semibold mt-2">3</p>
          </div>
        </div>
      </div>
      <div>
        <div className="flex mt-20 justify-center items-center">
          <div className="ml-auto">
            <ShareRefLink wallet_address={walletAddress} />
          </div>
        </div>

        <div className="mt-8 max-w-7xl mx-auto mb-8 p-2 md:p-0">
          <Heading label="Maps Created" />
          <TrendingMaps />

          <Heading label="Maps Collected" />
          <TrendingMaps />

          <Heading label="Maps Liked" />
          <TrendingMaps />
        </div>
      </div>
    </div>
  );
};

export default MyStats;
