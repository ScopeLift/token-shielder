import { useToken } from "@/contexts/TokenContext";
import { TokenListContextItem } from "@/contexts/TokenContext";
import { ipfsDomain } from "@/utils/constants";
import { parseIPFSUri } from "@/utils/ipfs";
import { Avatar } from "@chakra-ui/avatar";
import { SearchIcon } from "@chakra-ui/icons";
import { Image } from "@chakra-ui/image";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/input";
import { Box, Flex, Text, Circle } from "@chakra-ui/layout";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/modal";
import { BigNumber, FixedNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils.js";
import Fuse from "fuse.js";
import { useState } from "react";

type TokenSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type TokenSelectionItemProps = {
  token: TokenListContextItem;
};

const TokenSelectionItem = ({ token }: TokenSelectionItemProps) => {
  const tokenBalance = token?.balance || BigNumber.from(0);
  return (
    <Flex justify="space-between" paddingY=".35rem">
      <Image
        boxSize="2rem"
        src={
          token.logoURI.slice(0, 4) == "ipfs"
            ? `${ipfsDomain}${parseIPFSUri(token.logoURI)}`
            : `${token.logoURI}`
        }
        alt={`${token.name}'s token logo`}
        fallback={
          <Circle size="2rem" bg="lightgrey">
            <Text fontSize="xs">{token.symbol.slice(0, 3)}</Text>
          </Circle>
        }
      />
      <Flex direction="column" w="100%" paddingLeft="1.5rem">
        <Text fontSize="md">{token.name}</Text>
        <Text fontSize="xs">{token.symbol}</Text>
      </Flex>
      <Flex>
        <Text size="md">
          {FixedNumber.from(
            formatUnits(
              tokenBalance.toString() || "0",
              token?.decimals || 0
            ).toString()
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
  const [searchTerm, setSearchTerm] = useState("");
  const options = {
    includeScore: false,
    keys: ["address", "name"],
  };

  const fuse = new Fuse(tokenList, options);

  const result = fuse.search(searchTerm);

  return (
    <Modal onClose={props.onClose} isOpen={props.isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm Shield</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column">
            <InputGroup>
              <InputLeftElement pointerEvents="none" height="100%">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                size="lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Flex>
          <Flex direction="column" paddingTop="1rem">
            {searchTerm === ""
              ? tokenList.slice(0, 5).map((item, i) => {
                  return <TokenSelectionItem token={item} key={i} />;
                })
              : result.slice(0, 5).map((item, i) => {
                  return <TokenSelectionItem token={item.item} key={i} />;
                })}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TokenSelectionModal;
