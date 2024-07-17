"use client";
import updateMintRecords, { deployToken } from "@/app/actions";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  CHAIN_ID,
  CONTRACT_ADDRESS,
  EXPLORER_LINK,
  NFT_PRICE,
  REF_WALLET_ADDRESS,
  RPC_PROVIDER,
  baseZoraMinterContractAddress,
  getRarityColor,
} from "@/config";
import { baseZoraTokenABI } from "@/constants/zora";
import { useEthersSigner } from "@/hooks/useSigner";
import OpenLocationCode from "@/lib/openlocationcode";
import {
  formatNumberWithCommas,
  isValidEthAddress,
  shortenAddress,
} from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import confetti from "canvas-confetti";
import { ethers } from "ethers";
import { Link as LinkIcon, Share } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "sonner";
import { useAccount, useWalletClient, useWriteContract } from "wagmi";
import CostBreakdown from "../ui/cost-breakdown";
import Heading from "../ui/heading";
import Quantity from "../ui/quanitity";

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const MintTransaction = ({
  title,
  imgUrl,
  emoji,
  creator,
  hash,
  className,
  shareText,
  shareUrl,
}: {
  title: string;
  imgUrl?: string;
  emoji?: string;
  creator: {
    wallet: string;
    farcaster?: {
      name: string;
      imgUrl: string;
    };
  };
  hash?: string;
  shareText: string;
  shareUrl: string;
  className?: string;
}) => {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    (async () => {
      if (hash) {
        setTimeout(async () => {
          if (pending) {
            const provider = new ethers.providers.JsonRpcProvider(RPC_PROVIDER);
            const receipt = await provider.getTransactionReceipt(hash);

            if (receipt.status == 0) {
              setFailed(true);
            } else {
              setPending(false);
              confetti({
                particleCount: 150,
                spread: 60,
              });
            }
          }
        }, 10000);
      }
    })();
  }, [hash]);

  return (
    <div className="flex flex-col justify-center items-center py-5 pt-5 bg-scroll">
      <div className="min-w-[300px]">
        {pending ? (
          <>
            <div className="text-center">
              <p className="text-center font-bold text-xl">Pending...</p>
              <p className="text-center font-medium mt-2">
                Your transaction is being processed
              </p>
            </div>
          </>
        ) : null}

        {failed ? (
          <>
            <div className="text-center">
              <p className="text-center font-bold text-xl">
                Transaction failed
              </p>
              <p className="text-center font-medium mt-2">Please try again</p>
            </div>
          </>
        ) : null}

        {!pending && !failed ? (
          <>
            <Heading className="my-2">
              <p className="text-center">
                Minted <br />
                <div className="text-l font-normal">{title}! 🎉</div>
              </p>
            </Heading>

            <div className="my-0">
              <p className="mt-8 font-bold text-[#000] text-xl text-center">
                Share to earn referral fee
              </p>
              <p className="font-medium mt-2">
                Earn 0.000111 ETH for every mint you refer - use the below
                referral links
              </p>

              <div className="flex justify-around items-center w-2/3 mx-auto my-8">
                <CopyToClipboard
                  onCopy={() => {
                    toast.success("Copied to clipboard");
                  }}
                  text={`${shareUrl}`}
                >
                  <a className="w-14 cursor-pointer h-14 flex justify-center items-center bg-gray-200 rounded-full">
                    <LinkIcon className="h-5 w-5" strokeWidth={3} />
                  </a>
                </CopyToClipboard>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURI(
                    shareText
                  )}&url=${shareUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-14 cursor-pointer h-14 flex justify-center items-center bg-black rounded-full"
                >
                  <Image
                    src="/assets/icons/xlogo.svg"
                    alt="x_logo"
                    width={5}
                    height={5}
                    className="h-5 w-5"
                  />
                </a>
                <a
                  href={`https://warpcast.com/~/compose?embeds[]=${shareUrl.replace(
                    "?property=",
                    "frame?property="
                  )}&text=${encodeURI(shareText)}`}
                  target="_blank"
                  className="w-14 cursor-pointer h-14 flex justify-center items-center bg-[#855DCD] rounded-full"
                >
                  <Image
                    src="/assets/icons/flogo.svg"
                    alt="x_logo"
                    width={5}
                    height={5}
                    className="h-8 w-8"
                  />
                </a>
              </div>
            </div>
          </>
        ) : null}

        <div className="min-w-[300px] mx-auto  max-w-[300px]">
          <Card
            className={className}
            title={title}
            imgUrl={imgUrl}
            emoji={emoji}
            creator={creator}
          />
        </div>
        <p className="text-xs mt-3 block text-gray-500">
          Note: Each Property NFT will only contain the address,
          lattitude/longitude, country and property score of the Property. Names
          and photos on checkin.gg are fetched from Google Maps and for display
          purposes only.
        </p>

        {hash ? (
          <p className="text-center my-5 text-neutral-500 font-bold">
            View on{" "}
            <a
              href={`${EXPLORER_LINK}/tx/${hash}`}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Basescan
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
};

const NFTCard = ({
  property_id,
  referral = "",
  token_id,
  slug,
  className,
  buttonClassName,
  title,
  hide_mint_btn = false,
  userMinted = 0,
  imgUrl,
  emoji,
  creator,
  hideCard = false,
  defaultOpen = false,
  disableOutsideInteraction = false,
}: {
  property_id?: string;
  referral?: string;
  token_id?: number | undefined;
  slug: string;
  className?: string;
  buttonClassName?: string;
  hide_mint_btn?: boolean;
  title: string;
  userMinted?: number;
  imgUrl?: string;
  emoji?: string;
  creator: {
    wallet: string;
    farcaster?: {
      name: string;
      imgUrl: string;
    };
  };
  hideCard?: boolean;
  defaultOpen?: boolean;
  disableOutsideInteraction?: boolean;
}) => {
  const account = useAccount();
  const router = useRouter();
  const { data: walletClient, isLoading, isError } = useWalletClient();

  const { writeContractAsync } = useWriteContract();

  const [count, setCount] = useState(1);
  const signer = useEthersSigner({ chainId: CHAIN_ID });
  const [crypto, setCrypto] = useState("$DEGEN");
  const [hash, setHash] = useState<null | string>(null);
  const [minted, setMinted] = useState(false);
  const [mintedLoading, setMintLoading] = useState(false);

  const price = 0;

  const mint = async () => {
    let tokenId = token_id;

    console.log({
      contractAddress: CONTRACT_ADDRESS,
      quantity: count,
      recipient: account.address!,
      mintReferrerAddress: referral,
      tokenId,
      is_ref: isValidEthAddress(referral ? referral : ""),
    });

    setMintLoading(true);

    if (!token_id) {
      tokenId = await deployToken(property_id!, "type");

      if (tokenId) {
        await new Promise<void>((resolveMain) =>
          toast.promise(new Promise((resolve) => setTimeout(resolve, 10000)), {
            loading: "Please wait while we deploy the NFT!",
            success: () => {
              resolveMain();
              return "Please, confirm the transaction to mint the NFT.";
            },
          })
        );
      }

      if (tokenId == 0) {
        toast.error("Oops! token id not found!");
        setMintLoading(false);
        return;
      }
    }

    console.log("tokenId:", tokenId);

    if (tokenId == null) {
      // may be redirect to the mint page again.
      router.push(`/?property=${property_id}`);
      return;
    }

    try {
      // const provider =
      //   signer?.provider ?? new ethers.providers.JsonRpcProvider(RPC_PROVIDER);

      // const contract = new ethers.Contract(
      //   CONTRACT_ADDRESS,
      //   baseZoraTokenABI,
      //   signer
      // );

      const refAddress = isValidEthAddress(referral ? referral : "");

      console.log(String(count * (0.000777 + price)));

      // const network = await provider.getNetwork();
      // const connectedChainId = network.chainId;
      // console.log(connectedChainId);

      if (account.chainId !== CHAIN_ID) {
        toast("Please connect to the correct network. Chain ID: " + CHAIN_ID);
        return;
      }

      console.log(BigInt(`${count * (0.000777 + price) * 1000000}`));

      const priceInWei = ethers.utils.parseUnits(price.toString(), "ether");
      const multiplier = ethers.utils.parseUnits("0.000777", "ether");

      const totalValueInWei = priceInWei.add(multiplier).mul(count);
      const totalValueInBigInt = totalValueInWei.toBigInt();

      const _mint = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        chainId: CHAIN_ID,
        abi: baseZoraTokenABI,
        functionName: "mintWithRewards",
        args: [
          baseZoraMinterContractAddress,
          tokenId,
          count,
          ethers.utils.defaultAbiCoder.encode(["address"], [account.address!]),
          refAddress == "" ? REF_WALLET_ADDRESS : refAddress,
        ],
        value: totalValueInBigInt,
      });

      console.log(_mint);

      // const _mint = await contract.mintWithRewards(
      //   baseZoraMinterContractAddress,
      //   tokenId,
      //   count,
      //   ethers.utils.defaultAbiCoder.encode(["address"], [account.address!]),
      //   refAddress == "" ? REF_WALLET_ADDRESS : refAddress,
      //   {
      //     value: ethers.utils.parseEther(String(count * (0.000777 + price))),
      //   }
      // );
      console.log(_mint);

      setHash(`${_mint}`);

      await updateMintRecords({
        wallet_address: account.address!,
        property_id: property_id!,
        token_id: (tokenId ?? "").toString(),
        tx_hash: _mint,
        count,
      });

      setMintLoading(false);
      setMinted(true);

      confetti({
        particleCount: 150,
        spread: 60,
      });
    } catch (e) {
      toast.error("Transaction rejected!");
      console.log(e);
      // @ts-ignore
      console.log(e.message);
    }
    setMintLoading(false);
  };

  const shareUrl = `https://property.checkin.gg/?property=${property_id}&ref=${account.address}`;
  const shareText = `Just minted ${title} on CheckIn!`;

  return (
    <div className="max-w-[320px] min-w-[250px] h-full w-full mx-auto">
      <Dialog defaultOpen={defaultOpen}>
        <DialogContent
          className="max-w-[600px] w-screen h-[100dvh] px-0 sm:px-6 z-40 max-h-[800px] bg-[#FFF8F0] overflow-y-scroll no-scrollbar"
          onInteractOutside={(e) => {
            if (disableOutsideInteraction) {
              e.preventDefault();
            }
          }}
        >
          {!minted && (
            <div className="flex flex-col justify-center items-center px-5 pt-5 bg-scroll">
              <div className="min-w-[300px] max-w-[300px] relative">
                <Card
                  className={className}
                  title={title}
                  imgUrl={imgUrl}
                  emoji={emoji}
                  creator={creator}
                />
                <CopyToClipboard
                  text={shareUrl}
                  onCopy={() => {
                    toast.success("Copied link to clipboard");
                  }}
                >
                  <button
                    tabIndex={-1}
                    className="absolute top-0 sm:-top-2 -right-8 sm:-right-12 p-1 sm:p-2 flex items-center justify-center rounded-full shadow"
                  >
                    <Share className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </CopyToClipboard>
              </div>
              <div>
                <div className="border border-gray-400 text-center p-3 mt-5">
                  <p>Zora Free Mint on Base</p>
                  {Number(price) > 0 ? (
                    <p className="text-xl font-bold mt-1">{price} ETH</p>
                  ) : (
                    <p className="text-xl font-bold mt-1">FREE</p>
                  )}
                </div>
                <Quantity count={count} setCount={setCount} />
              </div>
              <div className="w-[280px] md:w-[400px] mt-0">
                {/* <select
                  className="bg-transparent border-2 border-neutral-200 focus:border-neutral-200 text-gray-900 text-sm rounded-md block w-full p-2.5 pr-3 mb-8"
                  value={crypto}
                  onChange={(e) => {
                    setCrypto(e.target.value);
                  }}
                >
                  <option value="$ETH">ETH</option>
                  <option value="$DEGEN">$DEGEN</option>
                </select> */}
                <CostBreakdown count={count} price={price} />

                <div className="text-center mt-10">
                  {(account.addresses ?? [])?.length > 0 ? (
                    <>
                      <button
                        className="bg-[#5844C1] text-[#000] border border-gray-900 py-2 px-5 w-full"
                        onClick={mint}
                        disabled={mintedLoading}
                      >
                        {mintedLoading ? "Minting..." : "Mint"}
                      </button>
                    </>
                  ) : (
                    <div
                      style={{ zIndex: 100 }}
                      className="connect-wallet cursor-pointer z-[100] bg-[#5844C1] text-[#000] border border-gray-900 py-2 px-5 w-full"
                      onClick={(e) => {
                        const el = e.target as HTMLElement;
                        el.querySelector("button")?.click();
                      }}
                    >
                      <ConnectButton showBalance={false} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {minted && (
            <MintTransaction
              title={title}
              imgUrl={imgUrl}
              emoji={emoji}
              creator={creator}
              hash={hash ?? ""}
              className={className}
              shareText={shareText}
              shareUrl={shareUrl}
            />
          )}
        </DialogContent>
        {hideCard ? null : (
          <>
            <div className="h-full flex flex-col">
              <DialogTrigger asChild className="h-full">
                <div>
                  <Card
                    className={className}
                    minted={userMinted}
                    title={title}
                    imgUrl={imgUrl}
                    emoji={emoji}
                    creator={creator}
                  />
                </div>
              </DialogTrigger>

              {hide_mint_btn ? null : (
                <div className="flex gap-2 px-1">
                  <Link
                    href={`/maps/${slug}`}
                    className={`border text-center border-[#5844C1] py-2 mt-5 w-full disabled:opacity-50 bg-[#fff] text-[#5844C1]`}
                  >
                    View
                  </Link>
                  <DialogTrigger asChild>
                    <button
                      className={`border text-center border-[#5844C1] py-2 mt-5 w-full disabled:opacity-50 ${
                        buttonClassName
                          ? buttonClassName
                          : "bg-[#5844C1] text-[#fff]"
                      }`}
                    >
                      Mint
                    </button>
                  </DialogTrigger>
                </div>
              )}
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
};

const Card = ({
  className,
  title,
  minted = 0,
  imgUrl,
  emoji,
  creator,
}: {
  className?: string;
  title: string;
  minted?: number;
  imgUrl?: string;
  emoji?: string;
  creator: {
    wallet: string;
    farcaster?: {
      name: string;
      imgUrl: string;
    };
  };
}) => {
  return (
    <div className={`h-full flex flex-col relative p-2 ${className}`}>
      <div className="w-full">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={title}
            height={320}
            width={320}
            className="w-80 object-cover aspect-square"
          />
        ) : (
          <div className="bg-white w-full aspect-square text-center flex flex-col justify-center">
            <div className="text-center relative text-lg">
              <div className="absolute text-6xl -top-16 left-1/2 -translate-x-1/2">
                {emoji}
              </div>
              <div className="text-3xl">{title}</div>
            </div>
          </div>
        )}
      </div>
      <div className="text-xl line-clamp-2 mt-3">{title}</div>
      <div className="flex gap-2 items-center mt-2">
        <Image
          src={creator.farcaster?.imgUrl ?? "https://i.imgur.com/yZOyUGG.png"}
          alt={creator.farcaster?.name ?? ""}
          height={28}
          width={28}
          className="rounded-full h-7 w-7 object-cover"
        />
        <span className="text-sm">
          {creator.farcaster?.name ?? shortenAddress(creator.wallet)}
        </span>
      </div>
    </div>
  );
};

export default NFTCard;
