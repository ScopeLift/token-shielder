import React, { useEffect, useState } from 'react';
import { Button } from '@chakra-ui/button';
import { InfoIcon } from '@chakra-ui/icons';
import { Code, Flex, Heading, Text } from '@chakra-ui/layout';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { Alert, AlertIcon, HStack } from '@chakra-ui/react';
import { Tooltip } from '@chakra-ui/tooltip';
import {
  getRailgunSmartWalletContractForNetwork,
  getShieldPrivateKeySignatureMessage,
  validateRailgunAddress,
} from '@railgun-community/quickstart';
import { erc20ABI } from '@wagmi/core';
import { BigNumber, ethers } from 'ethers';
import { isAddress, parseUnits } from 'ethers/lib/utils.js';
import { useSWRConfig } from 'swr';
import { useContractWrite, useNetwork, usePrepareContractWrite } from 'wagmi';
import { useRailgunWallet } from '@/contexts/RailgunWalletContext';
import { TokenListContextItem, useToken } from '@/contexts/TokenContext';
import useNotifications from '@/hooks/useNotifications';
import useRailgunTx, { TokenTransferType } from '@/hooks/useRailgunTx';
import useTokenAllowance from '@/hooks/useTokenAllowance';
import { shortenAddress } from '@/utils/address';
import { ethAddress } from '@/utils/constants';
import { getNetwork } from '@/utils/networks';

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
  const { mutate } = useSWRConfig();

  const { shieldingFees, unshieldingFees } = useToken();
  const { notifyUser, txNotify } = useNotifications();
  const { shield, unshield, transfer, isExecuting, shieldPrivateKey } = useRailgunTx();
  const [error, setError] = useState<string>();
  const { chain } = useNetwork();
  const network = getNetwork(chain?.id || 1);
  const tokenAmount = amount;
  const tokenDecimals = token.decimals;

  const { config } = usePrepareContractWrite({
    address: token.address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [
      getRailgunSmartWalletContractForNetwork(network.railgunNetworkName).address as `0x{string}`,
      ethers.utils.parseUnits(tokenAmount || '0', token.decimals),
    ],
  });

  const { writeAsync: doErc20Approval } = useContractWrite(config);
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);
  const { tokenAllowances, tokenList } = useToken();
  const { data } = useTokenAllowance({ address: token.address || '' });
  const tokenAllowance = tokenAllowances.get(token.address || '') || data || BigNumber.from(0);
  const needsApproval =
    token.address !== ethAddress &&
    ethers.utils.parseUnits(tokenAmount || '0', token.decimals).gt(tokenAllowance);
  const { wallet } = useRailgunWallet();
  const bigNumberAmount = parseUnits(tokenAmount! || '0', tokenDecimals);
  const shieldFee = shieldingFees[chain?.id || 1] || shieldingFees[1];
  const unshieldFee = unshieldingFees[chain?.id || 1] || unshieldingFees[1];
  const shieldFeeAmount = parseUnits(tokenAmount! || '0', tokenDecimals)
    .mul(shieldFee)
    .div(10000);
  const unshieldFeeAmount = parseUnits(tokenAmount! || '0', tokenDecimals)
    .mul(unshieldFee)
    .div(10000);

  const [isBaseToken, setIsBaseToken] = useState(false);
  const [recipientIsSelf, setRecipientIsSelf] = useState(false);
  const [recipientIsPublic, setRecipientIsPublic] = useState(false);
  const [recipientIsPrivate, setRecipientIsPrivate] = useState(false);

  const [showShieldButton, setShowShieldButton] = useState(true);
  const [showUnshieldButton, setShowUnshieldButton] = useState(true);
  const [showTransferButton, setShowTransferButton] = useState(true);

  useEffect(() => {
    setIsBaseToken(token.address === ethAddress);
  }, [token.address]);

  useEffect(() => {
    setRecipientIsPublic(isAddress(recipient));
    setRecipientIsPrivate(validateRailgunAddress(recipient));
    setRecipientIsSelf(recipient === wallet?.getAddress());
  }, [recipient, wallet]);

  useEffect(() => {
    if (amount.trim() === '') return;

    let { privateBalance } = token;
    const { decimals, balance } = token;

    const amt = ethers.utils.parseUnits(amount, decimals);
    if (isBaseToken) {
      const wToken = tokenList.find(({ address }) => address === network.wethAddress);
      if (wToken) {
        privateBalance = wToken.privateBalance;
      }
    }
    setShowShieldButton((recipientIsPrivate && balance?.gte(amt)) || false);
    setShowUnshieldButton((recipientIsPublic && privateBalance?.gte(amt)) || false);
    setShowTransferButton(
      (recipientIsPrivate && privateBalance?.gte(amt) && !isBaseToken && !recipientIsSelf) || false
    );
  }, [
    token,
    amount,
    recipientIsSelf,
    recipientIsPublic,
    recipientIsPrivate,
    isBaseToken,
    tokenList,
    network.wethAddress,
  ]);

  useEffect(() => {
    if (!recipientIsSelf && !showShieldButton && !showUnshieldButton && !showTransferButton) {
      setError('Insufficient public/private balance for shield/unshield/transfer!');
    } else {
      setError(undefined);
    }
  }, [showShieldButton, showUnshieldButton, showTransferButton, recipientIsSelf]);

  const doSubmit = async (
    // eslint-disable-next-line no-unused-vars
    execute: (args: TokenTransferType) => Promise<ethers.providers.TransactionResponse>
  ) => {
    if (!token.address || !amount || !token.decimals || !recipient) throw new Error('bad form');
    try {
      setError(undefined);
      const tx = await execute({
        address: token.address,
        decimals: token.decimals,
        amount,
        recipient,
      });
      txNotify(tx.hash);
      onClose();
      onSubmitClick();
    } catch (e) {
      console.error(e);
      const err = e as Error & { reason?: string };
      setError(err.reason ? err.reason : err.message);
    }
  };
  return (
    <Modal
      onClose={() => {
        onClose();
        setError(undefined);
      }}
      isOpen={isOpen}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Review Transaction</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column">
            <Flex direction="column" borderRadius="1.5rem" border="1px solid black" padding="1rem">
              <Flex align="center" justify="space-between">
                <Heading size="xs" paddingX={2}>
                  Recipient
                </Heading>
                <HStack>
                  <Tooltip label={recipient}>
                    <Text size="sm" textOverflow="ellipsis">
                      {displayName === recipient ? shortenAddress(displayName) : displayName}
                    </Text>
                  </Tooltip>
                  {recipientIsSelf && (
                    <Tooltip label="Recipient address is the same as currently selected Railgun Wallet!">
                      <Text size="sm" textOverflow="ellipsis">
                        <InfoIcon marginLeft="2" />
                      </Text>
                    </Tooltip>
                  )}
                </HStack>
              </Flex>
              <Flex align="center" justify="space-between">
                <Heading size="xs" paddingX={2}>
                  Token name
                </Heading>
                <Text size="sm">{token.name}</Text>
              </Flex>
              <Flex align="center" justify="space-between">
                <Heading size="xs" paddingX={2}>
                  Amount
                </Heading>
                <Text size="sm">
                  {ethers.utils.formatUnits(bigNumberAmount, token.decimals)} {token.symbol}
                </Text>
              </Flex>
              {showTransferButton && (
                <Flex align="center" justify="space-between">
                  <Heading size="xs" paddingX={2}>
                    Transfer fee
                  </Heading>
                  <Text size="sm">
                    {ethers.utils.formatUnits('0', token.decimals)} {token.symbol}
                  </Text>
                </Flex>
              )}
              {showShieldButton && (
                <Flex align="center" justify="space-between">
                  <Heading size="xs" paddingX={2}>
                    Shielding fee
                  </Heading>
                  <Text size="sm">
                    {ethers.utils.formatUnits(shieldFeeAmount, token.decimals)} {token.symbol}
                  </Text>
                </Flex>
              )}
              {showUnshieldButton && (
                <Flex align="center" justify="space-between">
                  <Heading size="xs" paddingX={2}>
                    Unshielding fee
                  </Heading>
                  <Text size="sm">
                    {ethers.utils.formatUnits(unshieldFeeAmount, token.decimals)} {token.symbol}
                  </Text>
                </Flex>
              )}
            </Flex>
          </Flex>
          {error && (
            <Alert
              status="error"
              mt=".5rem"
              borderRadius="md"
              wordBreak={'break-word'}
              maxH={'3xs'}
              overflowY={'auto'}
              alignItems={'flex-start'}
            >
              <AlertIcon />
              <Flex>{error}</Flex>
            </Alert>
          )}
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Flex justify="space-between">
            {showTransferButton && (
              <Button
                variant="outline"
                w="100%"
                margin="0.3rem"
                isDisabled={isExecuting}
                isLoading={isExecuting}
                onClick={async () => await doSubmit(transfer)}
              >
                <span style={{ padding: '0px 10px 0px 10px' }}>Transfer</span>
              </Button>
            )}

            {showShieldButton &&
              (needsApproval ? (
                <Button
                  variant="outline"
                  w="100%"
                  margin="0.3rem"
                  isDisabled={isApprovalLoading}
                  onClick={async () => {
                    if (!doErc20Approval) {
                      notifyUser({
                        alertType: 'error',
                        message:
                          'Page is not prepared for ERC20 approval. Please try again in a few seconds',
                      });
                      return;
                    }
                    setIsApprovalLoading(true);
                    const tx = await doErc20Approval().catch((err) => console.error(err));
                    if (tx) {
                      await txNotify(tx.hash);
                      mutate(
                        (key) => typeof key === 'string' && key.startsWith('useTokenAllowance')
                      );
                    } else {
                      notifyUser({
                        alertType: 'error',
                        message: 'Failed to approve token',
                      });
                    }
                    setIsApprovalLoading(false);
                  }}
                >
                  <span style={{ padding: '0px 10px 0px 10px' }}>Approve (Shield)</span>
                </Button>
              ) : (
                <Tooltip
                  bg="transparent"
                  padding="0"
                  placement="bottom"
                  color="black"
                  label={
                    !shieldPrivateKey && (
                      <Alert status="info" mt=".5rem" borderRadius="md">
                        <AlertIcon />
                        <div>
                          You will first be prompted to sign the message{' '}
                          <Code>{getShieldPrivateKeySignatureMessage()}</Code>, enabling you to
                          decrypt the receiving address in the future.
                        </div>
                      </Alert>
                    )
                  }
                >
                  <Button
                    variant="outline"
                    w="100%"
                    margin="0.3rem"
                    isDisabled={isExecuting}
                    isLoading={isExecuting}
                    onClick={async () => await doSubmit(shield)}
                  >
                    <span style={{ padding: '0px 10px 0px 10px' }}>Shield</span>
                  </Button>
                </Tooltip>
              ))}

            {showUnshieldButton && (
              <Button
                variant="outline"
                w="100%"
                margin="0.3rem"
                isDisabled={isExecuting}
                isLoading={isExecuting}
                onClick={async () => await doSubmit(unshield)}
              >
                <span style={{ padding: '0px 10px 0px 10px' }}>Unshield</span>
              </Button>
            )}
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReviewTransactionModal;
