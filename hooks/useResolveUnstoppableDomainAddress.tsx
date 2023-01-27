import useSWR from 'swr';
import { useNetwork } from 'wagmi';

// Comes from fields here:
/// https://docs.unstoppabledomains.com/developer-toolkit/resolution-integration-methods/resolution-service/endpoints/get-records-for-a-domain/
type UnstoppableData = {
  records: { [path in string]: string | null }; // eslint-disable-line no-unused-vars
};

const useResolveUnstoppableDomainAddress = (props: { name: string }) => {
  const { chain } = useNetwork();
  const { isLoading, error, data } = useSWR(
    `useResolveUnstoppableDomainAddress-${chain?.id}-${props.name}`,
    async () => {
      const url = `https://railwayapi.xyz/unstoppable/domains/resolve/${props.name}`;
      const resp = await fetch(url);
      const data = (await resp.json()) as UnstoppableData;

      const address = data?.records['crypto.0ZK.version.0ZK.address'];
      if (!address) {
        throw new Error(`Cannot find Unstoppable Domain address for ${chain?.name}.`);
      }
      return address;
    }
  );
  return { isLoading, error, data };
};

export default useResolveUnstoppableDomainAddress;
