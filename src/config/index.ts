export const DOMAIN =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_DOMAIN}`
    : "https://maps.checkin.gg";

// const is_dev = process.env.NODE_ENV === "development";
const is_dev = true;

export const CHAIN_ID = is_dev ? 84532 : 8453;

export const REF_WALLET_ADDRESS = is_dev
  ? "0xaA4D74cacC47aCAD1a9fd5FD6eD1f81A2E57fA17"
  : "0xFD8AF1B687Cb42Dc82663a45B78BE2a17C9791E8";

export const CONTRACT_ADDRESS = is_dev
  ? "0x12CDcD230FB16ceda52147fe978cb5d436031351"
  : "0x12CDcD230FB16ceda52147fe978cb5d436031351";

export const RPC_PROVIDER = is_dev
  ? "https://sepolia.base.org"
  : "https://mainnet.base.org";

export const EXPLORER_LINK = is_dev
  ? "https://sepolia.basescan.org"
  : "https://basescan.org";

export const baseZoraMinterContractAddress = is_dev
  ? "0xd34872BE0cdb6b09d45FCa067B07f04a1A9aE1aE"
  : "0x04E2516A2c207E84a1839755675dfd8eF6302F0a";
