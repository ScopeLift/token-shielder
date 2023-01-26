import { useState } from 'react';
import { parseUnits } from '@ethersproject/units';
import { populateShield, populateShieldBaseToken } from '@railgun-community/quickstart';
import {
  NETWORK_CONFIG,
  RailgunERC20Amount,
  RailgunERC20AmountRecipient,
  deserializeTransaction,
} from '@railgun-community/shared-models';
import { ethers } from 'ethers';
import { useAccount, useSigner } from 'wagmi';
import { useNetwork } from 'wagmi';
import useShieldPrivateKey from '@/hooks/useShieldPrivateKey';
import { ethAddress } from '@/utils/constants';
import { networks } from '@/utils/networks';

const useRailgunTx = () => {
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const { getShieldPrivateKey } = useShieldPrivateKey();
  const { chain } = useNetwork();
  const chainId = chain?.id || 1; // default to mainnet if no chain id
  const { railgunNetworkName: network, wethAddress } = networks[chainId];
  const [isShielding, setIsShielding] = useState(false);

  const shield = async (args: {
    tokenAddress: string;
    tokenAmount: string;
    tokenDecimals: number;
    recipient: string;
  }) => {
    setIsShielding(true);
    try {
      const resp =
        args.tokenAddress === ethAddress ? await shieldBaseToken(args) : await shieldToken(args);
      setIsShielding(false);
      return resp;
    } catch (e) {
      console.error(e);
      setIsShielding(false);
    }
  };

  const shieldBaseToken = async ({
    tokenAmount,
    tokenDecimals,
    recipient,
  }: {
    tokenAddress: string;
    tokenAmount: string;
    tokenDecimals: number;
    recipient: string;
  }) => {
    // The shieldPrivateKey enables the sender to decrypt
    // the receiver's address in the future.
    const shieldPrivateKey = await getShieldPrivateKey();

    const wrappedERC20Amount: RailgunERC20Amount = {
      tokenAddress: wethAddress, // wETH
      amountString: parseUnits(tokenAmount!, tokenDecimals).toHexString(), // hexadecimal amount
    };

    const { serializedTransaction, error } = await populateShieldBaseToken(
      network,
      recipient,
      shieldPrivateKey,
      wrappedERC20Amount
    );
    if (error) {
      throw error;
    }

    const { chain } = NETWORK_CONFIG[network];

    const transactionRequest: ethers.providers.TransactionRequest = deserializeTransaction(
      serializedTransaction!,
      undefined, // nonce (optional)
      chain.id
    );

    // Public wallet to shield from.
    transactionRequest.from = address;
    transactionRequest.gasPrice = undefined;
    transactionRequest.gasLimit = undefined;

    return signer?.sendTransaction(transactionRequest);
  };

  const shieldToken = async ({
    tokenAddress,
    tokenAmount,
    recipient,
    tokenDecimals,
  }: {
    tokenAddress: string;
    tokenAmount: string;
    tokenDecimals: number;
    recipient: string;
  }) => {
    // The shieldPrivateKey enables the sender to decrypt
    // the receiver's address in the future.
    const shieldPrivateKey = await getShieldPrivateKey();

    // Formatted token amounts and recipients.
    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: tokenAddress!,
        amountString: ethers.utils.parseUnits(tokenAmount, tokenDecimals).toHexString(), // must be hex
        recipientAddress: recipient!, // RAILGUN address
      },
    ];

    const { serializedTransaction, error } = await populateShield(
      network,
      shieldPrivateKey,
      erc20AmountRecipients,
      [] // nftAmountRecipients
    );
    if (error) {
      throw error;
    }

    const { chain } = NETWORK_CONFIG[network];

    const transactionRequest: ethers.providers.TransactionRequest = deserializeTransaction(
      serializedTransaction as string,
      undefined, // nonce (optional)
      chain.id
    );

    // Public wallet to shield from.
    transactionRequest.from = address;
    transactionRequest.gasPrice = undefined;
    transactionRequest.gasLimit = undefined;

    return signer?.sendTransaction(transactionRequest);
  };

  return { shield, isShielding };
};

export default useRailgunTx;
