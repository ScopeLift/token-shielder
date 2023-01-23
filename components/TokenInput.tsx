import TokenSelectionModal from "@/components/TokenSelectionModal";
import { Input } from "@chakra-ui/input";
import { useDisclosure } from "@chakra-ui/react";

// TODO: Higher component passes in callback
const TokenInput = () => {
  const {
    isOpen: isTokenSelectionOpen,
    onOpen: onTokenSelectionOpen,
    onClose: onTokenSelectionClose,
  } = useDisclosure();
  return (
    <>
      <Input
        type="button"
        pr="4.5rem"
        size="lg"
        height="4rem"
        onClick={() => onTokenSelectionOpen()}
      />
      <TokenSelectionModal
        isOpen={isTokenSelectionOpen}
        onClose={onTokenSelectionClose}
      />
    </>
  );
};

export default TokenInput;
