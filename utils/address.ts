import { assertValidRailgunAddress } from '@railgun-community/quickstart';

export const shortenAddress = (address: string) => {
  assertValidRailgunAddress(address); // Will throw error on incorrect value
  return `${address.slice(0, 7)}...${address.slice(-4)}`;
};
