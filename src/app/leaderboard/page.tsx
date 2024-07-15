import { prisma } from "@/lib/prisma";
import { CountryRank, PropertyRank, UserRank } from "@/types/leaderboard";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { unstable_cache } from "next/cache";
import Leaderboard from "./Leaderboard";

const getData = unstable_cache(
  async (walletAddress: string) => {
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
      ps.wallet_address ORDER BY properties_purchased DESC LIMIT 25
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

    const userProfileRank: UserRank[] | null = walletAddress
      ? await prisma.$queryRaw(Prisma.sql`WITH WalletScores AS (
      SELECT
        ps.wallet_address,
        COALESCE(SUM(ps.quantity), 0) AS properties_purchased,
        COALESCE(SUM(pi.score * ps.quantity), 0) AS total_score
      FROM
        "PropertySales" ps
      LEFT JOIN "PropertyInfo" pi ON ps.property_id = pi.property_id
      GROUP BY
        ps.wallet_address ORDER BY properties_purchased DESC LIMIT 25
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
      RankedWallets
    WHERE
      wallet_address = '${Prisma.raw(walletAddress)}'
    ORDER BY
      rank LIMIT 25;`)
      : null;

    const countryRank: CountryRank[] =
      await prisma.$queryRaw(Prisma.sql`WITH PropertySalesByCountry AS (
  SELECT
    pi.country,
    COALESCE(SUM(ps.quantity), 0) AS properties_sold
  FROM
    "PropertySales" ps
  LEFT JOIN "PropertyInfo" pi ON ps.property_id = pi.property_id
  GROUP BY
    pi.country
  ORDER BY properties_sold DESC LIMIT 25
),
RankedCountries AS (
  SELECT
    country,
    properties_sold,
    RANK() OVER (ORDER BY properties_sold DESC) AS rank
  FROM
    PropertySalesByCountry LIMIT 25
)
SELECT
  rank,
  country,
  properties_sold
FROM
  RankedCountries
ORDER BY
  rank LIMIT 25;`);

    const propertyRank: PropertyRank[] =
      await prisma.$queryRaw(Prisma.sql`WITH PropertySalesByProperty AS (
SELECT
  pi.location_info,
  COALESCE(SUM(ps.quantity), 0) AS properties_sold
FROM
  "PropertySales" ps
LEFT JOIN "PropertyInfo" pi ON ps.property_id = pi.property_id
GROUP BY
  pi.location_info
),
RankedCountries AS (
SELECT
  location_info,
  properties_sold,
  RANK() OVER (ORDER BY properties_sold DESC) AS rank
FROM
  PropertySalesByProperty LIMIT 25
)
SELECT
rank,
location_info,
properties_sold
FROM
RankedCountries
ORDER BY
rank LIMIT 25;`);

    return JSON.stringify(
      {
        userRank,
        countryRank,
        userProfileRank,
        propertyRank,
      },
      (key, value) => (typeof value === "bigint" ? value.toString() : value)
    );
  },
  ["leaderboard-cache"],
  {
    revalidate: 5 * 60,
  }
);

const LeaderboardPage = async () => {
  const session = await getServerSession();
  const walletAddress = session?.user?.name ?? "";

  const data = JSON.parse(await getData(walletAddress.toLocaleLowerCase()));

  return <Leaderboard data={data} />;
};

export default LeaderboardPage;
