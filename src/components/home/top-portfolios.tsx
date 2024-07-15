import NFTCard from "./nft-card";
import { Locations, Prisma, PropertyInfo } from "@prisma/client";
import Heading from "../ui/heading";
import { UserRank } from "@/types/leaderboard";
import { prisma } from "@/lib/prisma";
import { getFarcasterProfileFromAddresses } from "@/lib/airstack";
import Image from "next/image";
import Link from "next/link";
import { unstable_cache } from "next/cache";

const getTopPortfolios = unstable_cache(
  async () => {
    const userRank: UserRank[] =
      await prisma.$queryRaw(Prisma.sql`WITH WalletScores AS (
    SELECT
      ps.wallet_address,
      COALESCE(SUM(ps.quantity), 0) AS properties_purchased,
      COALESCE(SUM(pi.score * ps.quantity), 0) AS total_score
    FROM
      "PropertySales" ps
    LEFT JOIN "PropertyInfo" pi ON ps.property_id = pi.property_id
    GROUP BY
      ps.wallet_address ORDER BY properties_purchased DESC LIMIT 4
    ),
    RankedWallets AS (
      SELECT
        wallet_address,
        properties_purchased,
        total_score,
        RANK() OVER (ORDER BY total_score DESC) AS rank
      FROM
        WalletScores
    )
    SELECT
      rank,
      wallet_address,
      properties_purchased,
      total_score
    FROM
      RankedWallets ORDER BY
        rank;
`);

    const walletAddresses = userRank.map((user) => user.wallet_address);
    const usersProperties = await prisma.propertySales.findMany({
      where: { wallet_address: { in: walletAddresses, mode: "insensitive" } },
      select: {
        wallet_address: true,
        quantity: true,
        PropertyInfo: {
          include: {
            Locations: true,
          },
        },
      },
    });

    const usersMostValuablePropertiesMap = new Map<
      string,
      (PropertyInfo & { Locations: Locations | null; count: number }) | null
    >();

    for (const property of usersProperties) {
      const score = property.PropertyInfo?.score?.toNumber() ?? 0;

      if (!usersMostValuablePropertiesMap.has(property.wallet_address)) {
        usersMostValuablePropertiesMap.set(property.wallet_address, {
          count: property.quantity ?? 0,
          ...property.PropertyInfo,
        } as PropertyInfo & { Locations: Locations | null; count: number });
      } else {
        const currentScore =
          usersMostValuablePropertiesMap
            .get(property.wallet_address)
            ?.score?.toNumber() ?? 0;
        if (score > currentScore) {
          usersMostValuablePropertiesMap.set(property.wallet_address, {
            count: property.quantity ?? 0,
            ...property.PropertyInfo,
          } as PropertyInfo & { Locations: Locations | null; count: number });
        }
      }
    }

    const farcasterProfileMap = await getFarcasterProfileFromAddresses(
      walletAddresses
    );

    const data: [
      string,
      {
        propertyCount: number;
        valueableProperty:
          | (PropertyInfo & { Locations: Locations | null; count: number })
          | null;
        profileName: string;
        profileImage: string;
      }
    ][] = [];

    for (const user of userRank) {
      data.push([
        user.wallet_address,
        {
          propertyCount: Number(user.properties_purchased),
          valueableProperty: usersMostValuablePropertiesMap.get(
            user.wallet_address
          ) as
            | (PropertyInfo & { Locations: Locations | null; count: number })
            | null,
          profileName:
            farcasterProfileMap?.get(user.wallet_address)?.profileName ?? "",
          profileImage:
            farcasterProfileMap?.get(user.wallet_address)?.profileImage ?? "",
        },
      ]);
    }

    return data;
  },
  ["top-portfolios-cache"],
  {
    revalidate: 5 * 60,
  }
);

const TopPortfolios = async () => {
  const data = await getTopPortfolios();

  return (
    <div className="my-8 max-w-7xl mx-auto">
      <Heading label="Top Portfolios" />
      <div className="grid col-span-2 sm:grid-cols-2 lg:grid-cols-4 md:gap-x-10 gap-y-10">
        {data.map((userData, i) => {
          const walletAddress = userData[0];
          const user = userData[1];

          return (
            <div
              key={user.profileName}
              className="flex flex-col items-center justify-center"
            >
              <Link
                href={`/stats/${walletAddress}`}
                className="flex flex-col items-center justify-center"
              >
                <Image
                  src={user.profileImage ?? "https://i.imgur.com/yZOyUGG.png"}
                  alt=""
                  height={120}
                  width={120}
                  className="rounded-full h-[120px] w-[120px] object-cover"
                />
                <div className="mt-2 mb-3">{user.profileName}</div>
              </Link>

              <div className="flex-1 w-full">
                <NFTCard
                  hide_mint_btn
                  key={user.profileName + "property"}
                  property_id={user.valueableProperty?.property_id!}
                  token_id={user.valueableProperty?.token_id ?? undefined}
                  userMinted={user.valueableProperty?.count ?? 0}
                  title={user.valueableProperty?.Locations?.location ?? ""}
                  location={user.valueableProperty?.country ?? ""}
                  score={
                    user.valueableProperty?.score
                      ? Number(user.valueableProperty.score)
                      : 0
                  }
                  rating={user.valueableProperty?.Locations?.rating ?? 0}
                  ratingCount={
                    user.valueableProperty?.ratings
                      ? Number(user.valueableProperty.ratings)
                      : 0
                  }
                  buttonText="Mint"
                  imgUrl={user.valueableProperty?.Locations?.image ?? ""}
                  flipBackDetails={{
                    country: user.valueableProperty?.Locations?.country ?? "",
                    type: user.valueableProperty?.Locations?.category ?? "",
                    address: user.valueableProperty?.Locations?.location ?? "",
                    code: "",
                    coordinates: `{${
                      (
                        user.valueableProperty?.Locations?.coordinates as {
                          lat: string;
                        }
                      ).lat
                    } , ${
                      (
                        user.valueableProperty?.Locations?.coordinates as {
                          lng: string;
                        }
                      ).lng
                    }}`,
                    id: "",
                    edition: `${
                      user.valueableProperty?.total_minted ?? "0"
                    }/1000`,
                  }}
                  type={user.valueableProperty?.type ?? ""}
                  buttonClassName={"bg-[#000] text-[#fff]"}
                />
              </div>

              <div className="mt-2 text-lg">
                + {user.propertyCount - 1} properties
              </div>

              <Link
                href={`/stats/${walletAddress}`}
                className="mt-3 bg-[#000] max-w-[320px] text-[#fff] border border-gray-900 py-2 px-5 w-full text-center"
              >
                See More
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopPortfolios;
