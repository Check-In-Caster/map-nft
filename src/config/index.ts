export const DOMAIN =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : process.env.NEXT_PUBLIC_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_DOMAIN}`
    : 'https://property.checkin.gg';

const RarityConfig = {
  common: '#D9E8B6',
  rare: '#BAE1EB',
  epic: '#C8B6E8',
  legendary: '#ed98dc',
  cityToState: 'linear-gradient(150.82deg, #F5F5F5 0%, #E0E0E0 100%)',
  country: 'linear-gradient(150.82deg, #FFD700 0%, #FFC300 100%)',
};

export const NFT_PRICE = {
  town: 0.005,
  city: 0.02,
  state: 0.1,
  country: 1,
};

export const getRarityColor = (score: number) => {
  if (!score || score == 0) RarityConfig.common;

  if (score < 6000) {
    return RarityConfig.common;
  } else if (score >= 6000 && score < 12000) {
    return RarityConfig.rare;
  } else if (score >= 12000 && score < 15000) {
    return RarityConfig.epic;
  } else if (score >= 15000 && score < 20000) {
    return RarityConfig.legendary;
  } else if (score >= 20000 && score < 1000000) {
    return RarityConfig.cityToState;
  } else return RarityConfig.country;
};

// const is_dev = process.env.NODE_ENV === "development";
const is_dev = false;

export const CHAIN_ID = is_dev ? 84532 : 8453;

export const REF_WALLET_ADDRESS = is_dev
  ? '0xaA4D74cacC47aCAD1a9fd5FD6eD1f81A2E57fA17'
  : '0xFD8AF1B687Cb42Dc82663a45B78BE2a17C9791E8';

export const CONTRACT_ADDRESS = is_dev
  ? '0x4B9F32e9A63A4F60aE2572294488AC773e356Ea3'
  : '0x224B2491F28F4a6Bde6b515b2371136FE38F5ba2';

export const RPC_PROVIDER = is_dev
  ? 'https://sepolia.base.org'
  : 'https://mainnet.base.org';

export const EXPLORER_LINK = is_dev
  ? 'https://sepolia.basescan.org'
  : 'https://basescan.org';

export const baseZoraMinterContractAddress = is_dev
  ? '0xd34872BE0cdb6b09d45FCa067B07f04a1A9aE1aE'
  : '0x04E2516A2c207E84a1839755675dfd8eF6302F0a';
