import { useToken } from "@/contexts/TokenContext";
import { TokenListContextItem } from "@/contexts/TokenContext";
import { SearchIcon } from "@chakra-ui/icons";
import { Image } from "@chakra-ui/image";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/input";
import { Box, Flex, Text } from "@chakra-ui/layout";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/modal";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils.js";
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
    <Flex>
      <Image
        boxSize="2.5rem"
        src={token.logoURI}
        alt={`${token.name}'s token logo`}
      />
      <Flex direction="column">
        <Text size="md">{token.name}</Text>
        <Text size="md">{token.symbol}</Text>
      </Flex>
      <Flex>
        <Text size="md">
          {parseUnits(
            tokenBalance.toString() || "0",
            token?.decimals || 0
          ).toString() || 0}
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
    // Search in `author` and in `tags` array
    keys: ["address", "name"],
  };

  const fuse = new Fuse(tokenList, options);

  const result = fuse.search(searchTerm);
  console.log(result);

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
          <Flex direction="column">
            {result.map((item, i) => {
              return <TokenSelectionItem token={item.item} key={i} />;
            })}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TokenSelectionModal;
