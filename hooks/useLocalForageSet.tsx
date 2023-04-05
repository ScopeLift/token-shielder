import localforage from 'localforage';
import { useSWRConfig } from 'swr';

const useLocalForageSet = () => {
  const { mutate } = useSWRConfig();
  const setItem = async <T,>({ key, path, value }: { key: string; path: string; value: T }) => {
    const item = await localforage.setItem<T>(path, value);
    mutate(key);
    return item;
  };
  return {
    setItem,
  };
};

export default useLocalForageSet;
