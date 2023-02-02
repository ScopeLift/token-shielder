import { getRailgunSmartWalletContractForNetwork } from '@railgun-community/quickstart';
import { readContract } from '@wagmi/core';
import useSWR from 'swr';
import { erc20ABI, useAccount, useNetwork } from 'wagmi';
import { ethAddress } from '@/utils/constants';
import { getNetwork } from '@/utils/networks';

const useTokenAllowance = (props: { address: string }) => {
  const { chain } = useNetwork();
  const { address } = useAccount();
  const network = getNetwork(chain?.id);

  const chainId = network.chainId;
  const { isLoading, error, data } = useSWR(
    `useTokenAllowance-${chainId}-${props?.address}`,
    async () => {
      const contractAddress = getRailgunSmartWalletContractForNetwork(
        network.railgunNetworkName
      ).address;
      if (!address) {
        return;
      }
      if (!props.address || props.address === ethAddress) {
        return;
      }
      const data = await readContract({
        abi: erc20ABI,
        functionName: 'allowance',
        address: props.address,
        args: [address, contractAddress as '0x${string}'],
      });
      return data;
    }
  );
  return { isLoading, error, data };
};

export default useTokenAllowance;
