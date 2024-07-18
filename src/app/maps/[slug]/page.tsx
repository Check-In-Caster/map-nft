import { Heart, Share } from "lucide-react";
import Image from "next/image";
import { Lexend } from "next/font/google";
import { shortenAddress } from "@/lib/utils";
import { getMapsToken } from "@/components/home/actions";
import AppleMap from "@/components/home/map";

const lexend = Lexend({
  subsets: ["latin"],
});

const mapData = {
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
  description:
    "I just consolidated my favorite ramen restaurants in Tokyo, from affordable to expensive",
};

const PlaceCard = ({
  name,
  image,
  rating,
  reviews,
  category,
  placeDescription,
}: {
  name: string;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  placeDescription: React.ReactNode;
}) => {
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
            ({reviews})
          </div>
          <div className="font-light">{category}</div>
          <div className="font-thin">{placeDescription}</div>
          <button className="bg-white border border-[#5844C1] mt-3 py-1.5">
            Mint
          </button>
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
  const mapToken = await getMapsToken();

  return (
    <div className="mt-8 max-w-7xl mx-auto mb-8 p-2 md:p-0">
      <section className="flex justify-between">
        <div>
          <h1 className="text-4xl">{mapData.name}</h1>
          <h2
            className={`text-xl mt-2 ${lexend.className} font-light tracking-normal`}
          >
            {mapData.description}
          </h2>

          <div className="flex gap-2 items-center mt-3">
            <Image
              src={
                mapData.creator.farcaster?.imgUrl ??
                "https://i.imgur.com/yZOyUGG.png"
              }
              alt={mapData.creator.farcaster?.name ?? ""}
              height={28}
              width={28}
              className="rounded-full h-7 w-7 object-cover"
            />
            <span className="text-sm">
              {mapData.creator.farcaster?.name ??
                shortenAddress(mapData.creator.wallet)}
            </span>
          </div>

          <button className="bg-[#5844C1] text-white mt-3 px-10 py-2 text-lg">
            Mint to Support
          </button>
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
          <PlaceCard
            name="Ramen Nagi"
            key={"1"}
            image="https://via.placeholder.com/160"
            rating={4.6}
            reviews={442}
            category="Ramen Restaurants"
            placeDescription={"Description here"}
          />
          <PlaceCard
            name="Ramen Nagi"
            key={"1"}
            image="https://via.placeholder.com/160"
            rating={4.6}
            reviews={442}
            category="Ramen Restaurants"
            placeDescription={"Description here"}
          />
          <PlaceCard
            name="Ramen Nagi"
            key={"1"}
            image="https://via.placeholder.com/160"
            rating={4.6}
            reviews={442}
            category="Ramen Restaurants"
            placeDescription={"Description here"}
          />
          <PlaceCard
            name="Ramen Nagi"
            key={"1"}
            image="https://via.placeholder.com/160"
            rating={4.6}
            reviews={442}
            category="Ramen Restaurants"
            placeDescription={"Description here"}
          />
        </div>

        <div className="flex-[2] min-h-96">
          <AppleMap token={mapToken} />
        </div>
      </section>
    </div>
  );
};

export default MapDetailsPage;