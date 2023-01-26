import { useEffect, useState } from 'react';
import { setProviderForNetwork } from '@railgun-community/quickstart';
import { useNetwork, useProvider } from 'wagmi';
import { networks } from '@/utils/networks';
import { loadProviders } from '@/utils/railgun';

export const useRailgunProvider = () => {
  const [isProviderLoaded, setProviderLoaded] = useState<Boolean>(false);
  const { chain } = useNetwork();
  const network = networks[chain?.id || 1];
  const provider = useProvider();

  useEffect(() => {
    const fn = async () => {
      setProviderLoaded(false);
      await loadProviders();
      setProviderLoaded(true);
    };
    fn();
  }, []);

  useEffect(() => {
    setProviderForNetwork(network.railgunNetworkName, provider);
  }, [provider, network.railgunNetworkName]);

  return { isProviderLoaded };
};
