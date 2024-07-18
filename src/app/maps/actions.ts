"use server";

import { prisma } from "@/lib/prisma";

function generateSlug(name: string) {
  const slug = name
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading and trailing whitespace
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with a single hyphen

  const uniqueId = Date.now().toString(36).slice(-5); // Generate a unique ID (last 5 characters of base-36 timestamp)
  return `${slug}-${uniqueId}`;
}

export async function createMap({
  name,
  description,
  emoji,
  places,
}: {
  name: string;
  description: string;
  emoji: string;
  places: {
    property_id: string;
    description: string;
  }[];
}) {
  // [BUG] - Add owner wallet address

  const map = await prisma.maps.create({
    data: {
      name,
      description,
      slug: generateSlug(name),
      thumbnail: "",
      token_id: "",
      wallet_address: "",
      map_emoji: emoji,
      MapsPlaces: {
        createMany: {
          data: places.map(({ property_id, description }) => ({
            property_id,
            description,
          })),
        },
      },
    },
  });

  return {
    status: "success",
    message: "Map created successfully",
    slug: map.slug,
  };
}

export async function updateMap({
  map_id,
  name,
  description,
  emoji,
  places,
}: {
  map_id: string;
  name: string;
  description: string;
  emoji: string;
  places: {
    property_id: string;
    description: string;
  }[];
}) {
  // [BUG] - Check wallet address before updating
  try {
    const map = await prisma.maps.update({
      where: {
        map_id,
      },
      data: {
        name,
        description,
        map_emoji: emoji,
        // slug: generateSlug(name),
      },
    });

    await prisma.mapsPlaces.deleteMany({
      where: {
        map_id,
      },
    });

    await prisma.mapsPlaces.createMany({
      data: places.map(({ property_id, description }) => ({
        map_id,
        property_id,
        description,
      })),
    });

    return {
      status: "success",
      message: "Map updated successfully",
      slug: map.slug,
    };
  } catch (error) {
    console.error("Failed to update map:", error);
    return {
      status: "error",
      message: "Failed to update map",
    };
  }
}

export async function getLocationInfo(property_id: string) {
  console.log("property_id", property_id);
  const property = await prisma.propertyInfo.findFirst({
    where: {
      property_id,
    },
    include: {
      Locations: true,
    },
  });

  return property?.Locations;
}
