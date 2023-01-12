import { isHexString } from "@ethersproject/bytes";

export type NetworkConfig = {
  blockExplorerUrl: string;
  tokenListUrl: string;
};

export const networks = {
  1: {
    blockExplorerUrl: "https://etherscan.io/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
  },
  5: {
    blockExplorerUrl: "https://goerli.etherscan.io/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
  },
  56: {
    blockExplorerUrl: "https://bscxplorer.com/",
    tokenListUrl: "pancakeswap-top-100.json",
  },
  137: {
    blockExplorerUrl: "https://polygonscan.com/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
  },
  42161: {
    blockExplorerUrl: "https://arbiscan.io/",
    tokenListUrl: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
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
