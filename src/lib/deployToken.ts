import {
  CONTRACT_ADDRESS,
  RPC_PROVIDER,
  baseZoraMinterContractAddress,
} from "@/config";
import { baseZoraTokenABI, saleStrategyABI } from "@/constants/zora";
import { ethers } from "ethers";
import { encodeFunctionData } from "viem";

export const createNewToken = async ({
  maxSupply,
  price,
  tokenURI,
  mintLimit,
}: {
  // max supply of nft | maxuint256 for no limit
  maxSupply: number;
  price: number;
  tokenURI: string;
  // mint limit = 0 for no limit
  mintLimit: number;
}) => {
  const provider = new ethers.providers.JsonRpcProvider({
    url: RPC_PROVIDER,
    skipFetchSetup: true,
  });

  const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY!, provider);
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    baseZoraTokenABI,
    wallet
  );

  const nextTokenId = await contract.nextTokenId();
  const verifyTokenIdExpected = encodeFunctionData({
    abi: baseZoraTokenABI,
    functionName: "assumeLastTokenIdMatches",
    args: [nextTokenId - 1],
  });

  const setupNewToken = encodeFunctionData({
    abi: baseZoraTokenABI,
    functionName: "setupNewTokenWithCreateReferral",
    args: [`${tokenURI + nextTokenId}`, maxSupply, wallet.address],
  });

  const royaltyConfig = encodeFunctionData({
    abi: baseZoraTokenABI,
    functionName: "updateRoyaltiesForToken",
    args: [
      nextTokenId,
      {
        royaltyBPS: 500,
        royaltyRecipient: wallet.address,
        royaltyMintSchedule: 0,
      },
    ],
  });

  const fixedPriceApproval = encodeFunctionData({
    abi: baseZoraTokenABI,
    functionName: "addPermission",
    args: [
      nextTokenId,
      baseZoraMinterContractAddress,
      2 ** 2, // PERMISSION_BIT_MINTER
    ],
  });

  const saleData = encodeFunctionData({
    abi: saleStrategyABI,
    functionName: "setSale",
    args: [
      nextTokenId,
      {
        // price of nft
        pricePerToken: ethers.utils.parseEther(String(price)),
        saleStart: Math.trunc(Date.now() / 1000),
        saleEnd: BigInt("18446744073709551615"),
        // 0 for no limit
        maxTokensPerAddress: mintLimit,
        fundsRecipient: wallet.address,
      },
    ],
  });

  const callSale = encodeFunctionData({
    abi: baseZoraTokenABI,
    functionName: "callSale",
    args: [nextTokenId, baseZoraMinterContractAddress, saleData],
  });

  const callData = [
    verifyTokenIdExpected,
    setupNewToken,
    royaltyConfig,
    fixedPriceApproval,
    callSale,
  ];

  const _gasPrice = await provider.getGasPrice();

  const callContract = await contract.multicall(callData, {
    gasPrice: _gasPrice,
  });

  return nextTokenId;
};
