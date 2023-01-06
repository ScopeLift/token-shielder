import { isHexString } from "@ethersproject/bytes";

export type NetworkConfig = {
  blockExplorerUrl: string;
};

export const networks = {
  1: {
    blockExplorerUrl: "https://etherscan.io/",
  },
  5: {
    blockExplorerUrl: "https://goerli.etherscan.io/",
  },
  56: {
    blockExplorerUrl: "https://bscxplorer.com/",
  },
  137: {
    blockExplorerUrl: "https://polygonscan.com/",
  },
  42161: {
    blockExplorerUrl: "https://arbiscan.io/",
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
