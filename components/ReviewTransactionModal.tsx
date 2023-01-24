import useNotifications from "@/hooks/useNotifications";
import useRailgunTx from "@/hooks/useRailgunTx";
import { shortenAddress } from "@/utils/address";
import { Button } from "@chakra-ui/button";
import { Heading, Flex, Text } from "@chakra-ui/layout";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils.js";
import React from "react";

type ReviewTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress?: string;
  recipient: string;
  tokenAmount?: string;
  tokenDecimals?: number;
  tokenSymbol: string;
  tokenName: string;
};

const ReviewTransactionModal = ({
  isOpen,
  onClose,
  tokenAddress,
  recipient,
  tokenAmount,
  tokenDecimals,
  tokenSymbol,
  tokenName,
}: ReviewTransactionModalProps) => {
  const { txNotify } = useNotifications();
  const { shield, isShielding } = useRailgunTx();
  const bigNumberAmount = parseUnits(tokenAmount! || "0", tokenDecimals);
  const feeAmount = parseUnits(tokenAmount! || "0", tokenDecimals).div("400");

  const doSubmit: React.FormEventHandler = async () => {
    // TODO: Form validation
    if (!tokenAddress || !tokenAmount || !tokenDecimals || !recipient)
      throw new Error("bad form");
    const tx = await shield({
      tokenAddress,
      tokenAmount,
      tokenDecimals,
      recipient,
    });
    txNotify(tx!.hash);
    onClose();
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm Shield</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column">
            <Flex
              direction="column"
              borderRadius="1.5rem"
              border="1px solid black"
              padding="1rem"
            >
              <Flex align="center" justify="space-between">
                <Heading size="xs" paddingX={2}>
                  Recipient
                </Heading>
                <Tooltip label={recipient}>
                  <Text size="sm" textOverflow="ellipsis">
                    {shortenAddress(recipient)}
                  </Text>
                </Tooltip>
              </Flex>
              <Flex align="center" justify="space-between">
                <Heading size="xs" paddingX={2}>
                  Token name
                </Heading>
                <Text size="sm">{tokenName}</Text>
              </Flex>
              <Flex align="center" justify="space-between">
                <Heading size="xs" paddingX={2}>
                  Amount
                </Heading>
                <Text size="sm">
                  {ethers.utils.formatUnits(bigNumberAmount, tokenDecimals)}{" "}
                  {tokenSymbol}
                </Text>
              </Flex>
              <Flex align="center" justify="space-between">
                <Heading size="xs" paddingX={2}>
                  Shielding fee
                </Heading>
                <Text size="sm">
                  {ethers.utils.formatUnits(feeAmount, tokenDecimals)}{" "}
                  {tokenSymbol}
                </Text>
              </Flex>
            </Flex>
          </Flex>
          <Button
            isDisabled={isShielding}
            isLoading={isShielding}
            onClick={doSubmit}
            w="100%"
            mt="1.5rem"
            mb="1rem"
          >
            Shield
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ReviewTransactionModal;
