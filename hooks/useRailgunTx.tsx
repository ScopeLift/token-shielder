import { useToken } from "@/contexts/TokenContext";
import useShieldPrivateKey from "@/hooks/useShieldPrivateKey";
import { ethAddress } from "@/utils/constants";
import {
  gasEstimateForShield,
  gasEstimateForShieldBaseToken,
  populateShield,
  populateShieldBaseToken,
} from "@railgun-community/quickstart";
import {
  RailgunERC20AmountRecipient,
  RailgunERC20Amount,
  NetworkName,
  TransactionGasDetailsSerialized,
  EVMGasType,
  NETWORK_CONFIG,
  deserializeTransaction,
} from "@railgun-community/shared-models";
import { ethers } from "ethers";
import { getAddress, parseUnits } from "ethers/lib/utils.js";
import { useAccount, useSigner } from "wagmi";
import { useProvider } from "wagmi";

const useRailgunTx = () => {
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const { getShieldPrivateKey } = useShieldPrivateKey();
  const network = NetworkName.EthereumGoerli;
  const { weth } = useToken();
  const provider = useProvider();

  const shield = async (args: {
    tokenAddress: string;
    tokenAmount: string;
    tokenDecimals: number;
    recipient: string;
  }) => {
    if (args.tokenAddress === ethAddress) return shieldBaseToken(args);
    return shieldToken(args);
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
      tokenAddress: weth!.address, // wETH
      amountString: parseUnits(tokenAmount!, tokenDecimals).toHexString(), // hexadecimal amount
    };

    const { gasEstimateString, error: err } =
      await gasEstimateForShieldBaseToken(
        network,
        recipient,
        shieldPrivateKey,
        wrappedERC20Amount,
        fromWalletAddress
      );
    if (err) {
      throw err;
    }

    const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();

    const gasDetailsSerialized: TransactionGasDetailsSerialized = {
      evmGasType: EVMGasType.Type2, // Depends on the chain (BNB uses type 0)
      gasEstimateString: gasEstimateString!, // Output from gasEstimateForShieldBaseToken
      maxFeePerGasString: maxFeePerGas!.toHexString(), // Current gas Max Fee
      maxPriorityFeePerGasString: maxPriorityFeePerGas!.toHexString(), // Current gas Max Priority Fee
    };

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

    const transactionRequest: ethers.providers.TransactionRequest =
      deserializeTransaction(
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
        amountString: ethers.utils
          .parseUnits(tokenAmount, tokenDecimals)
          .toHexString(), // must be hex
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

    const { maxFeePerGas, maxPriorityFeePerGas } = await provider.getFeeData();
    const gasDetailsSerialized: TransactionGasDetailsSerialized = {
      evmGasType: EVMGasType.Type2, // Depends on the chain (BNB uses type 0)
      gasEstimateString: gasEstimateString!, // Output from gasEstimateForShield
      maxFeePerGasString: maxFeePerGas!.toHexString(), // Current gas Max Fee
      maxPriorityFeePerGasString: maxPriorityFeePerGas!.toHexString(), // Current gas Max Priority Fee
    };

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

    const transactionRequest: ethers.providers.TransactionRequest =
      deserializeTransaction(
        serializedTransaction as string,
        undefined, // nonce (optional)
        chain.id
      );

    // Public wallet to shield from.
    transactionRequest.from = address;
    return signer?.sendTransaction(transactionRequest);
  };

  return { shield };
};

export default useRailgunTx;
