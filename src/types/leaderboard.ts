export interface UserRank {
  rank: string;
  wallet_address: string;
  properties_purchased: string;
  total_score: string;
}

export interface CountryRank {
  rank: string;
  country: string;
  properties_sold: string;
}

export interface PropertyRank {
  rank: string;
  location_info: string;
  properties_sold: string;
}
