import { BigNumber } from '@ethersproject/bignumber';
import { readContracts } from '@wagmi/core';
import useSWR from 'swr';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import { TokenListItem } from '@/hooks/useTokenList';
import { ethAddress } from '@/utils/constants';

export const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256 balance)'];

const useTokenBalances = ({ tokenList }: { tokenList: TokenListItem[] }) => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const {
    data: balance,
    isError,
    isLoading: balanceLoading,
  } = useBalance({
    address,
  });

  const chainId = chain?.id || 1; // default to mainnet if no chain id
  const { isLoading, error, data } = useSWR(
    `userTokenList-${chainId}-${tokenList.length}`,
    async () => {
      if (!tokenList || tokenList.length === 0) {
        return;
      }
      const readContractsArgs = tokenList
        .filter((token) => token.address !== ethAddress)
        .map((token) => {
          return {
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            address: token.address,
            args: [address],
          };
        });
      const data = await readContracts({
        contracts: readContractsArgs,
      });
      const tokenListWithUserBalance = tokenList.map((token, i) => {
        if (token.address === ethAddress)
          return {
            ...token,
            balance: balance?.value || null,
          };
        return {
          ...token,
          balance: data[i - 1] as BigNumber | null, // Subtract 1 because the native token is the first token and is handled by the conditional above
        };
      });
      return tokenListWithUserBalance;
    }
  );
  return {
    isLoading: isLoading || balanceLoading,
    error: error || isError,
    data,
  };
};

export default useTokenBalances;
