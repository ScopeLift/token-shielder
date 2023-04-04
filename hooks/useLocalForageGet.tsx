import localforage from 'localforage';
import useSWR from 'swr';
import { CUSTOM_TOKEN_ARRAY_PATH } from '@/utils/constants';

const useLocalForageGet = <T,>({ itemPath }: { itemPath: string }) => {
  const { isLoading, error, data } = useSWR(`localForageGet-${itemPath}`, async () => {
    const item = await localforage.getItem<T>(itemPath);
    return item;
  });
  return {
    isLoading: isLoading,
    error: error,
    data,
  };
};

export default useLocalForageGet;
