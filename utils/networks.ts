import { isHexString } from "@ethersproject/bytes";
import { NetworkName } from "@railgun-community/shared-models";
import { EVMGasType } from "@railgun-community/shared-models";
import { FallbackProviderJsonConfig } from "@railgun-community/shared-models";
import { mainnet, goerli } from "wagmi";
import { bsc, polygon, arbitrum } from "wagmi/chains";

export type NetworkConfig = {
  blockExplorerUrl: string;
  tokenListUrl: string;
  railgunNetworkName: NetworkName;
  chainId: number;
  wethAddress: string;
  evmGasType: EVMGasType;
  baseToken: { symbol: string; name: string };
  fallbackProviders: FallbackProviderJsonConfig;
};

export const networks = {
  [mainnet.id]: {
    blockExplorerUrl: "https://etherscan.io/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
    railgunNetworkName: NetworkName.Ethereum,
    chainId: mainnet.id,
    wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    evmGasType: EVMGasType.Type2,
    baseToken: {
      symbol: "ETH",
      name: "Ether",
    },
    fallbackProviders: {
      chainId: mainnet.id,
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
    },
  },
  [goerli.id]: {
    blockExplorerUrl: "https://goerli.etherscan.io/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
    railgunNetworkName: NetworkName.EthereumGoerli,
    chainId: goerli.id,
    wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    evmGasType: EVMGasType.Type2,
    baseToken: {
      symbol: "GoerliETH",
      name: "Goerli Ether",
    },
    fallbackProviders: {
      chainId: goerli.id,
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
    },
  },
  [bsc.id]: {
    blockExplorerUrl: "https://bscxplorer.com/",
    tokenListUrl: "pancakeswap-top-100.json",
    railgunNetworkName: NetworkName.BNBChain,
    chainId: bsc.id,
    wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    evmGasType: EVMGasType.Type0,
    baseToken: {
      symbol: "BNB",
      name: "Binance coin",
    },
    fallbackProviders: {
      chainId: bsc.id,
      providers: [
        {
          provider: "https://bsc-dataseed1.binance.org/",
          priority: 1,
          weight: 1,
        },
      ],
    },
  },
  [polygon.id]: {
    blockExplorerUrl: "https://polygonscan.com/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
    railgunNetworkName: NetworkName.Polygon,
    chainId: polygon.id,
    wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    evmGasType: EVMGasType.Type2,
    baseToken: {
      symbol: "MATIC",
      name: "Polygon",
    },
    fallbackProviders: {
      chainId: polygon.id,
      providers: [
        {
          provider: "https://rpc.ankr.com/polygon",
          priority: 2,
          weight: 1,
        },
        {
          provider: "https://rpc-mainnet.maticvigil.com",
          priority: 1,
          weight: 1,
        },
      ],
    },
  },
  [arbitrum.id]: {
    blockExplorerUrl: "https://arbiscan.io/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
    railgunNetworkName: NetworkName.ArbitrumGoerli, // TODO: Regular arbitrum is missing from railgun-community
    chainId: arbitrum.id,
    wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    evmGasType: EVMGasType.Type2,
    baseToken: {
      symbol: "ETH",
      name: "Ether",
    },
    fallbackProviders: {
      chainId: arbitrum.id,
      providers: [
        {
          provider: "https://arb1.arbitrum.io/rpc",
          priority: 1,
          weight: 1,
        },
      ],
    },
  },
} as { [key: number]: NetworkConfig };

export const getEtherscanUrl = (txHashOrAddress: string, chainId: number) => {
  const group = isHexString(txHashOrAddress)
    ? txHashOrAddress.length === 42
      ? "address"
      : "tx"
    : "ens";
  const chain = networks[chainId];
  const networkPrefix = chain?.blockExplorerUrl
    ? chain?.blockExplorerUrl
    : "https://etherscan.io";
  if (group === "ens") {
    return `${networkPrefix}`;
  } else {
    return `${networkPrefix}/${group}/${txHashOrAddress}`;
  }
};
