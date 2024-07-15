import { prisma } from "@/lib/prisma";
import { ethers } from "ethers";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") notFound();

  if (!req.url.includes("confirm")) {
    return NextResponse.json(
      {
        message: "-_-",
        url: req.url,
      },
      { status: 200 }
    );
  }

  const providerUrl = "https://mainnet.base.org";

  const provider = new ethers.providers.JsonRpcProvider({
    url: providerUrl,
    skipFetchSetup: true,
  });

  const txHash =
    "0x0905cba420acb3e5448e77ef283c168c8bacbe68a06e199f213727ea20072330";

  const txinfo = await provider.getTransactionReceipt(txHash);

  const salesInfo = [];

  for (const tx of txinfo.logs) {
    console.log(tx);

    const walletAddress = tx.topics[3];

    const decode = ethers.utils.defaultAbiCoder.decode(
      ["uint256", "uint256"],
      tx.data
    );

    salesInfo.push({
      logIndex: tx.logIndex,
      wallet_address: walletAddress
        .replace("0x000000000000000000000000", "0x")
        .toLocaleLowerCase(),
      token_id: Number(decode[0]),
    });
  }

  for (const sale of salesInfo) {
    const property = await prisma.propertyInfo.findFirst({
      where: {
        token_id: sale.token_id,
      },
    });

    if (!property) continue;

    if (property) {
      const property_id = property?.property_id;

      await prisma.propertySales.create({
        data: {
          wallet_address: sale.wallet_address.toLocaleLowerCase(),
          property_id: property_id,
          token_id: String(sale.token_id),
          tx_hash: txHash,
          quantity: 1,
        },
      });

      await prisma.propertyInfo.update({
        where: {
          property_id: property_id,
        },
        data: {
          total_minted: {
            increment: 1,
          },
        },
      });
    }
  }

  return NextResponse.json({ message: salesInfo, status: "ok" });
}
