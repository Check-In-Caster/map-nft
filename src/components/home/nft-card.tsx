"use client";
import updateMintRecords, { deployToken } from "@/app/actions";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  CHAIN_ID,
  CONTRACT_ADDRESS,
  DOMAIN,
  EXPLORER_LINK,
  RPC_PROVIDER,
} from "@/config";
import { mapsABI } from "@/constants/maps";
import { cn, isValidEthAddress, shortenAddress } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import confetti from "canvas-confetti";
import { ethers } from "ethers";
import { Link as LinkIcon, Share } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "sonner";
import { useAccount, useWriteContract } from "wagmi";
import CostBreakdown from "../ui/cost-breakdown";
import Quantity from "../ui/quanitity";

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
      name?: string;
      imgUrl?: string;
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
            <div className="my-2 text-center grid place-items-center">
              <>
                <p className="text-center text-black relative text-xl md:text-3xl font-bold px-8 py-3 w-[315px] h-20 grid place-content-center rounded-[50%] ">
                  Minted <br />
                </p>
                <p className="text-2xl font-normal">{title}! 🎉</p>
              </>
            </div>

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
                  href={`https://warpcast.com/~/compose?embeds[]=${shareUrl}&text=${encodeURI(
                    shareText
                  )}`}
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
  token_id,
  eth_amount = "0",
  slug,
  edit = false,
  className,
  buttonClassName,
  mintButtonText = "Mint",
  title,
  hide_mint_btn = false,
  hide_view_btn = false,
  userMinted = 0,
  imgUrl,
  emoji,
  creator,
  hideCard = false,
  defaultOpen = false,
  disableOutsideInteraction = false,
}: {
  property_id?: string;
  token_id?: number | undefined;
  slug: string;
  eth_amount?: string | null;
  className?: string;
  edit?: boolean;
  buttonClassName?: string;
  mintButtonText?: string;
  hide_mint_btn?: boolean;
  hide_view_btn?: boolean;
  title: string;
  userMinted?: number;
  imgUrl?: string;
  emoji?: string;
  creator: {
    wallet: string;
    farcaster?: {
      name?: string;
      imgUrl?: string;
    };
  };
  hideCard?: boolean;
  defaultOpen?: boolean;
  disableOutsideInteraction?: boolean;
}) => {
  const account = useAccount();
  const router = useRouter();
  const params = useSearchParams();
  const referral = params.get("ref");

  const { writeContractAsync } = useWriteContract();

  const [count, setCount] = useState(1);
  const [hash, setHash] = useState<null | string>(null);
  const [minted, setMinted] = useState(false);
  const [mintedLoading, setMintLoading] = useState(false);

  const price = eth_amount ? Number(eth_amount) : 0;

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

    if (tokenId == null) {
      // may be redirect to the mint page again.
      router.push(`/?property=${property_id}`);
      return;
    }

    try {
      const refAddress = isValidEthAddress(referral ? referral : "");

      if (account.chainId !== CHAIN_ID) {
        toast("Please connect to the correct network. Chain ID: " + CHAIN_ID);
        return;
      }

      const priceInWei = ethers.utils.parseUnits(
        (eth_amount ?? 0).toString(),
        "ether"
      );
      const multiplier = ethers.utils.parseUnits(String(0.000777), "ether");

      const totalValueInWei = priceInWei.add(multiplier).mul(1);
      const totalValueInBigInt = totalValueInWei.toBigInt();

      console.log("________________________________");
      console.log("totalValueInBigInt");
      console.log(eth_amount);
      console.log(totalValueInBigInt);
      console.log(count);
      console.log("________________________________");

      const _mint = await writeContractAsync({
        address: CONTRACT_ADDRESS!,
        chainId: CHAIN_ID,
        abi: mapsABI,
        functionName: "mint",
        args: [account.address, tokenId, count, refAddress],
        value: totalValueInBigInt,
      });

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
      // @ts-ignore
      console.log(e.message);

      // @ts-ignore
      if (e.message.includes("Insufficient payment")) {
        toast.error(`You don't have enough ETH on your wallet!`);
      } else {
        toast.error("Transaction rejected!");
      }
    }
    setMintLoading(false);
  };

  const shareUrl = `${DOMAIN}/maps/${slug}/?ref=${account.address}`;
  const shareText = `Just minted ${title} on CheckIn!`;

  return (
    <div className="md:max-w-[320px] min-w-[250px] h-full">
      <Dialog defaultOpen={defaultOpen}>
        <DialogContent
          className="max-w-[600px] w-screen h-[100dvh] px-0 sm:px-6 z-40 max-h-[800px] bg-[#FFF8F0] overflow-y-scroll no-scrollbar"
          onInteractOutside={(e) => {
            if (disableOutsideInteraction) {
              e.preventDefault();
            }
            router.refresh();
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
                  <p>{price > 0 ? "" : "Free"} Mint on Base</p>
                  {Number(price) > 0 ? (
                    <p className="text-xl font-bold mt-1">{price} ETH</p>
                  ) : (
                    <p className="text-xl font-bold mt-1">FREE</p>
                  )}
                </div>
                <Quantity count={count} setCount={setCount} />
              </div>
              <div className="w-[280px] md:w-[400px] mt-0">
                <CostBreakdown count={count} price={price} />

                <div className="text-center mt-10">
                  {(account.addresses ?? [])?.length > 0 ? (
                    <>
                      <button
                        className="bg-[#5844C1] text-[#fff] border border-gray-900 py-2 px-5 w-full"
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
              <p className="mt-3 text-gray-500 text-sm">{userMinted} Minted</p>
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

        <div className={hideCard ? "" : "h-full flex flex-col"}>
          {hideCard ? null : (
            <Link href={`/maps/${slug}`} passHref className="h-full">
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
            </Link>
          )}

          {hide_mint_btn && hide_view_btn ? null : (
            <div className="flex gap-2">
              {hide_view_btn ? null : (
                <>
                  {edit ? (
                    <Link
                      href={`/maps/edit/${property_id}`}
                      className={`border text-center border-[#5844C1] py-2 mt-5 w-full disabled:opacity-50 bg-[#fff] text-[#5844C1]`}
                    >
                      Edit
                    </Link>
                  ) : (
                    <Link
                      href={`/maps/${slug}`}
                      className={`border text-center border-[#5844C1] py-2 mt-5 w-full disabled:opacity-50 bg-[#fff] text-[#5844C1]`}
                    >
                      View
                    </Link>
                  )}
                </>
              )}
              {hide_mint_btn ? null : (
                <DialogTrigger asChild>
                  <button
                    className={cn(
                      "border text-center border-[#5844C1] py-2 mt-5 w-full disabled:opacity-50 bg-[#5844C1] text-[#fff]",
                      buttonClassName
                    )}
                  >
                    {mintButtonText}
                  </button>
                </DialogTrigger>
              )}
            </div>
          )}
        </div>
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
      name?: string;
      imgUrl?: string;
    };
  };
}) => {
  return (
    <div
      className={`h-full flex flex-col relative ${className}`}
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
      }}
    >
      <div
        className={`h-full w-full ${imgUrl ? "text-white" : "text-[#000]"} p-3`}
        style={{
          background: imgUrl ? "rgba(0, 0, 0, 0.60)" : "#fff",
        }}
      >
        <div className="w-full ">
          <div className="w-full aspect-square text-center flex flex-col justify-center">
            <div className="text-center relative text-lg mt-5">
              {imgUrl ? null : (
                <div className="absolute text-6xl -top-16 left-1/2 -translate-x-1/2">
                  <img src={emoji} alt="" />
                </div>
              )}
              <div className={`text-2xl ${imgUrl ? "" : "mt-8"}`}>{title}</div>
            </div>
          </div>
        </div>
        {/* truncate text-ellipsis overflow-hidden */}

        <Link
          href={`/my-maps/${creator.wallet}`}
          passHref
          className="flex gap-2 items-center mt-2"
        >
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
        </Link>
      </div>
    </div>
  );
};

export default NFTCard;
