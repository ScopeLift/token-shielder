import { isHexString } from "@ethersproject/bytes";
import { NetworkName } from "@railgun-community/shared-models";
import { mainnet, goerli } from "wagmi";
import { bsc, polygon, arbitrum } from "wagmi/chains";

export type NetworkConfig = {
  blockExplorerUrl: string;
  tokenListUrl: string;
  railgunNetworkName: NetworkName;
  chainId: number;
};

export const networks = {
  [mainnet.id]: {
    blockExplorerUrl: "https://etherscan.io/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
    railgunNetworkName: NetworkName.Ethereum,
    chainId: mainnet.id,
  },
  [goerli.id]: {
    blockExplorerUrl: "https://goerli.etherscan.io/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
    railgunNetworkName: NetworkName.EthereumGoerli,
    chainId: goerli.id,
  },
  [bsc.id]: {
    blockExplorerUrl: "https://bscxplorer.com/",
    tokenListUrl: "pancakeswap-top-100.json",
    railgunNetworkName: NetworkName.BNBChain,
    chainId: bsc.id,
  },
  [polygon.id]: {
    blockExplorerUrl: "https://polygonscan.com/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
    railgunNetworkName: NetworkName.Polygon,
    chainId: polygon.id,
  },
  [arbitrum.id]: {
    blockExplorerUrl: "https://arbiscan.io/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
    railgunNetworkName: NetworkName.ArbitrumGoerli, // TODO: Regular arbitrum is missing from railgun-community
    chainId: arbitrum.id,
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
