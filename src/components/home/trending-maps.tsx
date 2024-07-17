import { Properties } from "@/types/property";
import NFTCard from "./nft-card";

const maps = [
  {
    map_id: "1",
    name: "Top 10 Ramen in Tokyo",
    slug: "top-10-ramen-in-tokyo",
    creator: {
      wallet: "0x13F37fE246C8a927B339E6c095AFbda275709100",
      farcaster: {
        name: "yuki",
        imgUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/ba776434-7fd2-4038-34be-f17e94546300/original",
      },
    },
    map_emoji: "🍜",
  },
  {
    map_id: "2",
    name: "Top 10 Sushi in Tokyo",
    slug: "top-10-sushi-in-tokyo",
    creator: {
      wallet: "0x13F37fE246C8a927B339E6c095AFbda275709100",
      farcaster: {
        name: "yuki",
        imgUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/ba776434-7fd2-4038-34be-f17e94546300/original",
      },
    },
    thumbnail: "/assets/images/temp/top-ten-sushi.png",
  },
  {
    map_id: "3",
    name: "Top 10 Ramen in Tokyo",
    slug: "top-10-ramen-in-tokyo",
    creator: {
      wallet: "0x13F37fE246C8a927B339E6c095AFbda275709100",
      farcaster: {
        name: "yuki",
        imgUrl:
          "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/ba776434-7fd2-4038-34be-f17e94546300/original",
      },
    },
    map_emoji: "🍜",
  },
  {
    map_id: "4",
    name: "Top 10 Ramen in Tokyo",
    slug: "top-10-ramen-in-tokyo",
    creator: {
      wallet: "0x13F37fE246C8a927B339E6c095AFbda275709100",
    },
    map_emoji: "🍜",
  },
];

const TrendingMaps = () => {
  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        {maps?.map((map) => {
          return (
            <NFTCard
              key={map.map_id}
              property_id={map.map_id!}
              token_id={undefined}
              title={map.name}
              slug={map.slug}
              imgUrl={map.thumbnail}
              emoji={map.map_emoji}
              creator={map.creator}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TrendingMaps;
