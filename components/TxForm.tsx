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
} from "@railgun-community/quickstart";
import {
  RailgunERC20AmountRecipient,
  NetworkName,
} from "@railgun-community/shared-models";
import { Wallet, BigNumber } from "ethers";

export const TxForm = () => {
  // TODO: Placeholder notification for shielding
  const { tokenList } = useToken();
  const { notifyUser } = useNotifications();
  const doSubmit: React.FormEventHandler = async (e) => {
    // Formatted token amounts and recipients.
    const erc20AmountRecipients: RailgunERC20AmountRecipient[] = [
      {
        tokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
        amountString: "0x10", // hexadecimal amount
        recipientAddress: "0zk123...456", // RAILGUN address
      },
      {
        tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
        amountString: "0x20", // hexadecimal amount
        recipientAddress: "0zk987...654", // RAILGUN address
      },
    ];

    // The shieldPrivateKey enables the sender to decrypt
    // the receiver's address in the future.
    const wallet = Wallet.createRandom();
    const shieldSignatureMessage = getShieldPrivateKeySignatureMessage();
    const shieldPrivateKey = keccak256(
      await wallet.signMessage(shieldSignatureMessage)
    );

    // Public wallet to shield from.
    const fromWalletAddress = "0xab5801a7d398351b8be11c439e05c5b3259aec9b";

    const { gasEstimateString, error } = await gasEstimateForShield(
      NetworkName.Ethereum,
      shieldPrivateKey,
      erc20AmountRecipients,
      [], // nftAmountRecipients
      fromWalletAddress
    );
    if (error) {
      console.log(error);
      // Handle gas estimate error.
    }

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
