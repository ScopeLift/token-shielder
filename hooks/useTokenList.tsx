import { useNetwork } from 'wagmi';
import tokenListJson from '@/public/tokenlist.json';
import { buildBaseToken, getNetwork } from '@/utils/networks';

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
  const network = getNetwork(chainId);
  const tokenList = tokenListJson.tokens.filter((token) => token.chainId === chainId);
  const baseToken = buildBaseToken(network.baseToken, chain?.id || 1);
  return { tokenList: [baseToken, ...tokenList] };
};
