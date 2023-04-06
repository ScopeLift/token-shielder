import { useNetwork } from 'wagmi';
import useLocalForageGet from '@/hooks/useLocalForageGet';
import tokenListJson from '@/public/tokenlist.json';
import { CUSTOM_TOKENS_STORAGE_KEY, TOKEN_PRIORITY_SORT } from '@/utils/constants';
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
  const tokenList = tokenListJson.tokens
    .filter((token) => token.chainId === chainId)
    .sort((a, b) => {
      // sorts most common tokens to the top of the tokenList
      for (const symbol of TOKEN_PRIORITY_SORT) {
        if (b.symbol === symbol) return 1;
        if (a.symbol === symbol) return -1;
      }
      return 0;
    });
  const baseToken = buildBaseToken(network.baseToken, chain?.id || 1);
  const { data: localTokenList } = useLocalForageGet<TokenListItem[]>({
    itemPath: CUSTOM_TOKENS_STORAGE_KEY,
  });
  const tokens = [baseToken, ...tokenList];
  const localTokens = localTokenList || [];
  return { tokenList: [...tokens, ...localTokens] };
};
