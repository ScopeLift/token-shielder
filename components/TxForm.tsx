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
  startRailgunEngine,
  loadProvider,
  ArtifactStore,
  setLoggers,
  getRailgunSmartWalletContractForNetwork,
} from "@railgun-community/quickstart";
import {
  RailgunERC20AmountRecipient,
  NetworkName,
  FallbackProviderJsonConfig,
} from "@railgun-community/shared-models";
import { Wallet, BigNumber, utils, Signer, ethers, constants } from "ethers";
import LevelDB from "level-js";
import localforage from "localforage";
import {
  useAccount,
  useSigner,
  usePrepareContractWrite,
  useContractWrite,
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
  const { writeAsync } = useContractWrite(config);

  const doSubmit: React.FormEventHandler = async (e) => {
    // Formatted token amounts and recipients.
    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6", // goerli weth
        amountString: "0x10", // hexadecimal amount
        recipientAddress:
          "0zk1qyxxgmvh5pcmxjy6fulfjxdxrz5f0gpmgl8fvm6s6ucg4frjekq4erv7j6fe3z53lul3xmu43hg3r7sgnsxq90ktfc8aznrakvknz2q0rpexxyr4mdfhyafx9g0", // RAILGUN address
      },
    ];

    // The shieldPrivateKey enables the sender to decrypt
    // the receiver's address in the future.
    const shieldPrivateKey = keccak256(
      await (signer as Signer).signMessage(
        getShieldPrivateKeySignatureMessage()
      )
    );
    if (!writeAsync) throw "not prepared";
    await writeAsync();
    // Public wallet to shield from.
    const fromWalletAddress = address as `0x{string}`;

    const { gasEstimateString, error } = await gasEstimateForShield(
      NetworkName.EthereumGoerli,
      shieldPrivateKey,
      erc20AmountRecipients,
      [], // nftAmountRecipients
      fromWalletAddress
    );

    if (error) {
      throw error;
    }
    console.log(gasEstimateString);
    const gasEstimate = BigNumber.from(gasEstimateString);
    console.log(gasEstimate);
    notifyUser({
      alertType: "success",
      message: "Token was shielded successfully",
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
