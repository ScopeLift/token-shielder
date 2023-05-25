import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Balances, TokenType } from '@railgun-community/engine';
import {
  parseRailgunTokenAddress,
} from '@railgun-community/quickstart';
import { ChainType } from '@railgun-community/shared-models';
import { useNetwork } from 'wagmi';
import { NFTListItem, useNFTList } from '@/hooks/useNFTList';
import { useRailgunWallet } from './RailgunWalletContext';


function getNFTBalances(balances: Balances, nftAddresses?: string[]) {
  const nftAddressMap = nftAddresses?.reduce((acc, address) => {
    return { ...acc, [address.toLowerCase()]: address };
  }, {} as { [key: string]: string });

  return Object.keys(balances)
    .filter((tokenHash) => {
      return (
        [TokenType.ERC721, TokenType.ERC1155].includes(balances[tokenHash].tokenData.tokenType) &&
        balances[tokenHash].balance > BigInt(0)
      );
    })
    .reduce((nftBalances, tokenHash) => {
      const { tokenAddress, tokenType, tokenSubID } = balances[tokenHash].tokenData;
      const railgunNFTAddress = parseRailgunTokenAddress(tokenAddress);
      const _nftAddress = railgunNFTAddress.toLowerCase();
      const nftAddress = nftAddressMap?.[_nftAddress] || railgunNFTAddress;
      if (!nftAddressMap || nftAddressMap[_nftAddress]) {
        if (!nftBalances[nftAddress]) {
          nftBalances[nftAddress] = {
            address: nftAddress,
            type: tokenType,
            subIds: [],
          };
        }
        nftBalances[nftAddress].subIds.push(tokenSubID);
      }
      return nftBalances;
    }, {} as { [key: string]: { address: string; type: TokenType; subIds: string[] } });
}

export type NFTListContextItem = NFTListItem & {
  subIds: string[];
  privateSubIds: string[];
};

export type NFTContextType = {
  isLoading: boolean;
  nftList: NFTListContextItem[];
};

const initialContext = {
  isLoading: false,
  nftList: [],
};

const NFTContext = createContext<NFTContextType>(initialContext);

export const NFTListProvider = ({ children }: { children: ReactNode }) => {
  const { chain } = useNetwork();
  const chainId = chain?.id || 1;

  const { nftList } = useNFTList();
  const { wallet } = useRailgunWallet();

  const [isLoading, setIsLoading] = useState(false);
  const [nftListWithPrivateBalance, setNFTListWithPrivateBalance] = useState<NFTListContextItem[]>(
    []
  );

  useEffect(() => {
    const fn = async () => {
      if (isLoading) return;
      setIsLoading(true);
      const balances = await wallet?.balances({ id: chainId, type: ChainType.EVM });
      if (balances) {
        const nftBalances = getNFTBalances(
          balances,
          nftList.map(({ address }) => address)
        );
        const newNFTList: NFTListContextItem[] = nftList.map((nft) => {
          const nftBalance = nftBalances[nft.address];
          return {
            ...nft,
            subIds: [],
            privateSubIds: nftBalance ? nftBalance.subIds : [],
          };
        });
        setNFTListWithPrivateBalance(newNFTList);
      }
      setIsLoading(false);
    };
    fn();
  }, [isLoading, chainId, wallet, nftList]);

  return (
    <NFTContext.Provider
      value={{
        isLoading,
        nftList: nftListWithPrivateBalance || [],
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};

export const useNFT = () => useContext(NFTContext);
