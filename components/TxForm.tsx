import { useToken } from "@/contexts/TokenContext";
import useNotifications from "@/hooks/useNotifications";
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Box, Flex } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
import { keccak256 } from "@railgun-community/engine";
import {
  getShieldPrivateKeySignatureMessage,
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
import { BigNumber, Signer, ethers, constants } from "ethers";
import {
  useAccount,
  useSigner,
  usePrepareContractWrite,
  useContractWrite,
  useProvider,
} from "wagmi";

export const TxForm = () => {
  // TODO: Placeholder notification for shielding
  const { tokenList } = useToken();
  const { notifyUser } = useNotifications();
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
  const { config } = usePrepareContractWrite({
    address: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6",
    abi,
    functionName: "approve",
    args: [
      getRailgunSmartWalletContractForNetwork(NetworkName.EthereumGoerli)
        .address,
      constants.MaxUint256,
    ],
  });
  const { writeAsync: doErc20Approval } = useContractWrite(config);

  const doSubmit: React.FormEventHandler = async (e) => {
    // Formatted token amounts and recipients.
    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6", // goerli weth
        amountString: "0x10", // hexadecimal amount
        recipientAddress:
          "0zk1qyn0qa5rgk7z2l8wyncpynmydgj7ucrrcczhl8k27q2rw5ldvv2qrrv7j6fe3z53ll5j4fjs9j5cmq7mxsaulah7ykk6jwqna3nwvxudp5w6fwyg8cgwkwwv3g4", // RAILGUN address
      },
    ];

    // The shieldPrivateKey enables the sender to decrypt
    // the receiver's address in the future.
    const shieldPrivateKey = keccak256(
      await (signer as Signer).signMessage(
        getShieldPrivateKeySignatureMessage()
      )
    );

    // if (!doErc20Approval) throw "not prepared";
    // await doErc20Approval();

    // Public wallet to shield from.
    const fromWalletAddress = address as `0x{string}`;

    const { gasEstimateString, error: err } = await gasEstimateForShield(
      NetworkName.EthereumGoerli,
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
      NetworkName.EthereumGoerli,
      shieldPrivateKey,
      erc20AmountRecipients,
      [], // nftAmountRecipients
      gasDetailsSerialized
    );
    if (error) {
      throw error;
    }
    console.log(gasEstimateString);
    const gasEstimate = BigNumber.from(gasEstimateString);
    console.log(gasEstimate);

    const { chain } = NETWORK_CONFIG[NetworkName.EthereumGoerli];

    const transactionRequest: ethers.providers.TransactionRequest =
      deserializeTransaction(
        serializedTransaction as string,
        undefined, // nonce (optional)
        chain.id
      );

    // Public wallet to shield from.
    transactionRequest.from = address;
    const tx = await signer?.sendTransaction(transactionRequest);
    console.log(tx);
    await tx?.wait().then(() => {
      notifyUser({
        alertType: "success",
        message: "Token was shielded successfully",
      });
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
          placeholder="vitalik.eth"
          pr="4.5rem"
          height="4rem"
          mb=".75rem"
        />
      </FormControl>
      <FormControl>
        <FormLabel>Token</FormLabel>
        <Select size="lg" height="4rem" mb=".75rem">
          {tokenList.map((item) => {
            return (
              <option key={item.name} value={item.name}>
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
            placeholder="0"
            pr="4.5rem"
            height="100%"
          />
          <InputRightElement width="4.5rem" height="100%">
            <Button size="sm">Max</Button>
          </InputRightElement>
        </InputGroup>
        <Flex justify="flex-end"></Flex>
      </FormControl>
      <Button size="lg" mt="1rem" width="100%" onClick={doSubmit}>
        Shield
      </Button>
    </Box>
  );
};
