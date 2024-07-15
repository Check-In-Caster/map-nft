import { fetchQuery, init } from "@airstack/node";

init(process.env.AIRSTACK_API_KEY!);

const getFarcasterAccount = async (wallet_address: string) => {
  const { data, error } = await fetchQuery(
    `query GetFarcasterUserInfo($wallet_address: Address) {
        Socials(
          input: {filter: {userAssociatedAddresses: {_eq: $wallet_address}, dappName: {_eq: farcaster }}, blockchain: ethereum}
        ) {
          Social {
            dappName
            profileName
            userAddress
            profileBio
            profileHandle
            profileImage
            profileTokenId
          }
        }
      }`,
    {
      wallet_address: wallet_address,
    }
  );

  return data?.Socials?.Social?.[0] || null;
};

const getFnamesFromAddresses = async (addresses: string[]) => {
  const { data, error } = await fetchQuery(
    `query GetWeb3SocialsOfFarcasters($addresses: [Identity!]) {
        Socials(
          input: {filter: {identity: { _in: $addresses }, dappName: { _eq: farcaster }}, blockchain: ethereum}
        ) {
          Social {
            dappName
            profileName
            connectedAddresses {
              address
            }
          }
        }
      }`,
    {
      addresses: addresses,
    }
  );

  if (!data || !data.Socials || !data.Socials.Social) return null;

  const addressMapArray: [string, string][] = [];

  data.Socials.Social.forEach((social: any) => {
    social.connectedAddresses.forEach((address: any) => {
      addressMapArray.push([address.address, social.profileName]);
    });
  });

  return addressMapArray;
};

const getFarcasterProfileFromAddresses = async (addresses: string[]) => {
  const { data, error } = await fetchQuery(
    `query GetWeb3SocialsOfFarcasters($addresses: [Identity!]) {
        Socials(
          input: {filter: {identity: { _in: $addresses }, dappName: { _eq: farcaster }}, blockchain: ethereum}
        ) {
          Social {
            dappName
            profileName
            profileImage
            connectedAddresses {
              address
            }
          }
        }
      }`,
    {
      addresses: addresses,
    }
  );

  if (!data || !data.Socials || !data.Socials.Social) return null;

  const addressMap = new Map<
    string,
    {
      profileName: string;
      profileImage: string;
    }
  >();

  data.Socials.Social.forEach((social: any) => {
    social.connectedAddresses.forEach((address: any) => {
      addressMap.set(address.address, {
        profileName: social.profileName,
        profileImage: social.profileImage,
      });
    });
  });

  return addressMap;
};

export {
  getFarcasterAccount,
  getFnamesFromAddresses,
  getFarcasterProfileFromAddresses,
};
