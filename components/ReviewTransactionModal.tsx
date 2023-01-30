import React from 'react';
import { Button } from '@chakra-ui/button';
import { Flex, Heading, Text } from '@chakra-ui/layout';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { Tooltip } from '@chakra-ui/tooltip';
import { ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils.js';
import { useNetwork } from 'wagmi';
import { TokenListContextItem } from '@/contexts/TokenContext';
import useNotifications from '@/hooks/useNotifications';
import { useRailgunProvider } from '@/hooks/useRailgunProvider';
import useRailgunTx from '@/hooks/useRailgunTx';
import { shortenAddress } from '@/utils/address';

type ReviewTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recipient: string;
  token: TokenListContextItem;
  amount: string;
  onSubmitClick: () => void;
};

const ReviewTransactionModal = ({
  isOpen,
  onClose,
  recipient,
  amount,
  token,
  onSubmitClick,
}: ReviewTransactionModalProps) => {
  const { txNotify, notifyUser } = useNotifications();
  const { shield, isShielding } = useRailgunTx();
  const { shieldFees } = useRailgunProvider();
  const { chain } = useNetwork();
  const tokenAmount = amount;
  const tokenDecimals = token?.decimals;
  const bigNumberAmount = parseUnits(tokenAmount || '0', tokenDecimals);
  const shieldFee = shieldFees[chain?.id || 1];
  const feeAmount = parseUnits(tokenAmount || '0', tokenDecimals)
    .mul(shieldFee)
    .div(10000);

  const doSubmit: React.FormEventHandler = async () => {
    if (!token.address || !amount || !token?.decimals || !recipient) throw new Error('bad form');
    const tx = await shield({
      tokenAddress: token.address,
      tokenAmount: amount,
      tokenDecimals: token?.decimals,
      recipient,
    });
    if (tx) {
      txNotify(tx.hash);
    } else {
      notifyUser({
        alertType: 'error',
        message: 'Failed to create a shield transaction',
      });
    }
    onClose();
    onSubmitClick();
  };

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm Shield</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column">
            <Flex direction="column" borderRadius="1.5rem" border="1px solid black" padding="1rem">
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
                <Text size="sm">{token?.name}</Text>
              </Flex>
              <Flex align="center" justify="space-between">
                <Heading size="xs" paddingX={2}>
                  Amount
                </Heading>
                <Text size="sm">
                  {ethers.utils.formatUnits(bigNumberAmount, token?.decimals)} {token?.symbol}
                </Text>
              </Flex>
              <Flex align="center" justify="space-between">
                <Heading size="xs" paddingX={2}>
                  Shielding fee
                </Heading>
                <Text size="sm">
                  {ethers.utils.formatUnits(feeAmount, token?.decimals)} {token?.symbol}
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
