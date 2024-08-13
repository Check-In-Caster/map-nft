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
    <div className="flex flex-col items-center justify-center bg-scroll py-5 pt-5">
      <div className="min-w-[300px]">
        {pending ? (
          <>
            <div className="text-center">
              <p className="text-center text-xl font-bold">Pending...</p>
              <p className="mt-2 text-center font-medium">
                Your transaction is being processed
              </p>
            </div>
          </>
        ) : null}

        {failed ? (
          <>
            <div className="text-center">
              <p className="text-center text-xl font-bold">
                Transaction failed
              </p>
              <p className="mt-2 text-center font-medium">Please try again</p>
            </div>
          </>
        ) : null}

        {!pending && !failed ? (
          <>
            <div className="my-2 grid place-items-center text-center">
              <>
                <p className="relative grid h-20 w-[315px] place-content-center rounded-[50%] px-8 py-3 text-center text-xl font-bold text-black md:text-3xl ">
                  Minted <br />
                </p>
                <p className="text-2xl font-normal">{title}! 🎉</p>
              </>
            </div>

            <div className="my-0">
              <p className="mt-8 text-center text-xl font-bold text-[#000]">
                Share to earn referral fee
              </p>
              <p className="mt-2 font-medium">
                Earn 0.000111 ETH for every mint you refer - use the below
                referral links
              </p>

              <div className="mx-auto my-8 flex w-2/3 items-center justify-around">
                <CopyToClipboard
                  onCopy={() => {
                    toast.success("Copied to clipboard");
                  }}
                  text={`${shareUrl}`}
                >
                  <a className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-gray-200">
                    <LinkIcon className="h-5 w-5" strokeWidth={3} />
                  </a>
                </CopyToClipboard>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURI(
                    shareText,
                  )}&url=${shareUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-black"
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
                    shareText,
                  )}`}
                  target="_blank"
                  className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#855DCD]"
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

        <div className="mx-auto min-w-[300px]  max-w-[300px]">
          <Card
            className={className}
            title={title}
            imgUrl={imgUrl}
            emoji={emoji}
            creator={creator}
          />
        </div>

        {hash ? (
          <p className="my-5 text-center font-bold text-neutral-500">
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
          }),
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
        "ether",
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
        args: [
          account.address,
          tokenId,
          count,
          refAddress ?? ethers.constants.AddressZero,
        ],
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
  const shareText = `Just minted "${title}" MAP NFT on Checkin to discover new places!`;

  return (
    <div className="h-full min-w-[250px] md:max-w-[320px]">
      <Dialog defaultOpen={defaultOpen}>
        <DialogContent
          className="no-scrollbar z-40 h-[100dvh] max-h-[800px] w-screen max-w-[600px] overflow-y-scroll bg-[#FFF8F0] px-0 sm:px-6"
          onInteractOutside={(e) => {
            if (disableOutsideInteraction) {
              e.preventDefault();
            }
            router.refresh();
          }}
        >
          {!minted && (
            <div className="flex flex-col items-center justify-center bg-scroll px-5 pt-5">
              <div className="relative min-w-[300px] max-w-[300px]">
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
                    className="absolute -right-8 top-0 flex items-center justify-center rounded-full p-1 shadow sm:-right-12 sm:-top-2 sm:p-2"
                  >
                    <Share className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </CopyToClipboard>
              </div>
              <div>
                <div className="mt-5 border border-gray-400 p-3 text-center">
                  <p>{price > 0 ? "" : "Free"} Mint on Base</p>
                  {Number(price) > 0 ? (
                    <p className="mt-1 text-xl font-bold">{price} ETH</p>
                  ) : (
                    <p className="mt-1 text-xl font-bold">FREE</p>
                  )}
                </div>
                <Quantity count={count} setCount={setCount} />
              </div>
              <div className="mt-0 w-[280px] md:w-[400px]">
                <CostBreakdown count={count} price={price} />

                <div className="mt-10 text-center">
                  {(account.addresses ?? [])?.length > 0 ? (
                    <>
                      <button
                        className="w-full border border-gray-900 bg-[#5844C1] px-5 py-2 text-[#fff]"
                        onClick={mint}
                        disabled={mintedLoading}
                      >
                        {mintedLoading ? "Minting..." : "Mint"}
                      </button>
                    </>
                  ) : (
                    <div
                      style={{ zIndex: 100 }}
                      className="connect-wallet z-[100] w-full cursor-pointer border border-gray-900 bg-[#5844C1] px-5 py-2 text-[#000]"
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
              <p className="mt-3 text-sm text-gray-500">{userMinted} Minted</p>
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

        <div className={hideCard ? "" : "flex h-full flex-col"}>
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
                      className={`mt-5 w-full border border-[#5844C1] bg-[#fff] py-2 text-center text-[#5844C1] disabled:opacity-50`}
                    >
                      Edit
                    </Link>
                  ) : (
                    <Link
                      href={`/maps/${slug}`}
                      className={`mt-5 w-full border border-[#5844C1] bg-[#fff] py-2 text-center text-[#5844C1] disabled:opacity-50`}
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
                      "mt-5 w-full border border-[#5844C1] bg-[#5844C1] py-2 text-center text-[#fff] disabled:opacity-50",
                      buttonClassName,
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
      className={`relative flex h-full flex-col ${className}`}
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
          <div className="flex aspect-square w-full flex-col justify-center text-center">
            <div className="relative mt-5 text-center text-lg">
              {imgUrl ? null : (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 text-6xl">
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
          className="mt-2 flex items-center gap-2"
        >
          <Image
            src={
              creator.farcaster?.imgUrl !== ""
                ? creator.farcaster?.imgUrl!
                : "https://i.imgur.com/yZOyUGG.png"
            }
            alt={creator.farcaster?.name !== "" ? creator.farcaster?.name! : ""}
            height={28}
            width={28}
            className="h-7 w-7 rounded-full object-cover"
          />
          <span className="text-sm">
            {creator.farcaster?.name !== ""
              ? creator.farcaster?.name
              : shortenAddress(creator.wallet)}
          </span>
        </Link>
      </div>
    </div>
  );
};

export default NFTCard;
