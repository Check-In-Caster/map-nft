"use server";

import { getFnamesFromAddresses } from "@/lib/airstack";
import { unstable_cache } from "next/cache";

const cachedGetFnamesFromAddresses = unstable_cache(
  async (addresses: string[]) => {
    const data = await getFnamesFromAddresses(addresses);
    return data;
  },
  ["bulk-fnames-cache"],
  { revalidate: 60 * 60 * 24 }
);

const getFnamesFromAddressesFn = async (addresses: string[]) => {
  const data = await cachedGetFnamesFromAddresses(addresses);

  const addressMap = new Map(data);
  return addressMap;
};

export { getFnamesFromAddressesFn as getFnamesFromAddresses };
