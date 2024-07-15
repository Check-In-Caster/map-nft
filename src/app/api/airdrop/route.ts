import {
  getFormattedPlaceDetails,
  getFullPlaceDetailsFromPlaceId,
  getPlaceTypeFromAddressComponents,
  getPoints,
} from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import urlMetadata from "url-metadata";
import { v4 as uuid } from "uuid";
import locationsJson from "./locations.json";

const getAutoCompleteSessionToken = unstable_cache(
  async () => {
    return uuid();
  },
  ["autocomplete-session-token"],
  {
    revalidate: 150, // 2.5 minutes
  }
);

const getAutoCompletePredictions = async (searchTerm: string) => {
  const sessionToken = await getAutoCompleteSessionToken();

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${searchTerm}&language=en&sessiontoken=${sessionToken}&key=${process.env.MAPS_API_KEY}`
  );

  const data =
    (await response.json()) as google.maps.places.AutocompleteResponse;
  return data;
};

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") notFound();

  // const locations = locationsJson;
  const locations = (
    JSON.parse(JSON.stringify(locationsJson)) as typeof locationsJson
  ).splice(0, 3); // for testing

  if (!req.url.includes("confirm")) {
    return NextResponse.json(
      {
        message: "-_-",
        url: req.url,
        locations: locations,
      },
      { status: 200 }
    );
  }

  const length = locations.length;
  let count = 1;
  let tokenId = 1;

  const skippedLocations: string[] = [];

  for (const location of locations) {
    const searchTerm =
      location["Location Name"] + " " + location.City + " " + location.Country;

    console.log(
      "Processing location (" + count++ + "/" + length + "): " + searchTerm
    );

    const searchResponse = await getAutoCompletePredictions(searchTerm);
    const placeId = searchResponse.predictions[0].place_id;

    const placeDetails = await getFullPlaceDetailsFromPlaceId(placeId);

    if (!placeDetails) continue;

    const mapUrl = `https://www.google.com/maps/search/?api=1&query_place_id=${placeId}&query=${encodeURIComponent(
      placeDetails.formattedAddress ?? ""
    )}`;
    const metadata = await urlMetadata(mapUrl);
    const resolvedUrl = metadata.url ?? mapUrl;
    const coordinates = {
      lat: placeDetails.location.latitude,
      lng: placeDetails.location.longitude,
    };
    const {
      location: locationName,
      city,
      country,
      category,
    } = getFormattedPlaceDetails({
      metadataTitle: metadata["og:title"],
      adrAddress: placeDetails.adrFormatAddress || "",
      metadataDescription: metadata["og:description"],
      types: placeDetails.types || [],
    });
    const { rating, userRatingCount } = placeDetails;
    const propertyType = getPlaceTypeFromAddressComponents(
      locationName,
      placeDetails.addressComponents,
      [category ?? "", ...placeDetails.types]
    );
    const score = getPoints(category ?? "", rating, userRatingCount);

    // skip if rating is zero or undefined
    if (!rating || rating === 0) {
      console.log("Skipping location: ", locationName);
      skippedLocations.push(locationName);
      continue;
    }

    const locationRecord = await prisma.locations.upsert({
      where: { place_id: placeId },
      create: {
        map_url: resolvedUrl,
        coordinates: coordinates || undefined,
        place_id: placeId,
        location: locationName,
        city,
        country,
        image: metadata["og:image"],
        category,
        rating,
        address: placeDetails.formattedAddress,
      },
      update: {
        map_url: resolvedUrl,
        coordinates: coordinates || undefined,
        location: locationName,
        city,
        country,
        image: metadata["og:image"],
        category,
        rating,
        address: placeDetails.formattedAddress,
      },
    });

    console.log(locationRecord);

    let propertyRecord = await prisma.propertyInfo.findFirst({
      where: {
        Locations: {
          place_id: placeId,
        },
      },
    });

    if (!propertyRecord) {
      propertyRecord = await prisma.propertyInfo.create({
        data: {
          country: country,
          location_info: locationName,
          score: score,
          ratings: rating,
          type: propertyType,
          token_id: tokenId++,
          Locations: {
            connect: {
              place_id: placeId,
            },
          },
        },
      });
    } else {
      propertyRecord = await prisma.propertyInfo.update({
        where: {
          property_id: propertyRecord.property_id,
        },
        data: {
          country: country,
          location_info: locationName,
          score: score,
          ratings: rating,
          type: propertyType,
          token_id: tokenId++,
        },
      });
    }
    console.log(propertyRecord);
  }

  return NextResponse.json({
    message: `Processed ${tokenId - 1} out of ${length} locations`,
    skippedLocations,
  });
}
