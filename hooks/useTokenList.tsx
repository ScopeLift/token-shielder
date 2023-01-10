import { networks } from "@/utils/networks";
import useSWR from "swr";
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

export const useTokenList = () => {
  const { chain } = useNetwork();
  const chainId = chain?.id || 1; // default to mainnet if no chain id
  const network = networks[chainId];
  const { isLoading, error, data } = useSWR(
    `userTokenList-${chainId}`,
    async () => {
      const resp = await fetch(network.tokenList);
      const json = (await resp.json()) as TokenListJson;
      const tokenList = json.tokens.filter(
        (token) => token.chainId === chainId
      );
      return tokenList;
    }
  );
  return { isLoading, error, tokenList: data };
};
