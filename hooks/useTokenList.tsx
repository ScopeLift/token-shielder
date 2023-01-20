import { networks } from "@/utils/networks";
import { ethers } from "ethers";
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
      const weth = tokenList.find((token) => token.symbol === "WETH");
      if (!weth) throw new Error("No WETH found in token list");
      const eth: TokenListItem = {
        chainId,
        symbol: "ETH",
        address: ethers.utils.getAddress(`0x${"e".repeat(40)}`),
        decimals: 18,
        name: "ETH",
        logoURI: "",
      };
      return { tokenList: [eth, ...tokenList], weth };
    }
  );
  return { isLoading, error, tokenList: data?.tokenList, weth: data?.weth };
};
