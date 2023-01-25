import { isHexString } from "@ethersproject/bytes";
import { NetworkName } from "@railgun-community/shared-models";
import { EVMGasType } from "@railgun-community/shared-models";
import { FallbackProviderJsonConfig } from "@railgun-community/shared-models";
import { mainnet, goerli } from "wagmi";
import { bsc, polygon, arbitrum } from "wagmi/chains";

export type NetworkConfig = {
  blockExplorerUrl: string;
  railgunNetworkName: NetworkName;
  chainId: number;
  wethAddress: string;
  evmGasType: EVMGasType;
  baseToken: { symbol: string; name: string; logoURI: string };
  fallbackProviders: FallbackProviderJsonConfig;
};

export const networks = {
  [mainnet.id]: {
    blockExplorerUrl: "https://etherscan.io/",
    railgunNetworkName: NetworkName.Ethereum,
    chainId: mainnet.id,
    wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    evmGasType: EVMGasType.Type2,
    baseToken: {
      symbol: "ETH",
      name: "Ether",
      logoURI: "",
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
    railgunNetworkName: NetworkName.EthereumGoerli,
    chainId: goerli.id,
    wethAddress: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    evmGasType: EVMGasType.Type2,
    baseToken: {
      symbol: "ETH",
      name: "Ether",
      logoURI: "",
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
    blockExplorerUrl: "https://bscscan.com/",
    railgunNetworkName: NetworkName.BNBChain,
    chainId: bsc.id,
    wethAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    evmGasType: EVMGasType.Type0,
    baseToken: {
      symbol: "BNB",
      name: "Binance coin",
      logoURI: "",
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
    railgunNetworkName: NetworkName.Polygon,
    chainId: polygon.id,
    wethAddress: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
    evmGasType: EVMGasType.Type2,
    baseToken: {
      symbol: "MATIC",
      name: "MATIC",
      logoURI: "",
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
