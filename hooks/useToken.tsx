import { TokenListItem } from "@/hooks/useTokenList";
import { networks } from "@/utils/networks";
import { getRailgunSmartWalletContractForNetwork } from "@railgun-community/quickstart";
import { readContracts } from "@wagmi/core";
import useSWR from "swr";
import { useAccount, useNetwork, erc20ABI } from "wagmi";

const useToken = ({ tokenList }: { tokenList: TokenListItem[] }) => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const network = networks[chain?.id || 1];

  const chainId = network.chainId;
  const { isLoading, error, data } = useSWR(
    `useToken-${chainId}-${tokenList.length}`,
    async () => {
      if (!tokenList || tokenList.length === 0) {
        return new Map();
      }

      const contractAddress = getRailgunSmartWalletContractForNetwork(
        network.railgunNetworkName
      ).address;
      const readContractsArgs = [];
      for (const token of tokenList) {
        readContractsArgs.push({
          abi: erc20ABI,
          functionName: "balance",
          address: token.address,
          args: [address, contractAddress],
        });
        readContractsArgs.push({
          abi: erc20ABI,
          functionName: "allowance",
          address: token.address,
          args: [address, contractAddress],
        });
      }
      const data = await readContracts({
        contracts: readContractsArgs,
      });
      const tokenMap = new Map();
      tokenList.forEach((token, i) => {
        tokenMap.set(token.address, {
          balance: data[i],
          allowance: data[i + 1],
        });
      });
      return tokenMap;
    }
  );
  return { isLoading, error, data };
};

export default useToken;
