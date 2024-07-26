"use client";
import { DOMAIN } from "@/config";
import { Share } from "lucide-react";

import CopyToClipboard from "react-copy-to-clipboard";
import { toast } from "sonner";
import { useAccount } from "wagmi";

const ShareMap = ({ slug }: { slug: string }) => {
  const account = useAccount();
  const shareUrl = `${DOMAIN}/maps/${slug}/?ref=${account.address}`;

  return (
    <>
      <CopyToClipboard
        text={shareUrl}
        onCopy={() => {
          toast.success("Copied link to clipboard");
        }}
      >
        <button className="rounded-full p-2 hover:shadow-md hover:bg-white outline-none focus:outline-none focus-within:outline-none">
          <Share />
        </button>
      </CopyToClipboard>
    </>
  );
};

export default ShareMap;
