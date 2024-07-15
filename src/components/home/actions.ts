"use server";

import {
  excludedCategories,
  getFormattedPlaceDetails,
  getPlaceDetailsFromPlaceId,
  getPlaceTypeFromAddressComponents,
} from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { DOMAIN } from "@/config";
import jwt from "jsonwebtoken";
import { unstable_cache } from "next/cache";
import urlMetadata from "url-metadata";

const mapsTokenCache = unstable_cache(
  async (teamId: string, keyId: string, privateKey: string, domain: string) => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + 15778800; // 6 months
    const payload = {
      iss: teamId,
      iat: now,
      exp: exp,
      origin:
        process.env.NODE_ENV === "development"
          ? "*"
          : domain.includes("checkincaster")
          ? "*.checkincaster.xyz"
          : "*.checkin.gg",
    };
    const token = jwt.sign(payload, privateKey, {
      algorithm: "ES256",
      keyid: keyId,
    });
    return token;
  },
  ["maps-token-cache"],
  {
    revalidate: 15778000,
  }
);

async function getMapsToken() {
  const teamId = process.env.APPLE_MAPS_TEAM_ID;
  const mapsKeyId = process.env.APPLE_MAPS_KEY_ID;
  const privateKey = process.env.APPLE_MAPS_PRIVATE_KEY;

  if (!teamId || !mapsKeyId || !privateKey)
    throw new Error("Missing Apple Maps credentials");

  const token = await mapsTokenCache(teamId, mapsKeyId, privateKey, DOMAIN);

  return token;
}

async function getPlaceDetails(placeId: string) {
  let propertyRecord = await prisma.propertyInfo.findFirst({
    where: {
      Locations: {
        place_id: placeId,
      },
    },
    include: {
      Locations: true,
    },
  });

  let locationRecord = propertyRecord
    ? propertyRecord.Locations
    : await prisma.locations.findFirst({
        where: { place_id: placeId },
      });

  // if location record exists, check if it's excluded
  if (locationRecord) {
    let isExcluded = false;

    for (const excludedCategory of excludedCategories) {
      if (
        locationRecord.category?.toLowerCase() ===
        excludedCategory.toLowerCase()
      )
        isExcluded = true;
    }

    if (isExcluded)
      return {
        Locations: locationRecord,
        excluded: true,
        property_id: "",
        token_id: null,
        score: null,
        location_info: null,
        country: null,
        ratings: null,
        location_id: null,
        total_minted: null,
        reviews: null,
      };
  }

  let addressComponents = undefined;
  let types = undefined;

  // if location record doesn't exist or address is missing, fetch details from placeId. Also store the address components for later
  if (!locationRecord || !locationRecord.address) {
    const placeDetails = await getPlaceDetailsFromPlaceId(placeId);
    if (!placeDetails) return null;

    addressComponents = placeDetails.addressComponents;
    types = placeDetails.types;

    const mapUrl = `https://www.google.com/maps/search/?api=1&query_place_id=${placeId}&query=${encodeURIComponent(
      placeDetails.formattedAddress ?? ""
    )}`;
    const metadata = await urlMetadata(mapUrl);
    const resolvedUrl = metadata.url ?? mapUrl;

    const coordinates = {
      lat: placeDetails.location.latitude,
      lng: placeDetails.location.longitude,
    };
    const { location, city, country, category, rating } =
      getFormattedPlaceDetails({
        metadataTitle: metadata["og:title"],
        adrAddress: placeDetails.adrFormatAddress || "",
        metadataDescription: metadata["og:description"],
        types: placeDetails.types || [],
      });

    if (!locationRecord) {
      locationRecord = await prisma.locations.create({
        data: {
          map_url: resolvedUrl,
          coordinates: coordinates || undefined,
          place_id: placeId,
          location,
          city,
          country,
          image: metadata["og:image"],
          category,
          rating,
          address: placeDetails.formattedAddress,
        },
      });
    } else {
      locationRecord = await prisma.locations.update({
        where: { place_id: placeId },
        data: {
          map_url: resolvedUrl,
          coordinates: coordinates || undefined,
          location,
          city,
          country,
          image: metadata["og:image"],
          category,
          rating,
          address: placeDetails.formattedAddress,
        },
      });
    }

    // check if location record is excluded for the newly created location
    let isExcluded = false;

    for (const excludedCategory of excludedCategories) {
      if (
        locationRecord.category?.toLowerCase() ===
        excludedCategory.toLowerCase()
      )
        isExcluded = true;
    }

    if (isExcluded)
      return {
        Locations: locationRecord,
        excluded: true,
        property_id: "",
        token_id: null,
        score: null,
        location_info: null,
        country: null,
        ratings: null,
        location_id: null,
        total_minted: null,
        reviews: null,
      };
  }

  // if property record doesn't exist, create one or update the type if it already exists
  if (!propertyRecord || !propertyRecord.type) {
    // if we don't have address components, fetch details from placeId
    if (!addressComponents || !types) {
      const placeDetails = await getPlaceDetailsFromPlaceId(placeId);
      if (!placeDetails) return null;

      addressComponents = placeDetails.addressComponents;
      types = placeDetails.types;
    }

    const propertyType = getPlaceTypeFromAddressComponents(
      locationRecord.location ?? "",
      addressComponents,
      [locationRecord.category as string, ...types]
    );

    if (!propertyRecord) {
      propertyRecord = await prisma.propertyInfo.create({
        data: {
          country: locationRecord.country,
          location_info: locationRecord.location,
          ratings: locationRecord.rating,
          type: propertyType,
          Locations: {
            connect: {
              location_id: locationRecord.location_id,
            },
          },
        },
        include: {
          Locations: true,
        },
      });
    } else {
      propertyRecord = await prisma.propertyInfo.update({
        where: { property_id: propertyRecord.property_id },
        data: {
          type: propertyType,
        },
        include: {
          Locations: true,
        },
      });
    }
  }

  return {
    ...propertyRecord,
    excluded: false,
  };
}

const getUserProperties = async (wallet_address: string) => {
  const propertyCounts = await prisma.propertySales.groupBy({
    by: ["property_id"],
    where: {
      wallet_address: wallet_address.toLowerCase(),
    },
    _sum: {
      quantity: true,
    },
  });

  const propertyDetails = await prisma.propertySales.findMany({
    where: {
      wallet_address: wallet_address.toLowerCase(),
    },
    select: {
      property_id: true,
      PropertyInfo: {
        include: {
          Locations: true,
        },
      },
    },
  });

  let userPropertyCount = 0;
  let propertyScore = 0;

  const userProperties = propertyCounts.map((count) => {
    const details = propertyDetails.find(
      (detail) => detail.property_id === count.property_id
    );

    if (count._sum.quantity) {
      userPropertyCount += count._sum.quantity;
      propertyScore +=
        count._sum.quantity * Number(details?.PropertyInfo?.score ?? 0);
    }

    return {
      property_id: count.property_id,
      count: count._sum.quantity,
      PropertyInfo: details ? details.PropertyInfo : null,
    };
  });

  return userProperties;
};

export { getMapsToken, getPlaceDetails, getUserProperties };
