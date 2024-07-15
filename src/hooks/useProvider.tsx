// useEthersProvider.tsx

import { providers } from "ethers";
import { useMemo } from "react";
import type { Chain, Client, Transport } from "viem";
import { Config, useClient } from "wagmi";

const clientToProvider = (
  client: Client<Transport, Chain>
): providers.JsonRpcProvider => {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === "fallback")
    return new providers.FallbackProvider(
      (transport.transports as ReturnType<Transport>[]).map(
        ({ value }) => new providers.JsonRpcProvider(value?.url, network)
      )
    ) as unknown as providers.JsonRpcProvider;
  return new providers.JsonRpcProvider(transport.url, network);
};

export const useEthersProvider = ({
  chainId,
}: { chainId?: number | undefined } = {}) => {
  const client = useClient<Config>({ chainId });

  const provider = useMemo(
    () => (client ? clientToProvider(client) : undefined),
    [client]
  );

  return provider;
};
