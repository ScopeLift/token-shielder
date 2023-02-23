import React, { useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Input, InputGroup, InputRightElement } from '@chakra-ui/input';
import { Circle, Flex, Image, Text, useDisclosure } from '@chakra-ui/react';
import TokenSelectionModal from '@/components/TokenSelectionModal';
import { TokenListContextItem } from '@/contexts/TokenContext';
import { ipfsDomain } from '@/utils/constants';
import { parseIPFSUri } from '@/utils/ipfs';

type TokenInputProps = {
  onSelect: (token: TokenListContextItem) => void; // eslint-disable-line no-unused-vars
} & UseFormRegisterReturn;

const TokenInput = React.forwardRef(
  ({ onSelect, ...rest }: TokenInputProps, ref: React.Ref<HTMLInputElement>) => {
    const [token, setToken] = useState<TokenListContextItem>();
    const {
      isOpen: isTokenSelectionOpen,
      onOpen: onTokenSelectionOpen,
      onClose: onTokenSelectionClose,
    } = useDisclosure();
    const localOnSelect = (token: TokenListContextItem) => {
      onSelect(token);
      setToken(token);
      onTokenSelectionClose();
    };
    return (
      <>
        <InputGroup
          cursor="pointer"
          onClick={onTokenSelectionOpen}
          borderWidth="1px"
          borderColor="inherit"
          borderRadius="md"
        >
          <Flex alignItems="center" pl="1rem">
            {token?.logoURI && (
              <Image
                boxSize="1.55rem"
                src={
                  token.logoURI.slice(0, 4) == 'ipfs'
                    ? `${ipfsDomain}${parseIPFSUri(token.logoURI)}`
                    : `${token.logoURI}`
                }
                alt={`${token.name}'s token logo`}
                fallback={
                  <Circle size="1.55rem" bg="lightgrey">
                    <Text fontSize=".5rem">{token.symbol.slice(0, 3)}</Text>
                  </Circle>
                }
              />
            )}
            <Input
              type="button"
              // pr="4.5rem"
              size="lg"
              height="4rem"
              border={0}
              cursor="pointer"
              // borderRadius={0}
              {...rest}
              ref={ref}
            />
            <InputRightElement alignItems="center" height="4rem" width="3rem">
              <ChevronDownIcon boxSize="1.75rem" />
            </InputRightElement>
          </Flex>
        </InputGroup>
        <TokenSelectionModal
          isOpen={isTokenSelectionOpen}
          onClose={onTokenSelectionClose}
          onSelect={localOnSelect}
        />
      </>
    );
  }
);

TokenInput.displayName = 'TokenInput';

export default TokenInput;
