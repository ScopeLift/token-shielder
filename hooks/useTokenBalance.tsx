import { TokenListItem } from "@/hooks/useTokenList";
import { BigNumber } from "@ethersproject/bignumber";
import { multicall } from "@wagmi/core";
import useSWR from "swr";
import { useAccount, useNetwork } from "wagmi";

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256 balance)",
];

const useTokenList = ({ tokenList }: { tokenList: TokenListItem[] }) => {
  const { chain } = useNetwork();
  const { address } = useAccount();

  const chainId = chain?.id || 1; // default to mainnet if no chain id
  const { isLoading, error, data } = useSWR(
    `userTokenList-${chainId}-${tokenList.length}`,
    async () => {
      if (!tokenList || tokenList.length === 0) {
        return;
      }
      let multicallArgs = [];
      for (const token of tokenList) {
        multicallArgs.push({
          abi: ERC20_ABI,
          functionName: "balanceOf",
          address: token.address,
          args: [address],
        });
      }
      const data = await multicall({
        contracts: multicallArgs,
      });
      const tokelistWithUserBalance = [];
      for (const [i, token] of tokenList.entries()) {
        tokelistWithUserBalance.push({
          ...token,
          balance: data[i] as BigNumber | null,
        });
      }
      return tokelistWithUserBalance;
    }
  );
  return { isLoading, error, data };
};

export default useTokenList;
