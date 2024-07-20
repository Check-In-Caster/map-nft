"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
const AWS = require("aws-sdk");

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
  thumbnail,
  description,
  emoji,
  places,
  creator_bio,
}: {
  name: string;
  description: string;
  thumbnail: string;
  emoji: string;
  creator_bio: string;
  places: {
    property_id: string;
    description: string;
  }[];
}) {
  const session = await getServerSession();

  const wallet_address = session?.user?.name?.toLocaleLowerCase() ?? "";

  if (!wallet_address) {
    return {
      status: "error",
      message: "Please connect wallet to continue",
    };
  }

  const map = await prisma.maps.create({
    data: {
      name,
      description,
      slug: generateSlug(name),
      thumbnail: thumbnail,
      token_id: "",
      wallet_address: wallet_address,
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

  await prisma.mapsCreator.upsert({
    where: {
      wallet_address: wallet_address,
    },
    create: {
      creator_bio: creator_bio,
      wallet_address: wallet_address,
    },
    update: {
      creator_bio: creator_bio,
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
  creator_bio,
  thumbnail,
  places,
}: {
  map_id: string;
  name: string;
  thumbnail: string;
  creator_bio: string;
  description: string;
  emoji: string;
  places: {
    property_id: string;
    description: string;
  }[];
}) {
  const session = await getServerSession();

  const wallet_address = session?.user?.name?.toLocaleLowerCase() ?? "";

  if (!wallet_address) {
    return {
      status: "error",
      message: "Please connect wallet to continue",
    };
  }

  try {
    const mapDetails = await prisma.maps.findFirst({
      where: {
        map_id,
      },
    });

    if (mapDetails?.wallet_address !== wallet_address) {
      return {
        status: "error",
        message: "You are not authorized to update this map",
      };
    }

    const map = await prisma.maps.update({
      where: {
        map_id,
      },
      data: {
        name,
        thumbnail,
        description,
        map_emoji: emoji,
      },
    });

    await prisma.mapsCreator.upsert({
      where: {
        wallet_address: wallet_address,
      },
      create: {
        creator_bio: creator_bio,
        wallet_address: wallet_address,
      },
      update: {
        creator_bio: creator_bio,
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

export const getUploadUrl = async ({
  name,
  type,
}: {
  name: string;
  type: string;
}) => {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESSKEYID,
    secretAccessKey: process.env.AWS_SECRETACCESSKEY,
  });

  const s3 = new AWS.S3();

  try {
    console.log({ name, type });

    const fileParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: name,
      Expires: 600,
      ContentType: type,
      ACL: "public-read",
    };

    const url = await s3.getSignedUrlPromise("putObject", fileParams);

    return url;
  } catch (err) {
    return null;
  }
};
