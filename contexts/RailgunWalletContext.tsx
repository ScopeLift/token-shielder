import React, { ReactNode, createContext, useCallback, useContext, useState } from 'react';
import { RailgunWallet } from '@railgun-community/engine';
import {
  createRailgunWallet,
  fullWalletForID,
  loadWalletByID,
} from '@railgun-community/quickstart';
import { ChainType, RailgunWalletInfo, networkForChain } from '@railgun-community/shared-models';
import { randomBytes } from 'crypto';
import { entropyToMnemonic, isValidMnemonic } from 'ethers/lib/utils.js';
import { useNetwork } from 'wagmi';
import { fetchBlockNumber } from 'wagmi/actions';
import useLocalForageGet from '@/hooks/useLocalForageGet';
import useLocalForageSet from '@/hooks/useLocalForageSet';

const ENCRYPTION_KEY_SALT = 'railgunWalletEncryptionKeySalt';
const RAILGUN_WALLET_LIST_STORAGE_KEY = 'railgunWalletList';

async function sha256WithSalt(message: string) {
  const msg = new TextEncoder().encode(`${ENCRYPTION_KEY_SALT}_${message}`);
  const buf = await crypto.subtle.digest('SHA-256', msg);
  return Buffer.from(buf).toString('hex');
}

export type RailgunWalletContextType = {
  isLoading: boolean;
  walletList: RailgunWalletInfo[];
  wallet?: RailgunWallet;
  encryptionKey?: string;
  createWallet: (
    // eslint-disable-next-line no-unused-vars
    password: string,
    // eslint-disable-next-line no-unused-vars
    mnemonic?: string
  ) => Promise<{
    info: RailgunWalletInfo;
    mnemonic: string;
  }>;
  // eslint-disable-next-line no-unused-vars
  selectWallet: (walletId: string, password: string) => Promise<void>;
};

const initialContext: RailgunWalletContextType = {
  isLoading: false,
  walletList: [],
  createWallet: async (password: string, mnemonic?: string) => ({
    info: { id: '', railgunAddress: '' },
    mnemonic: mnemonic || '',
  }),
  selectWallet: async () => {},
};

const RailgunWalletContext = createContext<RailgunWalletContextType>(initialContext);

export const RailgunWalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<RailgunWallet>();
  const [encryptionKey, setEncryptionKey] = useState<string>();
  const { chains } = useNetwork();

  const { setItem } = useLocalForageSet();
  const { isLoading, data: walletList } = useLocalForageGet<RailgunWalletInfo[]>({
    itemPath: RAILGUN_WALLET_LIST_STORAGE_KEY,
  });

  const walletExists = useCallback(
    (walletId?: string): boolean => {
      return walletList?.findIndex(({ id }) => id === walletId)! >= 0 || false;
    },
    [walletList]
  );

  const createWallet: RailgunWalletContextType['createWallet'] = useCallback(
    async (password: string, mnemonic?: string) => {
      if (!mnemonic) {
        mnemonic = entropyToMnemonic(randomBytes(16));
      }
      if (!isValidMnemonic(mnemonic)) {
        throw new Error(`Invalid mnemonic: '${mnemonic}'!`);
      }
      const encryptionKey = await sha256WithSalt(password);

      const blockNumbers = await Promise.all(
        chains.map(async ({ id: chainId }) => {
          const network = networkForChain({
            id: chainId,
            type: ChainType.EVM,
          });
          return {
            name: network?.name,
            number: network ? await fetchBlockNumber({ chainId }) : 0,
          };
        })
      );
      const creationBlockNumbers = blockNumbers.reduce((acc, { name, number }) => {
        return { ...acc, [name]: number };
      }, {});

      const { error, railgunWalletInfo: info } = await createRailgunWallet(
        encryptionKey,
        mnemonic,
        creationBlockNumbers
      );
      if (error || !info) {
        throw new Error(`Failed to createRailgunWallet! ${error}`);
      }
      if (!walletExists(info?.id)) {
        await setItem<RailgunWalletInfo[]>({
          path: RAILGUN_WALLET_LIST_STORAGE_KEY,
          key: `localForageGet-${RAILGUN_WALLET_LIST_STORAGE_KEY}`,
          value: [info!, ...(walletList || [])],
        });
      }
      return { info, mnemonic };
    },
    [chains, setItem, walletExists, walletList]
  );

  const selectWallet: RailgunWalletContextType['selectWallet'] = useCallback(
    async (walletId: string, password: string) => {
      if (!walletExists(walletId)) {
        return;
      }
      const encryptionKey = await sha256WithSalt(password);
      const { error } = await loadWalletByID(encryptionKey, walletId, false);
      if (error) {
        throw new Error(`selectWallet: ${error}`);
      }
      setWallet(fullWalletForID(walletId));
      setEncryptionKey(encryptionKey);
    },
    [walletExists]
  );

  return (
    <RailgunWalletContext.Provider
      value={{
        isLoading,
        wallet,
        encryptionKey,
        walletList: walletList || [],
        createWallet,
        selectWallet,
      }}
    >
      {children}
    </RailgunWalletContext.Provider>
  );
};

export const useRailgunWallet = () => useContext(RailgunWalletContext);
