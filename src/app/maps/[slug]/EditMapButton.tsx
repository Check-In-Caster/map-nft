"use client";

import Link from "next/link";
import { useAccount } from "wagmi";

const EditMapButton = ({
  map_id,
  wallet_address,
}: {
  map_id: string;
  wallet_address: string;
}) => {
  const account = useAccount();

  if (
    account.address?.toLocaleLowerCase() != wallet_address?.toLocaleLowerCase()
  )
    return null;

  return (
    <Link
      href={`/maps/edit/${map_id}`}
      className={`border w-max text-center border-[#5844C1] py-2 px-4 mt-3  disabled:opacity-50 bg-[#fff] text-[#5844C1]`}
    >
      Edit Map
    </Link>
  );
};

export default EditMapButton;
