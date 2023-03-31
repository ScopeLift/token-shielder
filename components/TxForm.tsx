import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@chakra-ui/button';
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control';
import { CopyIcon } from '@chakra-ui/icons';
import { Input, InputGroup } from '@chakra-ui/input';
import { Box, Flex, Text } from '@chakra-ui/layout';
import { useDisclosure } from '@chakra-ui/react';
import { Textarea } from '@chakra-ui/textarea';
import { getRailgunSmartWalletContractForNetwork } from '@railgun-community/quickstart';
import { validateRailgunAddress } from '@railgun-community/quickstart';
import { erc20ABI } from '@wagmi/core';
import { GetNetworkResult, watchNetwork } from '@wagmi/core';
import { BigNumber, ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils.js';
import { useSWRConfig } from 'swr';
import { useAccount, useContractWrite, useNetwork, usePrepareContractWrite } from 'wagmi';
import ReviewTransactionModal from '@/components/ReviewTransactionModal';
import TokenInput from '@/components/TokenInput';
import { useToken } from '@/contexts/TokenContext';
import { TokenListContextItem } from '@/contexts/TokenContext';
import useNotifications from '@/hooks/useNotifications';
import useResolveUnstoppableDomainAddress from '@/hooks/useResolveUnstoppableDomainAddress';
import useTokenAllowance from '@/hooks/useTokenAllowance';
import { UNSTOPPABLE_DOMAIN_SUFFIXES, VALID_AMOUNT_REGEX, ethAddress } from '@/utils/constants';
import { buildBaseToken, getNetwork } from '@/utils/networks';
import { endsWithAny } from '@/utils/string';
import { isAmountParsable } from '@/utils/token';

type TxFormValues = {
  recipient: string;
  amount: string;
  token: string;
};

export const TxForm = ({ recipientAddress }: { recipientAddress?: string }) => {
  const { tokenAllowances, tokenList } = useToken();
  const { mutate } = useSWRConfig();
  const { chain } = useNetwork();
  const { isConnected } = useAccount();
  const network = getNetwork(chain?.id);
  const { notifyUser, txNotify } = useNotifications();
  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TxFormValues>({
    mode: 'onChange',
    defaultValues: {
      token: network.baseToken.name,
      recipient: recipientAddress,
    },
  });
  const { isOpen: isReviewOpen, onOpen: openReview, onClose: closeReview } = useDisclosure();
  const [selectedToken, setSelectedToken] = useState<TokenListContextItem>(tokenList[0]);
  const [validAddress, setValidAddress] = useState(false);
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const { config } = usePrepareContractWrite({
    address: selectedToken?.address,
    abi: erc20ABI,
    functionName: 'approve',
    args: [
      getRailgunSmartWalletContractForNetwork(network.railgunNetworkName).address as `0x{string}`,
      ethers.utils.parseUnits(tokenAmount || '0', selectedToken?.decimals),
    ],
  });
  const { writeAsync: doErc20Approval } = useContractWrite(config);
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);
  const { data } = useTokenAllowance({ address: selectedToken?.address || '' });
  const tokenAllowance =
    tokenAllowances.get(selectedToken?.address || '') || data || BigNumber.from(0);
  const [recipient, setRecipient] = useState<string>(recipientAddress || '');
  const [recipientDisplayName, setRecipientDisplayName] = useState<string>(recipientAddress || '');
  const { data: resolvedUnstoppableDomain, trigger: resolveDomain } =
    useResolveUnstoppableDomainAddress();
  const needsApproval =
    selectedToken?.address !== ethAddress &&
    ethers.utils.parseUnits(tokenAmount || '0', selectedToken?.decimals).gt(tokenAllowance);
  const onCopy = () => {
    navigator.clipboard.writeText(`${window.location.host}/send?address=${recipientDisplayName}`);
    notifyUser({
      alertType: 'success',
      message: 'Shield link copied to clipboard',
    });
  };
  const onSubmit = handleSubmit(async (values) => {
    setRecipient(resolvedUnstoppableDomain || values.recipient);
    setRecipientDisplayName(values.recipient);
    setTokenAmount(values.amount);
    openReview();
  });

  const updateOnNetworkChange = useCallback(
    (net: GetNetworkResult) => {
      if (net && net?.chain) {
        const chain = getNetwork(net?.chain.id);
        const token = buildBaseToken(chain.baseToken, net.chain.id);
        setSelectedToken(token);
        setValue('token', chain.baseToken.name);
      }
    },
    [setValue]
  );

  useEffect(() => {
    const unwatch = watchNetwork(updateOnNetworkChange);
    return unwatch;
  }, [updateOnNetworkChange]);

  useEffect(() => {
    if (!selectedToken) {
      setSelectedToken(tokenList[0]);
    }
  }, [selectedToken, tokenList]);

  return (
    <Box maxWidth="24rem" className="container">
      <form onSubmit={onSubmit}>
        <FormControl isInvalid={Boolean(errors.recipient?.message)}>
          <Flex justify="space-between">
            <FormLabel>Recipient address</FormLabel>

            {validAddress && (
              <Text
                cursor="pointer"
                textDecoration="underline"
                fontSize="xs"
                textAlign="center"
                onClick={onCopy}
              >
                Copy Shield Link
                <CopyIcon ml=".25rem" />
              </Text>
            )}
          </Flex>
          <Textarea
            variant="outline"
            size="lg"
            resize="none"
            mb=".25rem"
            height="9rem"
            placeholder="0zk1qyn0qa5rgk7z2l8wyncpynmydgj7ucrrcczhl8k27q2rw5ldvv2qrrv7j6fe3z53ll5j4fjs9j5cmq7mxsaulah7ykk6jwqna3nwvxudp5w6fwyg8cgwkwwv3g4"
            {...register('recipient', {
              required: 'This is required',
              onChange: (e) => {
                setRecipientDisplayName(e.target.value);
              },
              validate: async (value) => {
                const validRailgunAddress = validateRailgunAddress(value);

                if (validRailgunAddress) {
                  setValidAddress(true);
                  return true;
                }

                if (endsWithAny(value, UNSTOPPABLE_DOMAIN_SUFFIXES)) {
                  const resolvedUnstoppableDomain = await resolveDomain({ name: value });

                  if (resolvedUnstoppableDomain) {
                    setValidAddress(true);
                    return true;
                  }
                }
                setValidAddress(false);
                return 'Invalid railgun address or unstoppable domain does not resolve to a railgun address';
              },
            })}
          />
          <FormErrorMessage my=".25rem">
            {errors.recipient && errors.recipient.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={Boolean(errors.token?.message)} mt=".5rem">
          <FormLabel>Token</FormLabel>
          <TokenInput
            {...register('token')}
            onSelect={(token) => {
              setValue('token', token.name);
              setSelectedToken(token);
            }}
          />
        </FormControl>
        <FormControl isInvalid={Boolean(errors.amount?.message)}>
          <FormLabel>Amount</FormLabel>
          <InputGroup size="lg" width="auto" height="4rem">
            <Input
              variant="outline"
              size="lg"
              pr="4.5rem"
              height="100%"
              placeholder="0.1"
              {...register('amount', {
                required: 'This is required',
                onChange: (e) => {
                  const isParseable = isAmountParsable(e.target.value, selectedToken.decimals);
                  if (
                    e.target.value &&
                    !isNaN(e.target.value) &&
                    VALID_AMOUNT_REGEX.test(e.target.value) &&
                    isParseable
                  ) {
                    setTokenAmount(e.target.value);
                  }
                },
                validate: (value) => {
                  try {
                    if (!VALID_AMOUNT_REGEX.test(value) && isNaN(parseFloat(value))) {
                      return 'Not a valid number';
                    }

                    return (
                      Boolean(
                        parseUnits(value || '0', selectedToken?.decimals).gt(BigNumber.from('0'))
                      ) || 'Amount must be greater than 0'
                    );
                  } catch (e) {
                    return 'Not a valid number';
                  }
                },
              })}
            />
          </InputGroup>
          <FormErrorMessage my=".25rem">{errors.amount && errors.amount.message}</FormErrorMessage>
        </FormControl>
        {needsApproval ? (
          <Button
            size="lg"
            mt=".75rem"
            width="100%"
            isDisabled={!isConnected || chain?.unsupported || isApprovalLoading}
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
                mutate((key) => typeof key === 'string' && key.startsWith('useTokenAllowance'));
              } else {
                notifyUser({
                  alertType: 'error',
                  message: 'Failed to approve token',
                });
              }
              setIsApprovalLoading(false);
            }}
          >
            Approve
          </Button>
        ) : (
          <Button
            isDisabled={!isConnected || chain?.unsupported}
            type="submit"
            size="lg"
            mt=".75rem"
            width="100%"
          >
            Shield
          </Button>
        )}
        {selectedToken && (
          <ReviewTransactionModal
            isOpen={isReviewOpen}
            onClose={closeReview}
            recipient={recipient}
            displayName={recipientDisplayName}
            token={selectedToken}
            amount={tokenAmount}
            onSubmitClick={() => {
              reset((values) => ({
                ...values,
                recipient: values.recipient,
                amount: '',
              }));
            }}
          />
        )}
      </form>
    </Box>
  );
};
