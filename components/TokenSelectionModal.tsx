import { useState } from 'react';
import { SearchIcon } from '@chakra-ui/icons';
import { Image } from '@chakra-ui/image';
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/input';
import { Circle, Flex, Text } from '@chakra-ui/layout';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { BigNumber, FixedNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils.js';
import Fuse from 'fuse.js';
import { useToken } from '@/contexts/TokenContext';
import { TokenListContextItem } from '@/contexts/TokenContext';
import { ipfsDomain } from '@/utils/constants';
import { parseIPFSUri } from '@/utils/ipfs';

type TokenSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (arg0: TokenListContextItem) => void; // eslint-disable-line no-unused-vars
};

type TokenSelectionItemProps = {
  token: TokenListContextItem;
  onClick: (arg0: TokenListContextItem) => void; // eslint-disable-line no-unused-vars
};

// 1. If a valid token address, populate the custom token
// 2. Fetch token info to populate item
const TokenSelectionItem = ({ token, onClick }: TokenSelectionItemProps) => {
  const tokenBalance = token?.balance || BigNumber.from(0);
  return (
    <Flex
      justify="space-between"
      paddingY=".35rem"
      _hover={{ backgroundColor: 'rgba(184, 192, 220, 0.08)' }}
      borderRadius=".5rem"
      padding=".5rem"
      cursor="pointer"
      onClick={() => onClick(token)}
    >
      <Flex direction="column" justify="center" w="2rem">
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
      </Flex>
      <Flex direction="column" w="100%" paddingLeft="1.5rem">
        <Text fontSize="md">{token.name}</Text>
        <Text fontSize="xs">{token.symbol}</Text>
      </Flex>
      <Flex direction="column" justify="center">
        <Text size="md">
          {FixedNumber.from(
            formatUnits(tokenBalance.toString() || '0', token?.decimals || 0).toString()
          )
            .round(4)
            .toString() || 0}
        </Text>
      </Flex>
    </Flex>
  );
};

const TokenSelectionModal = (props: TokenSelectionModalProps) => {
  const { tokenList } = useToken();
  const [searchTerm, setSearchTerm] = useState('');
  const options = {
    includeScore: true,
    keys: ['address', 'name', 'symbol'],
    threshold: 0.2,
  };

  const fuse = new Fuse(tokenList, options);

  const result = fuse.search(searchTerm);

  return (
    <Modal onClose={props.onClose} isOpen={props.isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Token</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column">
            <InputGroup>
              <InputLeftElement pointerEvents="none" height="100%">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input size="lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </InputGroup>
          </Flex>
          <Flex direction="column" paddingTop="1rem">
            {searchTerm === ''
              ? tokenList.slice(0, 5).map((item, i) => {
                  return <TokenSelectionItem token={item} key={i} onClick={props.onSelect} />;
                })
              : result.slice(0, 5).map((item, i) => {
                  return <TokenSelectionItem token={item.item} key={i} onClick={props.onSelect} />;
                })}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TokenSelectionModal;
