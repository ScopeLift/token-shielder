import {
  ArtifactStore,
  loadProvider,
  setLoggers,
  startRailgunEngine,
} from '@railgun-community/quickstart';
import { BrowserLevel } from 'browser-level';
import localforage from 'localforage';
import { getNetwork, networks } from './networks';

export const loadProviders = async () => {
  // Whether to forward debug logs from Fallback Provider.
  const shouldDebug = true;
  return Promise.all(
    Object.keys(networks).map(async (chainIdString) => {
      const chainId = Number(chainIdString);
      const { railgunNetworkName, fallbackProviders } = getNetwork(chainId);
      return {
        chainId,
        providerInfo: await loadProvider(fallbackProviders, railgunNetworkName, shouldDebug),
      };
    })
  );
};

// LevelDOWN compatible database for storing encrypted wallets.
const db = new BrowserLevel('');

const setLogging = () => {
  const logMessage = console.log;
  const logError = console.error;

  setLoggers(logMessage, logError);
};

const artifactStore = new ArtifactStore(
  async (path: string) => {
    return localforage.getItem(path);
  },
  async (dir: string, path: string, item: string | Buffer) => {
    await localforage.setItem(path, item);
  },
  async (path: string) => (await localforage.getItem(path)) != null
);

export const initialize = () => {
  // Name for your wallet implementation.
  // Encrypted and viewable in private transaction history.
  // Maximum of 16 characters, lowercase.
  const walletSource = 'hi';

  // Persistent store for downloading large artifact files.
  // See Quickstart Developer Guide for platform implementations.

  // Whether to download native C++ or web-assembly artifacts.
  // True for mobile. False for nodejs and browser.
  const useNativeArtifacts = false;

  // Whether to forward Engine debug logs to Logger.
  const shouldDebug = true;

  const skipMerkleTreeScans = true;

  startRailgunEngine(
    walletSource,
    // @ts-ignore
    db,
    shouldDebug,
    artifactStore,
    useNativeArtifacts,
    skipMerkleTreeScans
  );
  setLogging();
};
