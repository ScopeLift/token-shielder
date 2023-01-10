import {
  startRailgunEngine,
  loadProvider,
  ArtifactStore,
  setLoggers,
} from "@railgun-community/quickstart";
import { NetworkName } from "@railgun-community/shared-models";
import { FallbackProviderJsonConfig } from "@railgun-community/shared-models";
import { BrowserLevel } from "browser-level";
import localforage from "localforage";

export const loadProviders = async () => {
  // Whether to forward debug logs from Fallback Provider.
  const shouldDebug = true;

  const { feesSerialized } = await loadProvider(
    GOERLI_ETH_PROVIDERS_JSON,
    NetworkName.EthereumGoerli,
    shouldDebug
  );
};

// LevelDOWN compatible database for storing encrypted wallets.
const db = new BrowserLevel("");

const setLogging = () => {
  const logMessage: (msg: any) => void = console.log;
  const logError: (err: any) => void = console.error;

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
  const walletSource = "hi";

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
    db,
    shouldDebug,
    artifactStore,
    useNativeArtifacts,
    skipMerkleTreeScans
  );
  setLogging();
};

const ETH_PROVIDERS_JSON: FallbackProviderJsonConfig = {
  chainId: 1,
  providers: [
    {
      provider: "https://cloudflare-eth.com/",
      priority: 1,
      weight: 1,
    },
    {
      provider: "https://rpc.ankr.com/eth",
      priority: 2,
      weight: 1,
    },
  ],
};

const GOERLI_ETH_PROVIDERS_JSON: FallbackProviderJsonConfig = {
  chainId: 5,
  providers: [
    {
      provider: "https://eth-goerli.public.blastapi.io",
      priority: 2,
      weight: 1,
    },
    {
      provider: "https://rpc.ankr.com/eth_goerli",
      priority: 1,
      weight: 1,
    },
  ],
};
