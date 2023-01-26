import { useState } from 'react';
import { parseUnits } from '@ethersproject/units';
import {
  gasEstimateForShield,
  gasEstimateForShieldBaseToken,
  populateShield,
  populateShieldBaseToken,
} from '@railgun-community/quickstart';
import {
  EVMGasType,
  NETWORK_CONFIG,
  NetworkName,
  RailgunERC20Amount,
  RailgunERC20AmountRecipient,
  TransactionGasDetailsSerialized,
  deserializeTransaction,
} from '@railgun-community/shared-models';
import { ethers } from 'ethers';
import { useAccount, useSigner } from 'wagmi';
import { useProvider } from 'wagmi';
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
  const { railgunNetworkName: network, evmGasType, wethAddress } = networks[chainId];
  const provider = useProvider();
  const [isShielding, setIsShielding] = useState(false);

  const shield = async (args: {
    tokenAddress: string;
    tokenAmount: string;
    tokenDecimals: number;
    recipient: string;
  }) => {
    setIsShielding(true);
    const resp =
      args.tokenAddress === ethAddress ? await shieldBaseToken(args) : await shieldToken(args);
    setIsShielding(false);
    return resp;
  };

  const getGasDetailsSerialized = async (
    gasEstimateString: string
  ): Promise<TransactionGasDetailsSerialized> => {
    const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await provider
      .getFeeData()
      .then((data) => {
        if (network === NetworkName.Polygon) {
          // TODO: polygon gas
        }
        return data;
      });
    // evmGasType depends on the chain. BNB uses type 0.
    if (evmGasType === EVMGasType.Type0)
      return {
        evmGasType,
        gasEstimateString,
        gasPriceString: gasPrice!.toHexString(),
      };
    if (evmGasType === EVMGasType.Type2)
      return {
        evmGasType,
        gasEstimateString,
        maxFeePerGasString: maxFeePerGas!.toHexString(), // Current gas Max Fee
        maxPriorityFeePerGasString: maxPriorityFeePerGas!.toHexString(), // Current gas Max Priority Fee
      };
    throw new Error('Unsupported gas type for chain');
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
    // Public wallet to shield from.
    const fromWalletAddress = address as `0x{string}`;

    // The shieldPrivateKey enables the sender to decrypt
    // the receiver's address in the future.
    const shieldPrivateKey = await getShieldPrivateKey();

    const wrappedERC20Amount: RailgunERC20Amount = {
      tokenAddress: wethAddress, // wETH
      amountString: parseUnits(tokenAmount!, tokenDecimals).toHexString(), // hexadecimal amount
    };

    const { gasEstimateString, error: err } = await gasEstimateForShieldBaseToken(
      network,
      recipient,
      shieldPrivateKey,
      wrappedERC20Amount,
      fromWalletAddress
    );
    if (err) {
      throw err;
    }

    const gasDetailsSerialized = await getGasDetailsSerialized(gasEstimateString!);

    const { serializedTransaction, error } = await populateShieldBaseToken(
      network,
      recipient,
      shieldPrivateKey,
      wrappedERC20Amount,
      gasDetailsSerialized
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

    return signer?.sendTransaction(transactionRequest);
  };

  const shieldToken = async ({
    tokenAddress,
    tokenAmount,
    tokenDecimals,
    recipient,
  }: {
    tokenAddress: string;
    tokenAmount: string;
    tokenDecimals: number;
    recipient: string;
  }) => {
    // Public wallet to shield from.
    const fromWalletAddress = address as `0x{string}`;

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

    const { gasEstimateString, error: err } = await gasEstimateForShield(
      network,
      shieldPrivateKey,
      erc20AmountRecipients,
      [], // nftAmountRecipients
      fromWalletAddress
    );

    if (err) {
      throw err;
    }

    const gasDetailsSerialized = await getGasDetailsSerialized(gasEstimateString!);

    const { serializedTransaction, error } = await populateShield(
      network,
      shieldPrivateKey,
      erc20AmountRecipients,
      [], // nftAmountRecipients
      gasDetailsSerialized
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
    return signer?.sendTransaction(transactionRequest);
  };

  return { shield, isShielding };
};

export default useRailgunTx;
