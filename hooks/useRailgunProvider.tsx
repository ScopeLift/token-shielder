import { useEffect, useState } from 'react';
import { setProviderForNetwork } from '@railgun-community/quickstart';
import { BigNumber } from 'ethers';
import { useNetwork, useProvider } from 'wagmi';
import { getNetwork, networks } from '@/utils/networks';
import { loadProviders } from '@/utils/railgun';

// Fee is in bips, e.g. a value of 25 is a 0.25% fee.
interface ShieldFee {
  [chainId: number]: BigNumber;
}

const fallbackShieldingFees: ShieldFee = {};
Object.keys(networks).forEach((chainId) => {
  // Current fees are 0.25% everywhere, so we initialize with that
  fallbackShieldingFees[Number(chainId)] = BigNumber.from('25');
});

export const useRailgunProvider = () => {
  const [isProviderLoaded, setProviderLoaded] = useState<Boolean>(false);
  const [shieldingFees, setShieldingFees] = useState<ShieldFee>(fallbackShieldingFees);
  const { chain } = useNetwork();
  const network = getNetwork(chain?.id);
  const provider = useProvider();

  useEffect(() => {
    const fn = async () => {
      setProviderLoaded(false);
      const res = await loadProviders();

      // Set the shield fees for each network.
      const shieldingFeesFromNetwork = res.reduce((acc, response) => {
        const newFee = response.providerInfo.feesSerialized?.shield;
        return {
          ...acc,
          [response.chainId]: BigNumber.from(newFee || fallbackShieldingFees[response.chainId]),
        };
      }, {});
      setShieldingFees(shieldingFeesFromNetwork);

      // Provider is done loading.
      setProviderLoaded(true);
    };
    fn();
  }, []);

  useEffect(() => {
    setProviderForNetwork(network.railgunNetworkName, provider);
  }, [provider, network.railgunNetworkName]);

  return { isProviderLoaded, shieldingFees };
};
