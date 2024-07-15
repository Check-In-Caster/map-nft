"use client";

import { Locations, PropertyInfo } from "@prisma/client";
import NFTCard from "./nft-card";

const PropertyModal = ({
  property,
  referral = "",
}: {
  property?: (PropertyInfo & { Locations: Partial<Locations> }) | null;
  referral?: string;
}) => {
  if (!property) return null;

  return (
    <>
      <NFTCard
        hideCard
        referral={referral}
        defaultOpen
        disableOutsideInteraction
        property_id={property.property_id}
        token_id={property.token_id ?? undefined}
        title={property?.Locations.location ?? ""}
        location={property?.country ?? ""}
        score={property?.score ? Number(property?.score) : 0}
        rating={property?.Locations.rating ?? 0}
        ratingCount={property?.ratings ? Number(property?.ratings) : 0}
        buttonText="Mint"
        imgUrl={property?.Locations.image ?? ""}
        flipBackDetails={{
          country: property?.Locations.country ?? "",
          type: property?.Locations.category ?? "",
          address: property?.Locations.location ?? "",
          code: "",
          coordinates: `{${
            (
              property?.Locations.coordinates as {
                lat: string;
              }
            ).lat
          } , ${
            (
              property?.Locations.coordinates as {
                lng: string;
              }
            ).lng
          }}`,
          id: "",
          edition: `${property?.total_minted ?? "0"}/1000`,
        }}
        buttonClassName={"bg-[#000] text-[#fff]"}
      />
    </>
  );
};

export default PropertyModal;
