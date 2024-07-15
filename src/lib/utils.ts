import { clsx, type ClassValue } from "clsx";
import { ethers } from "ethers";
import { getAddress } from "ethers/lib/utils";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shortenAddress = (address: string, chars = 4): null | string => {
  if (!address) {
    return null;
  }
  const parsed = address;
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(
    address.length - chars
  )}`;
};

export const formatNumberWithCommas = (number: number | string) => {
  return Number(number).toLocaleString("en-US");
};

export const isValidEthAddress = (address: string) => {
  try {
    if (ethers.utils.isAddress(address)) {
      const wallet = getAddress(address);
      return wallet;
    } else {
      return "";
    }
  } catch (e) {
    return "";
  }
};
