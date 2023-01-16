import { TokenListItem } from "@/hooks/useTokenList";
import { BigNumber } from "@ethersproject/bignumber";
import { readContracts } from "@wagmi/core";
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
      const readContractsArgs = tokenList.map((token) => {
        return {
          abi: ERC20_ABI,
          functionName: "balanceOf",
          address: token.address,
          args: [address],
        };
      });
      const data = await readContracts({
        contracts: readContractsArgs,
      });
      const tokenListWithUserBalance = tokenList.map((token, i) => {
        return {
          ...token,
          balance: data[i] as BigNumber | null,
        };
      });
      return tokenListWithUserBalance;
    }
  );
  return { isLoading, error, data };
};

export default useTokenList;
