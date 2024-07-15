"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import NFTCard from "./nft-card";
import EmptyLocationCard from "./empty-location-card";
import { Locations, PropertyInfo, PropertySales } from "@prisma/client";
import { getUserProperties } from "./actions";
import Heading from "../ui/heading";

const MyPortfolio = () => {
  const wallet = useAccount();
  const [userProperties, setUserProperties] = useState<
    (PropertySales & {
      count?: number;
      PropertyInfo?: PropertyInfo & { Locations: Locations };
    })[]
  >();

  useEffect(() => {
    if (!wallet.address) return;

    (async () => {
      if (!wallet.address) return;

      const properties = await getUserProperties(wallet.address);

      setUserProperties(properties as any);
    })();
  }, [wallet.address]);

  if (!userProperties || userProperties.length > 0) return null;

  return (
    <div className="my-8 max-w-7xl mx-auto">
      <Heading label="My Portfolio" />
      <div className="grid col-span-2 gap-1 md:grid-cols-4 md:gap-10 py-10">
        {userProperties.map((property) => (
          <NFTCard
            hide_mint_btn
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
              edition: `${property.PropertyInfo?.total_minted ?? "0"}/1000`,
            }}
            type={property.PropertyInfo?.type ?? ""}
            buttonClassName={"bg-[#000] text-[#fff]"}
          />
        ))}
        <EmptyLocationCard
          count={userProperties.length <= 4 ? 4 - userProperties.length : 0}
        />
      </div>
    </div>
  );
};

export default MyPortfolio;
