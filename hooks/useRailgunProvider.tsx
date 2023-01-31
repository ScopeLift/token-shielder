import { useEffect, useState } from 'react';
import { setProviderForNetwork } from '@railgun-community/quickstart';
import { BigNumber } from 'ethers';
import { useNetwork, useProvider } from 'wagmi';
import { networks } from '@/utils/networks';
import { loadProviders } from '@/utils/railgun';

// Fee is in bips, e.g. a value of 25 is a 0.25% fee.
interface ShieldFee {
  [chainId: number]: BigNumber;
}

const initialShieldFees: ShieldFee = {};
Object.keys(networks).forEach((chainId) => {
  // Current fees are 0.25% everywhere, so we initialize with that as a default -- If something goes
  // wrong fetching fees, better to show a higher fee than a zero default fee.
  initialShieldFees[Number(chainId)] = BigNumber.from('25');
});

export const useRailgunProvider = () => {
  const [isProviderLoaded, setProviderLoaded] = useState<Boolean>(false);
  const [shieldFees, setShieldFees] = useState<ShieldFee>(initialShieldFees);
  const { chain } = useNetwork();
  const network = networks[chain?.id || 1];
  const provider = useProvider();

  useEffect(() => {
    const fn = async () => {
      setProviderLoaded(false);
      const res = await loadProviders();

      // Set the shield fees for each network.
      const shieldFeesFromNetwork = res.reduce((acc, response) => {
        const newFee = response.providerInfo.feesSerialized?.shield;
        return {
          ...acc,
          [response.chainId]: BigNumber.from(newFee || initialShieldFees[response.chainId]),
        };
      }, {});
      setShieldFees(shieldFeesFromNetwork);

      // Provider is done loading.
      setProviderLoaded(true);
    };
    fn();
  }, []);

  useEffect(() => {
    setProviderForNetwork(network.railgunNetworkName, provider);
  }, [provider, network.railgunNetworkName]);

  return { isProviderLoaded, shieldFees };
};
