import { isHexString } from "@ethersproject/bytes";
import { NetworkName } from "@railgun-community/shared-models";

export type NetworkConfig = {
  blockExplorerUrl: string;
  tokenListUrl: string;
  railgunNetworkName: NetworkName;
};

export const networks = {
  1: {
    blockExplorerUrl: "https://etherscan.io/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
    railgunNetworkName: NetworkName.Ethereum,
  },
  5: {
    blockExplorerUrl: "https://goerli.etherscan.io/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
    railgunNetworkName: NetworkName.EthereumGoerli,
  },
  56: {
    blockExplorerUrl: "https://bscxplorer.com/",
    tokenListUrl: "pancakeswap-top-100.json",
    railgunNetworkName: NetworkName.BNBChain,
  },
  137: {
    blockExplorerUrl: "https://polygonscan.com/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
    railgunNetworkName: NetworkName.Polygon,
  },
  42161: {
    blockExplorerUrl: "https://arbiscan.io/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
    railgunNetworkName: NetworkName.ArbitrumGoerli, // TODO: Regular arbitrum is missing from railgun-community
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
