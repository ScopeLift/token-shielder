import React from 'react';
import { Button } from '@chakra-ui/button';
import { Code, Flex, Heading, Text } from '@chakra-ui/layout';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { Alert, AlertIcon } from '@chakra-ui/react';
import { Tooltip } from '@chakra-ui/tooltip';
import { getShieldPrivateKeySignatureMessage } from '@railgun-community/quickstart';
import { ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils.js';
import { useNetwork } from 'wagmi';
import { TokenListContextItem, useToken } from '@/contexts/TokenContext';
import useNotifications from '@/hooks/useNotifications';
import useRailgunTx from '@/hooks/useRailgunTx';
import useShieldPrivateKey from '@/hooks/useShieldPrivateKey';
import { shortenAddress } from '@/utils/address';

type ReviewTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recipient: string;
  displayName: string;
  token: TokenListContextItem;
  amount: string;
  onSubmitClick: () => void;
};

const ReviewTransactionModal = ({
  isOpen,
  onClose,
  recipient,
  amount,
  displayName,
  token,
  onSubmitClick,
}: ReviewTransactionModalProps) => {
  const { shieldingFees } = useToken();
  const { txNotify, notifyUser } = useNotifications();
  const { shield, isShielding } = useRailgunTx();
  const { shieldPrivateKey } = useShieldPrivateKey();
  const { chain } = useNetwork();
  const tokenAmount = amount;
  const tokenDecimals = token?.decimals;

  const bigNumberAmount = parseUnits(tokenAmount! || '0', tokenDecimals);
  const shieldFee = shieldingFees[chain?.id || 1] || shieldingFees[1];
  const feeAmount = parseUnits(tokenAmount! || '0', tokenDecimals)
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
                    {displayName === recipient ? shortenAddress(displayName) : displayName}
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
          {!shieldPrivateKey && (
            <Alert status="info" mt=".5rem">
              <AlertIcon />
              <div>
                You will first be prompted to sign the message{' '}
                <Code>{getShieldPrivateKeySignatureMessage()}</Code>, enabling you to decrypt the
                receiving address in the future.
              </div>
            </Alert>
          )}
          <Button
            isDisabled={isShielding}
            isLoading={isShielding}
            onClick={doSubmit}
            w="100%"
            mt=".5rem"
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
