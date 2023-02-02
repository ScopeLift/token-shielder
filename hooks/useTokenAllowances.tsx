import { getRailgunSmartWalletContractForNetwork } from '@railgun-community/quickstart';
import { readContracts } from '@wagmi/core';
import useSWR from 'swr';
import { erc20ABI, useAccount, useNetwork } from 'wagmi';
import { TokenListItem } from '@/hooks/useTokenList';
import { ethAddress } from '@/utils/constants';
import { getNetwork } from '@/utils/networks';

const useTokenAllowances = ({ tokenList }: { tokenList: TokenListItem[] }) => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const network = getNetwork(chain?.id);

  const chainId = network.chainId;
  const { isLoading, error, data } = useSWR(
    `useTokenAllowances-${chainId}-${tokenList.length}`,
    async () => {
      if (!tokenList || tokenList.length === 0) {
        return new Map();
      }
      const filteredTokenList = tokenList.filter((token) => token.address !== ethAddress);

      const contractAddress = getRailgunSmartWalletContractForNetwork(
        network.railgunNetworkName
      ).address;
      const readContractsArgs = filteredTokenList.map((token) => {
        return {
          abi: erc20ABI,
          functionName: 'allowance',
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
