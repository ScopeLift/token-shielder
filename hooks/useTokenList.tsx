import { ethAddress } from "@/utils/constants";
import { networks } from "@/utils/networks";
import useSWRImmutable from "swr/immutable";
import { useNetwork } from "wagmi";

export interface TokenListItem {
  chainId: number;
  symbol: string;
  address: string;
  decimals: number;
  name: string;
  logoURI: string;
}

interface TokenListJson {
  tokens: TokenListItem[];
}

const useTokenGet = () => {
  const { isLoading, error, data } = useSWRImmutable(
    `userTokenList`,
    async () => {
      const resp = await fetch("tokenlist.json");
      const json = (await resp.json()) as TokenListJson;
      return json;
    }
  );
  return { isLoading, error, data };
};

export const useTokenList = () => {
  const { chain } = useNetwork();
  const chainId = chain?.id || 1; // default to mainnet if no chain id
  const network = networks[chainId];
  const { data, isLoading, error } = useTokenGet();
  if (!data) {
    return { isLoading, error, tokenList: [] };
  }
  const tokenList = data.tokens.filter((token) => token.chainId === chainId);
  const baseToken: TokenListItem = {
    chainId,
    symbol: network.baseToken.symbol,
    address: ethAddress,
    decimals: 18,
    name: network.baseToken.name,
    logoURI: network.baseToken.logoURI,
  };
  return { isLoading, error, tokenList: [baseToken, ...tokenList] };
};
