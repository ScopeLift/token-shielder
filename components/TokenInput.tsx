import TokenSelectionModal from "@/components/TokenSelectionModal";
import { useToken } from "@/contexts/TokenContext";
import { TokenListContextItem } from "@/contexts/TokenContext";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { useDisclosure } from "@chakra-ui/react";
import { useState } from "react";

type TokenInputProps = {
  onSelect: (token: TokenListContextItem) => void;
};

const TokenInput = ({ onSelect }: TokenInputProps) => {
  const { tokenList } = useToken();
  const [token, setToken] = useState(tokenList[0]); // Select native token
  const {
    isOpen: isTokenSelectionOpen,
    onOpen: onTokenSelectionOpen,
    onClose: onTokenSelectionClose,
  } = useDisclosure();
  const localOnSelect = (token: TokenListContextItem) => {
    onSelect(token);
    onTokenSelectionClose();
    setToken(token);
  };
  return (
    <>
      <InputGroup cursor="pointer" onClick={() => onTokenSelectionOpen()}>
        <Input
          type="button"
          pr="4.5rem"
          size="lg"
          height="4rem"
          value={token?.name || tokenList[0]?.name || ""} // Default to native which is assumed at the top of the token list
        />
        <InputRightElement alignItems="center" height="100%" width="3rem">
          <ChevronDownIcon boxSize="1.75rem" />
        </InputRightElement>
      </InputGroup>
      <TokenSelectionModal
        isOpen={isTokenSelectionOpen}
        onClose={onTokenSelectionClose}
        onSelect={localOnSelect}
      />
    </>
  );
};

export default TokenInput;
