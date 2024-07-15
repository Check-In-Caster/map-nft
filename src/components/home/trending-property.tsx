import { Properties } from "@/types/property";
import NFTCard from "./nft-card";

const TrendingProperty = ({ properties }: { properties?: Properties }) => {
  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        {properties?.map((property) => {
          return (
            <NFTCard
              key={property.property_id}
              property_id={property.property_id!}
              token_id={property.token_id!}
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
          );
        })}
      </div>
    </div>
  );
};

export default TrendingProperty;
