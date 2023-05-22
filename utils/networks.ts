import { isHexString } from '@ethersproject/bytes';
import { NetworkName } from '@railgun-community/shared-models';
import { EVMGasType } from '@railgun-community/shared-models';
import { FallbackProviderJsonConfig } from '@railgun-community/shared-models';
import { BigNumber } from 'ethers';
import { configureChains, Chain } from 'wagmi';
import { arbitrum, bsc, goerli, mainnet, polygon } from 'wagmi/chains';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { celoIcon, ethAddress } from '@/utils/constants';
import { bscIcon } from '@/utils/constants';

const celoAlfajores = {
  id: 44787,
  name: 'Alfajores',
  network: 'celo-alfajores',
  nativeCurrency: {
    decimals: 18,
    name: 'CELO',
    symbol: 'CELO',
  },
  rpcUrls: {
    default: {
      http: ['https://alfajores-forno.celo-testnet.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Celo Explorer',
      url: 'https://explorer.celo.org/alfajores',
    },
    etherscan: { name: 'CeloScan', url: 'https://alfajores.celoscan.io/' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 14569001,
    },
  },
  testnet: true
} satisfies Chain

// Configure supported networks.
export const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, arbitrum, { ...bsc, iconUrl: bscIcon }, polygon, goerli, { ...celoAlfajores, iconUrl: celoIcon }],
  [infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY! }), publicProvider()]
);

type BaseToken = { symbol: string; name: string; logoURI: string };
export type NetworkConfig = {
  blockExplorerUrl: string;
  railgunNetworkName: NetworkName;
  chainId: number;
  wethAddress: string;
  evmGasType: EVMGasType;
  baseToken: BaseToken;
  fallbackProviders: FallbackProviderJsonConfig;
};

const getRpcUrl = (chainId: number) => {
  const chain = chains.find((chain) => chain.id === chainId);
  if (!chain) throw new Error(`Chain with id ${chainId} not found`);
  return chain.rpcUrls.default.http[0];
};

export const networks = {
  [mainnet.id]: {
    blockExplorerUrl: 'https://etherscan.io/',
    railgunNetworkName: NetworkName.Ethereum,
    chainId: mainnet.id,
    wethAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    evmGasType: EVMGasType.Type2,
    baseToken: {
      symbol: 'ETH',
      name: 'Ether',
      logoURI: '',
    },
    fallbackProviders: {
      chainId: mainnet.id,
      providers: [{ provider: getRpcUrl(mainnet.id), priority: 1, weight: 1 }],
    },
  },
  [goerli.id]: {
    blockExplorerUrl: 'https://goerli.etherscan.io/',
    railgunNetworkName: NetworkName.EthereumGoerli,
    chainId: goerli.id,
    wethAddress: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
    evmGasType: EVMGasType.Type2,
    baseToken: {
      symbol: 'ETH',
      name: 'Ether',
      logoURI: '',
    },
    fallbackProviders: {
      chainId: goerli.id,
      providers: [{ provider: getRpcUrl(goerli.id), priority: 1, weight: 1 }],
    },
  },
  [bsc.id]: {
    blockExplorerUrl: 'https://bscscan.com/',
    railgunNetworkName: NetworkName.BNBChain,
    chainId: bsc.id,
    wethAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    evmGasType: EVMGasType.Type0,
    baseToken: {
      symbol: 'BNB',
      name: 'Binance coin',
      logoURI: '',
    },
    fallbackProviders: {
      chainId: bsc.id,
      providers: [{ provider: getRpcUrl(bsc.id), priority: 1, weight: 1 }],
    },
  },
  [polygon.id]: {
    blockExplorerUrl: 'https://polygonscan.com/',
    railgunNetworkName: NetworkName.Polygon,
    chainId: polygon.id,
    wethAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    evmGasType: EVMGasType.Type2,
    baseToken: {
      symbol: 'MATIC',
      name: 'MATIC',
      logoURI: '',
    },
    fallbackProviders: {
      chainId: polygon.id,
      providers: [{ provider: getRpcUrl(polygon.id), priority: 1, weight: 1 }],
    },
  },
  [arbitrum.id]: {
    blockExplorerUrl: 'https://arbiscan.io/',
    railgunNetworkName: NetworkName.Arbitrum,
    chainId: arbitrum.id,
    wethAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    baseToken: {
      symbol: 'ETH',
      name: 'Ether',
      logoURI: '',
    },
    fallbackProviders: {
      chainId: arbitrum.id,
      providers: [{ provider: getRpcUrl(arbitrum.id), priority: 1, weight: 1 }],
    },
  },
  [celoAlfajores.id]: {
    blockExplorerUrl: 'https://alfajores.celoscan.io/',
    railgunNetworkName: NetworkName.CeloAlfajores,
    chainId: celoAlfajores.id,
    wethAddress: '0x524d97A67f50F4A062C28c74F60703Aec9028a94',
    baseToken: {
      symbol: 'CELO',
      name: 'Celo',
      logoURI: '',
    },
    fallbackProviders: {
      chainId: celoAlfajores.id,
      providers: [{ provider: getRpcUrl(celoAlfajores.id), priority: 1, weight: 1 }],
    },
  },
} as { [key: number]: NetworkConfig };

export const getEtherscanUrl = (txHashOrAddress: string, chainId: number) => {
  const group = isHexString(txHashOrAddress)
    ? txHashOrAddress.length === 42
      ? 'address'
      : 'tx'
    : 'ens';
  const chain = getNetwork(chainId);
  const networkPrefix = chain?.blockExplorerUrl ? chain?.blockExplorerUrl : 'https://etherscan.io';
  if (group === 'ens') {
    return `${networkPrefix}`;
  } else {
    return `${networkPrefix}/${group}/${txHashOrAddress}`;
  }
};

export const buildBaseToken = (baseToken: BaseToken, chainId: number) => {
  return {
    chainId,
    symbol: baseToken.symbol,
    address: ethAddress,
    decimals: 18,
    name: baseToken.name,
    logoURI: baseToken.logoURI,
    balance: BigNumber.from(0),
    privateBalance: BigNumber.from(0),
  };
};

export const getNetwork = (chainId: number | undefined) => {
  return networks[chainId || 1] || networks[1];
};
