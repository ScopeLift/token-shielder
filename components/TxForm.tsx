import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@chakra-ui/button';
import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/form-control';
import { CopyIcon } from '@chakra-ui/icons';
import { Input, InputGroup } from '@chakra-ui/input';
import { Box, Flex, Text } from '@chakra-ui/layout';
import { useDisclosure } from '@chakra-ui/react';
import { Textarea } from '@chakra-ui/textarea';
import { validateRailgunAddress } from '@railgun-community/quickstart';
import { GetNetworkResult, watchNetwork } from '@wagmi/core';
import { BigNumber } from 'ethers';
import { isAddress, parseUnits } from 'ethers/lib/utils.js';
import { useAccount, useNetwork } from 'wagmi';
import ReviewTransactionModal from '@/components/ReviewTransactionModal';
import TokenInput from '@/components/TokenInput';
import { TokenListContextItem, useToken } from '@/contexts/TokenContext';
import useNotifications from '@/hooks/useNotifications';
import useResolveUnstoppableDomainAddress from '@/hooks/useResolveUnstoppableDomainAddress';
import { UNSTOPPABLE_DOMAIN_SUFFIXES, VALID_AMOUNT_REGEX } from '@/utils/constants';
import { buildBaseToken, getNetwork } from '@/utils/networks';
import { endsWithAny } from '@/utils/string';
import { isAmountParsable } from '@/utils/token';

type TxFormValues = {
  recipient: string;
  amount: string;
  token: string;
};

export const TxForm = ({ recipientAddress }: { recipientAddress?: string }) => {
  const { tokenList } = useToken();
  const { chain } = useNetwork();
  const { isConnected } = useAccount();
  const network = getNetwork(chain?.id);
  const { notifyUser } = useNotifications();
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

  const [recipient, setRecipient] = useState<string>(recipientAddress || '');
  const [recipientDisplayName, setRecipientDisplayName] = useState<string>(recipientAddress || '');
  const { data: resolvedUnstoppableDomain, trigger: resolveDomain } =
    useResolveUnstoppableDomainAddress();
  const onCopy = () => {
    navigator.clipboard.writeText(`${window.location.host}/wallet?address=${recipientDisplayName}`);
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
                Copy Tx Link
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
            placeholder="0x... or 0zk... address"
            {...register('recipient', {
              required: 'This is required',
              onChange: (e) => {
                setRecipientDisplayName(e.target.value);
              },
              validate: async (value) => {
                if (isAddress(value) || validateRailgunAddress(value)) {
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
                return 'Invalid public (or railgun) address or unstoppable domain does not resolve to a railgun address';
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
        <Button
          isDisabled={!isConnected || chain?.unsupported}
          type="submit"
          size="lg"
          mt=".75rem"
          width="100%"
        >
          Review
        </Button>
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
