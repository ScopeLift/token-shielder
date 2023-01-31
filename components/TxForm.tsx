import React, { useEffect, useState } from 'react';
import { Button } from '@chakra-ui/button';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input';
import { Box, Flex } from '@chakra-ui/layout';
import { useDisclosure } from '@chakra-ui/react';
import { getRailgunSmartWalletContractForNetwork } from '@railgun-community/quickstart';
import { erc20ABI } from '@wagmi/core';
import { BigNumber, constants, ethers } from 'ethers';
import { useContractWrite, useNetwork, usePrepareContractWrite } from 'wagmi';
import ReviewTransactionModal from '@/components/ReviewTransactionModal';
import TokenInput from '@/components/TokenInput';
import { useToken } from '@/contexts/TokenContext';
import useNotifications from '@/hooks/useNotifications';
import useTokenAllowance from '@/hooks/useTokenAllowance';
import { ethAddress } from '@/utils/constants';
import { networks } from '@/utils/networks';

export const TxForm = () => {
  // TODO: Placeholder notification for shielding
  const { tokenAllowances, tokenList } = useToken();
  const { chain } = useNetwork();
  const network = networks[chain?.id || 1];
  const { notifyUser, txNotify } = useNotifications();
  const { isOpen: isReviewOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure();
  const [tokenAddress, setTokenAddress] = useState<string>();
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [tokenDecimals, setTokenDecimals] = useState<number>();
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenName, setTokenName] = useState<string>('');
  const { config } = usePrepareContractWrite({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'approve',
    args: [
      getRailgunSmartWalletContractForNetwork(network.railgunNetworkName).address as `0x{string}`,
      constants.MaxUint256,
    ],
  });
  const { writeAsync: doErc20Approval } = useContractWrite(config);
  const { data } = useTokenAllowance({ address: tokenAddress || '' });
  const tokenAllowance = tokenAllowances.get(tokenAddress || '') || data || BigNumber.from(0);
  const [recipient, setRecipient] = useState<string>(
    '0zk1qyn0qa5rgk7z2l8wyncpynmydgj7ucrrcczhl8k27q2rw5ldvv2qrrv7j6fe3z53ll5j4fjs9j5cmq7mxsaulah7ykk6jwqna3nwvxudp5w6fwyg8cgwkwwv3g4'
  );
  const needsApproval =
    tokenAddress !== ethAddress &&
    ethers.utils.parseUnits(tokenAmount || '0', tokenDecimals).gt(tokenAllowance);

  useEffect(() => {
    const token = tokenList[0];
    if (!tokenAddress && token) {
      setTokenAddress(token.address);
      setTokenDecimals(token.decimals);
      setTokenSymbol(token.symbol);
      setTokenName(token.name);
    }
  }, [tokenAddress, tokenList]);

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
        <TokenInput
          onSelect={(token) => {
            const { address, decimals, symbol, name } = token;
            setTokenAddress(address);
            setTokenDecimals(decimals);
            setTokenSymbol(symbol);
            setTokenName(name);
          }}
        />
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
                alertType: 'error',
                message:
                  'Page is not prepared for ERC20 approval. Please try again in a few seconds',
              });
              return;
            }
            const tx = await doErc20Approval();
            txNotify(tx!.hash);
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
