import { useNetwork } from 'wagmi';
import useLocalForageGet from '@/hooks/useLocalForageGet';
import nftListJson from '@/public/nftlist.json';
import { CUSTOM_NFTS_STORAGE_KEY } from '@/utils/constants';

export interface NFTListItem {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  logoURI: string;
}

export const useNFTList = () => {
  const { chain } = useNetwork();
  const chainId = chain?.id || 1; // default to mainnet if no chain id

  const nftList = nftListJson.tokens.filter((token) => token.chainId === chainId);

  const { data: localNFTList } = useLocalForageGet<NFTListItem[]>({
    itemPath: CUSTOM_NFTS_STORAGE_KEY,
  });

  const localNFTs = localNFTList || [];
  return { nftList: [...nftList, ...localNFTs] };
};
