import { Maps, MapsCreator } from "@prisma/client";
import NFTCard from "./nft-card";

const TrendingMaps = ({
  maps,
}: {
  maps: ({ MapsCreator: MapsCreator } & Maps)[];
}) => {
  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        {maps?.map((map) => {
          return (
            <NFTCard
              key={map.map_id}
              property_id={map.map_id!}
              token_id={map.token_id ? Number(map.token_id) : undefined}
              title={map.name}
              slug={map.slug}
              imgUrl={map.thumbnail ?? undefined}
              userMinted={Number(map.total_minted ?? 0)}
              emoji={map.map_emoji ?? undefined}
              creator={{
                wallet: map.wallet_address,
                farcaster: {
                  imgUrl: map.MapsCreator?.profile_image ?? undefined,
                  name: map.MapsCreator?.name ?? undefined,
                },
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TrendingMaps;
