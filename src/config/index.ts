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
  ? "0x8a6709886D496F6BB3e957e3F80e3B63DC11ecF3"
  : "0x8a6709886D496F6BB3e957e3F80e3B63DC11ecF3";

export const RPC_PROVIDER = is_dev
  ? "https://sepolia.base.org"
  : "https://mainnet.base.org";

export const EXPLORER_LINK = is_dev
  ? "https://sepolia.basescan.org"
  : "https://basescan.org";
