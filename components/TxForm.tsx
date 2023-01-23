import ReviewTransactionModal from "@/components/ReviewTransactionModal";
import TokenInput from "@/components/TokenInput";
import { useToken } from "@/contexts/TokenContext";
import useNotifications from "@/hooks/useNotifications";
import { ethAddress } from "@/utils/constants";
import { networks } from "@/utils/networks";
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Box, Flex } from "@chakra-ui/layout";
import { useDisclosure } from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { getRailgunSmartWalletContractForNetwork } from "@railgun-community/quickstart";
import { erc20ABI } from "@wagmi/core";
import { ethers, constants, BigNumber } from "ethers";
import React, { useState } from "react";
import { usePrepareContractWrite, useContractWrite, useNetwork } from "wagmi";

export const TxForm = () => {
  // TODO: Placeholder notification for shielding
  const { tokenList, tokenAllowances } = useToken();
  const { chain } = useNetwork();
  const network = networks[chain?.id || 1];
  const { notifyUser } = useNotifications();
  const {
    isOpen: isReviewOpen,
    onOpen: onReviewOpen,
    onClose: onReviewClose,
  } = useDisclosure();
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [tokenDecimals, setTokenDecimals] = useState<number>();
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [tokenName, setTokenName] = useState<string>("");
  const { config } = usePrepareContractWrite({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: "approve",
    args: [
      getRailgunSmartWalletContractForNetwork(network.railgunNetworkName)
        .address as `0x{string}`,
      constants.MaxUint256,
    ],
  });
  const { writeAsync: doErc20Approval } = useContractWrite(config);
  const [recipient, setRecipient] = useState<string>(
    "0zk1qyn0qa5rgk7z2l8wyncpynmydgj7ucrrcczhl8k27q2rw5ldvv2qrrv7j6fe3z53ll5j4fjs9j5cmq7mxsaulah7ykk6jwqna3nwvxudp5w6fwyg8cgwkwwv3g4"
  );
  const needsApproval =
    tokenAddress !== ethAddress &&
    ethers.utils
      .parseUnits(tokenAmount || "0", tokenDecimals)
      .gt(tokenAllowances.get(tokenAddress || "") || BigNumber.from(0));

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
<<<<<<< HEAD
        <Select
          size="lg"
          height="4rem"
          mb=".75rem"
          onChange={(e) => {
            const { address, decimals, symbol, name } =
              tokenList[+e.target.value];
            setTokenAddress(address);
            setTokenDecimals(decimals);
            setTokenSymbol(symbol);
            setTokenName(name);
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
=======
        <TokenInput />
>>>>>>> 6715644 (Made some progress)
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
              notifyUser({
                alertType: "error",
                message:
                  "Page is not prepared for ERC20 approval. Please try again in a few seconds",
              });
              return;
            }
            await doErc20Approval();
          }}
        >
          Approve
        </Button>
      ) : (
        <Button size="lg" mt="1rem" width="100%" onClick={onReviewOpen}>
          Shield
        </Button>
      )}
      <ReviewTransactionModal
        isOpen={isReviewOpen}
        onClose={onReviewClose}
        recipient={recipient}
        tokenAmount={tokenAmount}
        tokenDecimals={tokenDecimals}
        tokenAddress={tokenAddress}
        tokenSymbol={tokenSymbol}
        tokenName={tokenName}
      />
    </Box>
  );
};

//        <Select
//          size="lg"
//          height="4rem"
//          mb=".75rem"
//          onChange={(e) => {
//            const { address, decimals } = tokenList[+e.target.value];
//            setTokenAddress(address);
//            setTokenDecimals(decimals);
//          }}
//        >
//          <option></option>
//          {tokenList.map((item, i) => {
//            return (
//              <option key={item.name} value={i}>
//                {item.name}
//              </option>
//            );
//          })}
//        </Select>
