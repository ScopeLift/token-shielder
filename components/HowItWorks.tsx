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
        <ListItem>Connect a public wallet (i.e. Metamask)</ListItem>
        <ListItem>
          Select (or create) a private RAILGUN wallet from Select Railgun Wallet menu on the top
          right
        </ListItem>
        <ListItem>Select recipient (0x or 0zk address), token and transfer amount</ListItem>
        <ListItem>Submit for review</ListItem>
      </OrderedList>

      <Heading as="h4" size="sm" marginTop="1rem">
        Review Transaction
      </Heading>
      <Text fontSize="sm">
        Depending on the selected token and amount, only allowed set of actions are displayed
      </Text>
      <OrderedList marginTop="1rem" fontSize="sm">
        <ListItem>
          <Heading as="h6" size="xs" marginTop="1rem" marginBottom="0.5rem">
            Transfer
          </Heading>
          <Text>Transfer action is only visible if</Text>
          <OrderedList marginTop="1rem" fontSize="sm">
            <ListItem>
              The recipient address is a non-trivial 0zk address (ie. not selected wallet)
            </ListItem>
            <ListItem>
              The private balance of selected RAILGUN wallet for selected token is sufficient for
              the input amount
            </ListItem>
          </OrderedList>
        </ListItem>
        <ListItem>
        <Heading as="h6" size="xs" marginTop="1rem" marginBottom="0.5rem">
            Shield
          </Heading>
          <Text>Shield action is only visible if</Text>
          <OrderedList marginTop="1rem" fontSize="sm">
            <ListItem>The recipient address is a 0zk address</ListItem>
            <ListItem>
              The public balance of connected public wallet for the selected token is sufficient for
              the input amount
            </ListItem>
            <ListItem>
              NOTE: If the selected token is not base token, an Approve action is shown if the
              allowance to RAILGUN contract is insufficient
            </ListItem>
          </OrderedList>
        </ListItem>
        <ListItem>
        <Heading as="h6" size="xs" marginTop="1rem" marginBottom="0.5rem">
            Unshield
          </Heading>
          <Text>Unshield action is only visible if</Text>
          <OrderedList marginTop="1rem" fontSize="sm">
            <ListItem>The recipient address is a public 0x address</ListItem>
            <ListItem>
              The private balance of selected RAILGUN wallet for selected token is sufficient for
              the input amount
            </ListItem>
            <ListItem>
              NOTE: If the selected token is a base token, the wrapped token balance of the RAILGUN
              wallet is unshielded and unwrapped into native token
            </ListItem>
          </OrderedList>
        </ListItem>
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
        with a RAILGUN 0zk Wallet.
      </Text>

      <Heading as="h5" size="xs" marginTop="1rem">
        How does the unshield transaction work?
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        Unshield transactions are executed privately, using a relayer (or a public wallet). Under
        the hood, the unshield action transfers ERC-20 tokens from 0zk address held at RAILGUN Smart
        Contract to the public destination address. If a base token is unshielded, the wrapped base
        token balance (ERC20) is unwrapped and transferred to the public address.
      </Text>

      <Heading as="h5" size="xs" marginTop="1rem">
        How does the private transfer transaction work?
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        Private transfer transactions are executed privately, using a relayer (or a public wallet).
        Under the hood, the private transfer action transfers a claim to some ERC-20 tokens from one
        0zk address to another. The tokens are not transferred, and are held publicly by the RAILGUN
        Smart Contract.
      </Text>

      <Heading as="h5" size="xs" marginTop="1rem">
        What do I do with shielded tokens?
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        You may use a RAILGUN wallet by creating one from the Select RAILGUN Wallet section on the
        top right, or a RAILGUN-compatible such as{' '}
        <Link href="https://app.railway.xyz/" textDecoration="underline" isExternal>
          Railway Wallet
        </Link>{' '}
        to transfer or unshield your private balance, and also access a number of Private DeFi
        applications.
      </Text>
      <Heading as="h5" size="xs" marginTop="1rem">
        What are the fees associated with various actions?
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        RAILGUN shielding and unshielding actions incur 0.25% protocol fees. This fee rate is
        subject to change by RAILGUN DAO. After tokens are shielded, private transfers incur no
        fees.
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
