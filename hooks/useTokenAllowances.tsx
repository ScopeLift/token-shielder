import { TokenListItem } from "@/hooks/useTokenList";
import { networks } from "@/utils/networks";
import { getRailgunSmartWalletContractForNetwork } from "@railgun-community/quickstart";
import { readContracts } from "@wagmi/core";
import useSWR from "swr";
import { useAccount, useNetwork, erc20ABI } from "wagmi";

const useTokenAllowances = ({ tokenList }: { tokenList: TokenListItem[] }) => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const network = networks[chain?.id || 1];

  const chainId = chain?.id || 1; // default to mainnet if no chain id
  const { isLoading, error, data } = useSWR(
    `useTokenAllowances-${chainId}-${tokenList.length}`,
    async () => {
      if (!tokenList || tokenList.length === 0) {
        return new Map();
      }

      const contractAddress = getRailgunSmartWalletContractForNetwork(
        network.railgunNetworkName
      ).address;
      const readContractsArgs = tokenList.map((token) => {
        return {
          abi: erc20ABI,
          functionName: "allowance",
          address: token.address,
          args: [address, contractAddress],
        };
      });
      const data = await readContracts({
        contracts: readContractsArgs,
      });
      const allowancesPerToken = new Map();
      const tokenListWithUserBalance = tokenList.map((token, i) => {
        allowancesPerToken.set(token.address, data[i]);
      });
      return allowancesPerToken;
    }
  );
  return { isLoading, error, data };
};

export default useTokenAllowances;
