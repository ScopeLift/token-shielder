import { TokenListItem } from "@/hooks/useTokenList";
import { ethAddress } from "@/utils/constants";
import { networks } from "@/utils/networks";
import { getRailgunSmartWalletContractForNetwork } from "@railgun-community/quickstart";
import { readContracts } from "@wagmi/core";
import useSWR from "swr";
import { useAccount, useNetwork, erc20ABI } from "wagmi";

const useTokenAllowances = ({ tokenList }: { tokenList: TokenListItem[] }) => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const network = networks[chain?.id || 1];

  const chainId = network.chainId;
  const { isLoading, error, data } = useSWR(
    `useTokenAllowances-${chainId}-${tokenList.length}`,
    async () => {
      if (!tokenList || tokenList.length === 0) {
        return new Map();
      }
      const filteredTokenList = tokenList.filter(
        (token) => token.address !== ethAddress
      );

      const contractAddress = getRailgunSmartWalletContractForNetwork(
        network.railgunNetworkName
      ).address;
      const readContractsArgs = filteredTokenList.map((token) => {
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
      filteredTokenList.forEach((token, i) => {
        allowancesPerToken.set(token.address, data[i]);
      });
      return allowancesPerToken;
    }
  );
  return { isLoading, error, data };
};

export default useTokenAllowances;
