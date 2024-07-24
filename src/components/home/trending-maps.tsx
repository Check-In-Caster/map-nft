import { Maps } from "@prisma/client";
import NFTCard from "./nft-card";

const TrendingMaps = ({ maps }: { maps: Maps[] }) => {
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
              emoji={map.map_emoji ?? undefined}
              creator={{
                wallet: map.wallet_address,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TrendingMaps;
