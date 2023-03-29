import { Flex, Heading, Link, ListItem, OrderedList, Text } from '@chakra-ui/layout';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/modal';

type HowItWorksModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const HowItWorks = () => {
  return (
    <Flex
      className="container"
      direction="column"
      maxWidth="40rem"
      marginTop="3rem"
      marginBottom="3rem"
    >
      <Heading as="h1" size="lg" alignSelf="center">
        Tutorial & FAQs
      </Heading>
      <Heading as="h4" size="sm" marginTop="1rem">
        How does it work?
      </Heading>
      <OrderedList marginTop="1rem" fontSize="sm">
        <ListItem>Connect a wallet</ListItem>

        <ListItem>
          Ask for your recipient’s 0zk address (or create one with{' '}
          <Link href="https://app.railway.xyz/" isExternal textDecoration="underline">
            Railway Wallet
          </Link>
          )
        </ListItem>
        <ListItem>Select a token and transfer amount</ListItem>
        <ListItem>Submit the shield transaction</ListItem>
      </OrderedList>
      <Heading as="h4" size="sm" marginTop="2rem">
        FAQ
      </Heading>
      <Heading as="h5" size="xs" marginTop="1rem">
        Why should I shield funds?
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        Public blockchains display every user’s balance, leaving users open to security
        vulnerabilities, data harvesting and hacks. To solve these problems,{' '}
        <Link
          href="https://docs.railgun.org/wiki/learn/overview"
          textDecoration="underline"
          isExternal
        >
          the RAILGUN Privacy System
        </Link>{' '}
        encrypts balances and transactions so they’re private to each user. All RAILGUN users have
        0zk addresses, where they can receive tokens that are shielded from public view. Shielding
        is a safer alternative to a typical public transfer, especially for use cases like payroll
        and anonymous donations.
      </Text>
      <Heading as="h5" size="xs" marginTop="1rem">
        How does the shield transaction work?
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        Shield transactions are executed publicly, using your public wallet. Under the hood, the
        shield action sends ERC-20 tokens into the RAILGUN Smart Contract, where they are associated
        with a RAILGUN 0zk Wallet. To see what you can do after you have Shielded funds, visit{' '}
        <Link href="https://help.railway.xyz" textDecoration="underline" isExternal>
          https://help.railway.xyz
        </Link>
        .
      </Text>
      <Heading as="h5" size="xs" marginTop="1rem">
        What do I do with shielded tokens?
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        You may use RAILGUN-compatible wallets such as{' '}
        <Link href="https://app.railway.xyz/" textDecoration="underline" isExternal>
          Railway Wallet
        </Link>{' '}
        to transfer or unshield your private balance, and also access a number of Private DeFi
        applications.
      </Text>
      <Heading as="h5" size="xs" marginTop="1rem">
        Are there fees to use TokenShielder?
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        RAILGUN shielding actions incur 0.25% fees. This fee rate is subject to change by RAILGUN
        DAO. After tokens are shielded, private transfers incur no fees.
      </Text>
    </Flex>
  );
};

export const HowItWorksModal = ({ isOpen, onClose }: HowItWorksModalProps) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <HowItWorks />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
