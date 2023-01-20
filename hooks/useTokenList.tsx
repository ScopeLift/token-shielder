import { ethAddress } from "@/utils/constants";
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
      const resp = await fetch(network.tokenListUrl);
      const json = (await resp.json()) as TokenListJson;
      const tokenList = json.tokens.filter(
        (token) => token.chainId === chainId
      );
      let weth = tokenList.find((token) => token.symbol === "WETH") || {
        chainId,
        symbol: "WETH",
        address: network.wethAddress,
        decimals: 18,
        name: "Wrapped ETH",
        logoURI: "",
      };
      const baseToken: TokenListItem = {
        chainId,
        symbol: network.baseToken.symbol,
        address: ethAddress,
        decimals: 18,
        name: network.baseToken.name,
        logoURI: "",
      };
      return { tokenList: [baseToken, ...tokenList], weth };
    }
  );
  return { isLoading, error, tokenList: data?.tokenList, weth: data?.weth };
};
