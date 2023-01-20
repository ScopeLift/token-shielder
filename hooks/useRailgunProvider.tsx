// import { loadProviders } from "@/utils/railgun";
import { networks } from "@/utils/networks";
import { loadProviders } from "@/utils/railgun";
import {
  loadProvider,
  setProviderForNetwork,
} from "@railgun-community/quickstart";
import { useState, useEffect } from "react";
import { useNetwork, useProvider } from "wagmi";

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
