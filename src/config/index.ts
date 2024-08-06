export const DOMAIN =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.NEXT_PUBLIC_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_DOMAIN}`
    : "https://maps.checkin.gg";

export const is_dev = process.env.IS_DEVELOPMENT === "true" ? true : false;

export const CHAIN_ID = is_dev ? 84532 : 8453;

export const REF_WALLET_ADDRESS = is_dev
  ? "0xaA4D74cacC47aCAD1a9fd5FD6eD1f81A2E57fA17"
  : "0xaA4D74cacC47aCAD1a9fd5FD6eD1f81A2E57fA17";

export const CONTRACT_ADDRESS = is_dev
  ? "0x307D481d68a5B9068C9622DE81139320f45748cC"
  : "0x307D481d68a5B9068C9622DE81139320f45748cC";

export const RPC_PROVIDER = is_dev
  ? "https://sepolia.base.org"
  : "https://mainnet.base.org";

export const EXPLORER_LINK = is_dev
  ? "https://sepolia.basescan.org"
  : "https://basescan.org";
