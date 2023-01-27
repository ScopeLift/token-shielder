import { assertValidRailgunAddress } from '@railgun-community/quickstart';

export const shortenAddress = (address: string) => {
  return `${address.slice(0, 7)}...${address.slice(-4)}`;
};
