import { CONTRACT_ADDRESS, RPC_PROVIDER } from "@/config";
import { mapsABI } from "@/constants/maps";
import { BigNumber, ethers } from "ethers";

export const createNewToken = async ({
  maxSupply,
  price,
  tokenURI,
  mintLimit,
}: {
  maxSupply: number | BigNumber;
  price: number;
  tokenURI: string;
  mintLimit: Number | BigNumber;
}) => {
  const provider = new ethers.providers.JsonRpcProvider({
    url: RPC_PROVIDER,
    skipFetchSetup: true,
  });

  const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY!, provider);

  const signer = wallet.connect(provider);

  const contract = new ethers.Contract(CONTRACT_ADDRESS, mapsABI, signer);

  const nextTokenId = await contract.nextTokenId();

  const _createToken = await contract.createToken(
    maxSupply,
    mintLimit,
    wallet.address,
    `${tokenURI + nextTokenId}`
  );

  return nextTokenId;
};
