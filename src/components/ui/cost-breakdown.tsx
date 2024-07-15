import { ethers } from "ethers";
import { ArrowRightIcon, ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const CostBreakdown = ({
  count = 1,
  price,
}: {
  count: number;
  price: number;
}) => {
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState<null | number>(null);
  const account = useAccount();

  useEffect(() => {
    (async () => {
      if (account.address) {
        try {
          const provider = new ethers.providers.Web3Provider(
            (window as any).ethereum
          );

          await provider.send("eth_requestAccounts", []);
          const address = account.address!;
          const balance = await provider.getBalance(address);
          const balanceInEther = ethers.utils.formatEther(balance);
          setBalance(Number(balanceInEther));
        } catch (e) {
          console.log(e);
        }
      }
    })();
  }, [account]);

  return (
    <section className="space-y-2">
      <div
        onClick={() => setOpen(!open)}
        className="flex justify-between text-gray-500 text-sm cursor-pointer"
      >
        <div className="flex items-center">
          {count}x NFT + {count}x Mint Fee{" "}
          <ChevronDownIcon className="w-4 ml-2" />
        </div>
        <p>{(0.000777 + price) * count} ETH</p>
      </div>
      {open ? (
        <>
          <div className="flex justify-between text-gray-500 text-sm">
            <div className=" flex items-center">
              <ArrowRightIcon className="w-4 mr-2" />
              {count} NFT
            </div>
            <p>{price * count} ETH</p>
          </div>
          <div className="flex justify-between text-gray-500 text-sm">
            <div className=" flex items-center">
              <ArrowRightIcon className="w-4 mr-2" />
              {count} Mint Fee
            </div>
            <p>{0.000777 * count} ETH</p>
          </div>
        </>
      ) : null}

      <p>
        {balance && balance < (0.000777 + price) * count ? (
          <span className="text-red-500">Insufficient balance</span>
        ) : null}
      </p>
    </section>
  );
};

export default CostBreakdown;
