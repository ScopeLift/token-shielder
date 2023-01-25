import tokenListJson from "@/public/tokenlist.json";
import { ethAddress } from "@/utils/constants";
import { networks } from "@/utils/networks";
import { useNetwork } from "wagmi";

export interface TokenListItem {
  chainId: number;
  symbol: string;
  address: string;
  decimals: number;
  name: string;
  logoURI: string;
}

export const useTokenList = () => {
  const { chain } = useNetwork();
  const chainId = chain?.id || 1; // default to mainnet if no chain id
  const network = networks[chainId];
  const tokenList = tokenListJson.tokens.filter(
    (token) => token.chainId === chainId
  );
  const baseToken: TokenListItem = {
    chainId,
    symbol: network.baseToken.symbol,
    address: ethAddress,
    decimals: 18,
    name: network.baseToken.name,
    logoURI: network.baseToken.logoURI,
  };
  return { tokenList: [baseToken, ...tokenList] };
};
