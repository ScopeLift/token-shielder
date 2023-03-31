import { ethers } from 'ethers';

export const ethersParsable = (tokenAmount: string, decimals: number) => {
  try {
    ethers.utils.parseUnits(tokenAmount || '0', decimals);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
