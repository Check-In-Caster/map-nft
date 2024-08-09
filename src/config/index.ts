export const DOMAIN =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_DOMAIN
      ? `https://${process.env.NEXT_PUBLIC_DOMAIN}`
      : "https://maps.checkin.gg";

export const is_dev =
  process.env.NEXT_PUBLIC_IS_DEVELOPMENT === "true" ? true : false;

export const CHAIN_ID = is_dev ? 84532 : 8453;

export const CONTRACT_ADDRESS = is_dev
  ? "0xe5fa8c8f7497b94a47ed42778dc508fc0ec3bb79"
  : (process.env.NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS! as "0x");

export const RPC_PROVIDER = is_dev
  ? "https://sepolia.base.org"
  : "https://mainnet.base.org";

export const EXPLORER_LINK = is_dev
  ? "https://sepolia.basescan.org"
  : "https://basescan.org";
