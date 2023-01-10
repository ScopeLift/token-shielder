import { isHexString } from "@ethersproject/bytes";

export type NetworkConfig = {
  blockExplorerUrl: string;
  tokenList: string;
};

export const networks = {
  1: {
    blockExplorerUrl: "https://etherscan.io/",
    tokenList: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
  },
  5: {
    blockExplorerUrl: "https://goerli.etherscan.io/",
    tokenList: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
  },
  56: {
    blockExplorerUrl: "https://bscxplorer.com/",
    tokenList: "pancakeswap-top-100.json", // TODO: We may want to move this list to a more anchored url
  },
  137: {
    blockExplorerUrl: "https://polygonscan.com/",
    tokenList: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
  },
  42161: {
    blockExplorerUrl: "https://arbiscan.io/",
    tokenList: "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
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
