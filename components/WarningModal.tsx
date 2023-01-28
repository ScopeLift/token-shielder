import { Button } from '@chakra-ui/button';
import { WarningTwoIcon } from '@chakra-ui/icons';
import { Flex, Text } from '@chakra-ui/layout';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { Address } from 'abitype';

type WarningModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onClick: () => void;
  address: Address;
  description: string;
  children?: React.ReactNode;
};

const WarningModal = (props: WarningModalProps) => {
  return (
    <Modal blockScrollOnMount={false} isOpen={props.isOpen} onClose={props.onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader></ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column">
            <Flex justify="center" mb="1rem" color="yellow.500">
              <Flex
                bg="yellow.100"
                px=".50rem"
                py=".25rem"
                alignItems="center"
                borderRadius=".75rem"
              >
                <Text fontSize="md" mr=".5rem" fontWeight="600">
                  Warning
                </Text>
                <WarningTwoIcon />
              </Flex>
            </Flex>
            <Text fontSize="md" textAlign="center" px="1rem">
              {props.description}
            </Text>
            {props.children}
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={props.onClick}>
            I understand
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WarningModal;
