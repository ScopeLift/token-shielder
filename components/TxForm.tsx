import { useToken } from "@/contexts/TokenContext";
import useNotifications from "@/hooks/useNotifications";
import useShieldPrivateKey from "@/hooks/useShieldPrivateKey";
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Box, Flex } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
import {
  gasEstimateForShield,
  getRailgunSmartWalletContractForNetwork,
  populateShield,
} from "@railgun-community/quickstart";
import {
  RailgunERC20AmountRecipient,
  NetworkName,
  TransactionGasDetailsSerialized,
  EVMGasType,
  NETWORK_CONFIG,
  deserializeTransaction,
} from "@railgun-community/shared-models";
import { erc20ABI } from "@wagmi/core";
import { ethers, constants, BigNumber } from "ethers";
import { useState } from "react";
import {
  useAccount,
  useSigner,
  usePrepareContractWrite,
  useContractWrite,
  useProvider,
} from "wagmi";

export const TxForm = () => {
  // TODO: Placeholder notification for shielding
  const { tokenList, tokenAllowances } = useToken();
  const network = NetworkName.EthereumGoerli;
  const { txNotify } = useNotifications();
  let abi = [
    "function transfer(address,uint256) returns (bool)",
    "function approve(address,uint256) returns (bool)",
  ];
  console.log(
    getRailgunSmartWalletContractForNetwork(NetworkName.EthereumGoerli).address
  );
  const { isConnected, address } = useAccount();
  const { data: signer } = useSigner();
  const provider = useProvider();
  const { getShieldPrivateKey } = useShieldPrivateKey();
  const { config } = usePrepareContractWrite({
    address: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
    abi: erc20ABI,
    functionName: "approve",
    args: [
      getRailgunSmartWalletContractForNetwork(network).address as `0x{string}`,
      constants.MaxUint256,
    ],
  });
  const { writeAsync: doErc20Approval } = useContractWrite(config);
  const [recipient, setRecipient] = useState<string>(
    "0zk1qyn0qa5rgk7z2l8wyncpynmydgj7ucrrcczhl8k27q2rw5ldvv2qrrv7j6fe3z53ll5j4fjs9j5cmq7mxsaulah7ykk6jwqna3nwvxudp5w6fwyg8cgwkwwv3g4"
  );
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [tokenDecimals, setTokenDecimals] = useState<number>();
  const needsApproval = ethers.utils
    .parseUnits(tokenAmount || "0", tokenDecimals)
    .gt(tokenAllowances.get(tokenAddress || "") || BigNumber.from(0));

  const doSubmit: React.FormEventHandler = async (e) => {
    // TODO: Form validation
    // Formatted token amounts and recipients.
    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: tokenAddress!,
        amountString: ethers.utils
          .parseUnits(tokenAmount!, tokenDecimals)
          .toHexString(), // must be hex
        recipientAddress: recipient!, // RAILGUN address
      },
    ];

    // The shieldPrivateKey enables the sender to decrypt
    // the receiver's address in the future.
    const shieldPrivateKey = await getShieldPrivateKey();

    // Public wallet to shield from.
    const fromWalletAddress = address as `0x{string}`;

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
    // TODO: handle transaction status and notifications in a feature
    const tx = await signer?.sendTransaction(transactionRequest);
    await tx?.wait().then(() => {
      txNotify(tx.hash);
    });
  };

  return (
    <Box width="24rem">
      <FormControl>
        <FormLabel>Recipient address</FormLabel>
        <Input
          type="string"
          variant="outline"
          size="lg"
          pr="4.5rem"
          height="4rem"
          mb=".75rem"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Token</FormLabel>
        <Select
          size="lg"
          height="4rem"
          mb=".75rem"
          onChange={(e) => {
            const { address, decimals } = tokenList[+e.target.value];
            setTokenAddress(address);
            setTokenDecimals(decimals);
          }}
        >
          <option></option>
          {tokenList.map((item, i) => {
            return (
              <option key={item.name} value={i}>
                {item.name}
              </option>
            );
          })}
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel>Amount</FormLabel>
        <InputGroup size="lg" width="auto" height="4rem">
          <Input
            type="number"
            variant="outline"
            size="lg"
            pr="4.5rem"
            height="100%"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
          />
          <InputRightElement width="4.5rem" height="100%">
            <Button size="sm">Max</Button>
          </InputRightElement>
        </InputGroup>
        <Flex justify="flex-end"></Flex>
      </FormControl>
      {needsApproval ? (
        <Button
          size="lg"
          mt="1rem"
          width="100%"
          onClick={async () => {
            if (!doErc20Approval) {
              throw "not prepared";
            }
            await doErc20Approval();
          }}
        >
          Approve
        </Button>
      ) : (
        <Button size="lg" mt="1rem" width="100%" onClick={doSubmit}>
          Shield
        </Button>
      )}
    </Box>
  );
};
