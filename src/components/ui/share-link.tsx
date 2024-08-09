import { DOMAIN } from "@/config";
import { Link } from "lucide-react";
import Image from "next/image";
import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { Dialog, DialogContent, DialogTrigger } from "./dialog";

const ShareRefLink = ({ wallet_address }: { wallet_address: string }) => {
  const account = useAccount();
  const shareUrl = `${DOMAIN}/my-maps/${wallet_address}?ref=${account?.address}`;
  const portfolioFrameUrl = `${DOMAIN}/my-maps/${wallet_address}?ref=${account?.address}`;
  const shareText =
    "Check out the MAPs I own in my portfolio. Create yours too!";

  return (
    <Dialog defaultOpen={false}>
      <DialogContent
        className="no-scrollbar z-40 max-h-[800px] max-w-[600px] overflow-y-scroll bg-[#FFF8F0] px-0 sm:px-6"
        onInteractOutside={(e) => {}}
      >
        <h3 className="mb-0"> Share your MAPs portfolio</h3>
        <p className="mt-0 text-gray-700">
          Share and show off your MAPs portfolio!
        </p>

        <input type="text" value={shareUrl} className="border px-2 py-2" />

        <div className="mx-auto my-8 flex w-2/3 items-center justify-around">
          <CopyToClipboard
            onCopy={() => {
              toast.success("Copied to clipboard");
            }}
            text={`${shareUrl}`}
          >
            <a className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-gray-200">
              <Link className="h-5 w-5" strokeWidth={3} />
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
            href={`https://warpcast.com/~/compose?embeds[]=${shareUrl.replace(
              "?property=",
              "frame?property=",
            )}&embeds[]=${portfolioFrameUrl}&text=${encodeURI(shareText)}`}
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
      </DialogContent>
      <DialogTrigger asChild>
        <button
          className={`border border-gray-900 px-6 py-2 disabled:opacity-50 ${"bg-[#5844C1] text-[#fff]"}`}
        >
          Share your portfolio
        </button>
      </DialogTrigger>
    </Dialog>
  );
};

export default ShareRefLink;
