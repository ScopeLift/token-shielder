import { createRailgunWallet } from "@railgun-community/quickstart";
import { entropyToMnemonic, hexValue, randomBytes } from "ethers/lib/utils.js";

/**
 * @notice Tool to generate a random railgun address.
 * @returns Railgun address (0zk...123).
 */
export const randomWalletAddress = async () => {
  const railgunWallet = await createRailgunWallet(
    hexValue(randomBytes(32)),
    entropyToMnemonic(randomBytes(32)),
    undefined
  );
  const { railgunWalletInfo, error } = railgunWallet;
  console.log(railgunWalletInfo);
  if (error) throw error;
  return railgunWalletInfo?.railgunAddress;
};
