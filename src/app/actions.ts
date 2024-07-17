"use server";

import { NFT_PRICE } from "@/config";
import { createNewToken } from "@/lib/deployToken";
import { prisma } from "@/lib/prisma";
import "@ethersproject/shims";

export default async function updateMintRecords({
  wallet_address,
  property_id,
  token_id,
  tx_hash,
  count,
}: {
  wallet_address: string;
  property_id: string;
  token_id: string;
  tx_hash: string;
  count: number;
}) {
  if (!property_id || !tx_hash || !token_id) {
    return null;
  }

  const tokenAlreadyExist = await prisma.mapsCollected.findFirst({
    select: {
      collected_id: true,
    },
    where: {
      tx_hash: tx_hash,
    },
  });

  if (tokenAlreadyExist) {
    return null;
  }

  await prisma.mapsCollected.create({
    data: {
      wallet_address: wallet_address.toLocaleLowerCase(),
      map_id: property_id,
      token_id: token_id,
      tx_hash: tx_hash,
      quantity: count,
    },
  });

  await prisma.maps.update({
    where: {
      map_id: property_id,
    },
    data: {
      total_minted: {
        increment: 1,
      },
    },
  });

  return true;
}

export async function deployToken(property_id: string, type?: string) {
  const propertyInfo = await prisma.maps.findFirst({
    where: {
      map_id: property_id,
    },
  });

  if (propertyInfo?.token_id) {
    return Number(propertyInfo.token_id);
  }

  type = "city";

  const tokenId = await createNewToken({
    maxSupply: 1000,
    mintLimit: 100,
    price: type ? NFT_PRICE.town : 0,
    tokenURI: "https://property.checkin.gg/api/metadata/",
  });

  if (tokenId) {
    const propertyInfo = await prisma.propertyInfo.update({
      where: {
        property_id: property_id,
      },
      data: {
        token_id: Number(tokenId),
      },
    });

    return Number(propertyInfo.token_id);
  }

  return 0;
}
