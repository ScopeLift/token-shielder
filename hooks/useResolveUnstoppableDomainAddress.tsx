import useSWRMutation from 'swr/mutation';
import { useNetwork } from 'wagmi';

// Comes from fields here:
// https://docs.unstoppabledomains.com/developer-toolkit/resolution-integration-methods/resolution-service/endpoints/get-records-for-a-domain/
type UnstoppableData = {
  records: { [path in string]: string | null }; // eslint-disable-line no-unused-vars
};

const useResolveUnstoppableDomainAddress = () => {
  const { chain } = useNetwork();
  const { isMutating, error, data, trigger } = useSWRMutation(
    `useResolveUnstoppableDomainAddress-${chain?.id}`,
    async (key: string, { arg }: { arg: { name: string } }) => {
      const url = `https://railwayapi.xyz/unstoppable/domains/resolve/${arg.name}`;
      const resp = await fetch(url);
      const data = (await resp.json()) as UnstoppableData;

      const address = data?.records['crypto.0ZK.version.0ZK.address'];
      if (!address) {
        throw new Error(`Cannot find Unstoppable Domain address for ${chain?.name}.`);
      }
      return address;
    }
  );
  return { isMutating, trigger, error, data };
};

export default useResolveUnstoppableDomainAddress;
