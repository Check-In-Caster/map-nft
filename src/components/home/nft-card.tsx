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
import { formatNumberWithCommas, isValidEthAddress } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import confetti from "canvas-confetti";
import { ethers } from "ethers";
import { Link, Share } from "lucide-react";
import Image from "next/image";
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
  location,
  score,
  rating,
  ratingCount,
  imgUrl,
  hash,
  className,
  flipBackDetails,
  shareText,
  shareUrl,
}: {
  title: string;
  location: string;
  score?: number;
  rating: number | null;
  ratingCount: number | null;
  imgUrl: string;
  hash?: string;
  shareText: string;
  shareUrl: string;
  className?: string;
  flipBackDetails: {
    country: string;
    type: string;
    address: string;
    code: string;
    coordinates: string;
    id: string;
    edition: string;
  };
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
                    <Link className="h-5 w-5" strokeWidth={3} />
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
            location={location}
            score={score}
            rating={rating}
            ratingCount={ratingCount}
            imgUrl={imgUrl}
            flipped={true}
            flipBackDetails={flipBackDetails}
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
  className,
  buttonClassName,
  title,
  location,
  score,
  hide_mint_btn = false,
  userMinted = 0,
  rating,
  ratingCount,
  buttonText,
  imgUrl,
  flipBackDetails,
  type,
  hideCard = false,
  defaultOpen = false,
  disableOutsideInteraction = false,
  isExcluded = false,
}: {
  property_id?: string;
  referral?: string;
  token_id?: number | undefined;
  className?: string;
  buttonClassName?: string;
  hide_mint_btn?: boolean;
  title: string;
  location: string;
  score?: number;
  userMinted?: number;
  rating: number | null;
  ratingCount: number | null;
  buttonText: string;
  imgUrl: string;
  flipBackDetails: {
    country: string;
    type: string;
    address: string;
    code: string;
    coordinates: string;
    id: string;
    edition: string;
  };
  hideCard?: boolean;
  defaultOpen?: boolean;
  disableOutsideInteraction?: boolean;
  type?: string;
  isExcluded?: boolean;
}) => {
  const account = useAccount();
  const router = useRouter();
  const { data: walletClient, isLoading, isError } = useWalletClient();

  if (
    !(
      type === "country" ||
      type === "state" ||
      type === "town" ||
      type === "city"
    )
  )
    type = undefined;
  const price = type ? NFT_PRICE[type] : 0;
  type ? (flipBackDetails.type = capitalizeFirstLetter(type)) : null;
  const { writeContractAsync } = useWriteContract();

  const [count, setCount] = useState(1);
  const signer = useEthersSigner({ chainId: CHAIN_ID });
  const [crypto, setCrypto] = useState("$DEGEN");
  const [hash, setHash] = useState<null | string>(null);
  const [minted, setMinted] = useState(false);
  const [mintedLoading, setMintLoading] = useState(false);
  const [placeCode, setPlaceCode] = useState<string>();

  useEffect(() => {
    const openLocationCode = new OpenLocationCode();

    try {
      const coordinatesArr = flipBackDetails.coordinates
        .replace("{", "")
        .replace("}", "")
        .trim()
        .split(",")
        .map((c) => parseFloat(c));
      const coordinates = {
        lat: coordinatesArr[0],
        lng: coordinatesArr[1],
      };

      const longPlusCode = openLocationCode.encode(
        coordinates.lat,
        coordinates.lng,
        10
      );
      const shortPlusCode = openLocationCode.shorten(
        longPlusCode,
        coordinates.lat.toFixed(1),
        coordinates.lng.toFixed(1)
      );
      setPlaceCode(shortPlusCode);
    } catch {}
  }, [flipBackDetails.coordinates]);

  placeCode ? (flipBackDetails.code = placeCode) : null;

  // score based on type
  if (type) {
    if (type === "country") score = 1000000;
    if (type === "state") score = 100000;
    if (type === "city") score = 40000;
    if (type === "town") score = 20000;
  }

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
      tokenId = await deployToken(property_id!, type);

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
                  location={location}
                  score={score}
                  rating={rating}
                  ratingCount={ratingCount}
                  imgUrl={imgUrl}
                  flipBackDetails={flipBackDetails}
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
                        className="bg-[#EF9854] text-[#000] border border-gray-900 py-2 px-5 w-full"
                        onClick={mint}
                        disabled={mintedLoading}
                      >
                        {mintedLoading ? "Minting..." : "Mint"}
                      </button>
                    </>
                  ) : (
                    <div
                      style={{ zIndex: 100 }}
                      className="connect-wallet cursor-pointer z-[100] bg-[#EF9854] text-[#000] border border-gray-900 py-2 px-5 w-full"
                      onClick={(e) => {
                        const el = e.target as HTMLElement;
                        el.querySelector("button")?.click();
                      }}
                    >
                      <ConnectButton showBalance={false} />
                    </div>
                  )}
                </div>
                <p className="text-lg text-neutral-500 text-center mt-5 font-semibold">
                  {flipBackDetails.edition}
                </p>
              </div>
            </div>
          )}
          {minted && (
            <MintTransaction
              title={title}
              location={location}
              score={score}
              rating={rating}
              ratingCount={ratingCount}
              imgUrl={imgUrl}
              hash={hash ?? ""}
              className={className}
              flipBackDetails={flipBackDetails}
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
                    location={location}
                    score={score}
                    rating={rating}
                    ratingCount={ratingCount}
                    imgUrl={imgUrl}
                    flipBackDetails={flipBackDetails}
                  />
                </div>
              </DialogTrigger>

              {hide_mint_btn ? null : (
                <DialogTrigger asChild>
                  <button
                    className={`border border-gray-900 py-2 mt-5 w-full disabled:opacity-50 ${
                      buttonClassName
                        ? buttonClassName
                        : "bg-[#EF9854] text-[#000]"
                    }`}
                    disabled={isExcluded}
                    title={
                      isExcluded
                        ? "This property is excluded from minting"
                        : undefined
                    }
                  >
                    {!isExcluded
                      ? buttonText
                      : "Cannot mint this category - sorry!"}
                  </button>
                </DialogTrigger>
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
  location,
  score,
  minted = 0,
  rating,
  ratingCount,
  imgUrl,
  flipped = false,
  flipBackDetails,
}: {
  className?: string;
  buttonClassName?: string;
  title: string;
  location: string;
  score?: number;
  minted?: number;
  rating: number | null;
  ratingCount: number | null;
  imgUrl: string;
  flipped?: boolean;
  flipBackDetails: {
    country: string;
    type: string;
    address: string;
    code: string;
    coordinates: string;
    id: string;
    edition: string;
  };
}) => {
  return (
    <div
      className={`border border-gray-900 h-full flex flex-col relative p-4 ${className}`}
      style={{
        background:
          score || score === 0
            ? getRarityColor(Number(score ?? 0))
            : "linear-gradient(270deg, #EF9854 0%, #C8B6E8 33%, #BAE1EB 66%, #D9E8B6 100%)",
      }}
    >
      {!score && score !== 0 && (
        <div className="absolute inset-0 pointer-events-none text-2xl">
          <div className="absolute left-0.5 top-0 rotate-[-25deg]">?</div>
          <div className="absolute right-0.5 top-0 rotate-[25deg]">?</div>
          <div className="absolute left-0.5 bottom-0 rotate-[-155deg]">?</div>
          <div className="absolute right-0.5 bottom-0 rotate-[155deg]">?</div>
        </div>
      )}
      {!flipped && (
        <div className="flip-container w-full h-[246px]">
          <div className="flip-inner w-full h-full">
            <div className="flip-front w-full h-full relative">
              {minted >= 1 ? (
                <div className="bg-white w-fit absolute right-2 top-2 px-2 py-1">
                  x {minted}
                </div>
              ) : null}
              <img
                src={imgUrl}
                alt=""
                className="w-full h-full object-cover border border-gray-900"
              />
            </div>
            <div className="flip-back text-sm p-3 relative w-full h-full">
              <p>{flipBackDetails.country}</p>
              <p>{flipBackDetails.type}</p>
              <p>{flipBackDetails.address}</p>
              <p>{flipBackDetails.code}</p>
              <p>{flipBackDetails.coordinates}</p>
              <p>{flipBackDetails.id}</p>
              <p className="absolute right-2 bottom-2">
                {flipBackDetails.edition}
              </p>
            </div>
          </div>
        </div>
      )}

      {flipped && (
        <div className="bg-black text-white w-full h-[246px]">
          <div className="w-full h-full">
            <div className="text-sm p-3 relative w-full h-full">
              <p>{flipBackDetails.country}</p>
              <p>{flipBackDetails.type}</p>
              <p>{flipBackDetails.address}</p>
              <p>{flipBackDetails.code}</p>
              <p>{flipBackDetails.coordinates}</p>
              <p>{flipBackDetails.id}</p>
              <p className="absolute right-2 bottom-2">
                {flipBackDetails.edition}
              </p>
            </div>
          </div>
        </div>
      )}

      <h3 className="font-medium text-xl mt-5">{title}</h3>
      <p className="font-medium my-2 text-sm">{location}</p>
      <p className="flex-1"></p>
      <p className="flex items-center space-x-2">
        {rating != null ? (
          <>
            {Array(Math.ceil(rating))
              .fill(0)
              .map((_, index) => (
                <img
                  key={index}
                  src="/assets/icons/star.svg"
                  className="w-5 h-5 inline-block"
                />
              ))}
          </>
        ) : null}
        {rating ? (
          <span className="ml-1">
            {ratingCount !== null ? (
              <>({formatNumberWithCommas(ratingCount.toString())})</>
            ) : null}
          </span>
        ) : (
          <br />
        )}
      </p>
    </div>
  );
};

export default NFTCard;
