import { CONTRACT_ADDRESS, RPC_PROVIDER } from "@/config";
import { mapsABI } from "@/constants/maps";
import { BigNumber, ethers } from "ethers";

export const createNewToken = async ({
  wallet_address,
  maxSupply,
  price,
  tokenURI,
  mintLimit,
}: {
  maxSupply: number | BigNumber;
  price: number;
  wallet_address: string;
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
  const amount = ethers.utils.parseEther(String(price));

  const _createToken = await contract.createToken(
    maxSupply,
    mintLimit,
    wallet_address,
    amount
  );

  return nextTokenId;
};
