import { Flex, Heading, Link, ListItem, OrderedList, Text } from '@chakra-ui/layout';

// TODO: Copy is a placeholder and pulled from their docs
const HowTo = () => {
  return (
    <Flex
      direction="column"
      border="1px solid"
      borderRadius="0.3rem"
      padding="2rem"
      maxWidth="40rem"
      marginTop="3rem"
      marginBottom="3rem"
    >
      <Heading as="h1" size="lg" alignSelf="center">
        Tutorial
      </Heading>
      <Heading as="h4" size="sm" marginTop="1rem">
        How to shield funds?
      </Heading>
      <OrderedList marginTop="1rem">
        <ListItem>
          Create a Railgun wallet on{' '}
          <Link href="https://app.railway.xyz/" isExternal>
            Railway
          </Link>
        </ListItem>
        <ListItem>Complete the above form</ListItem>
      </OrderedList>
      <Heading as="h4" size="sm" marginTop="1rem">
        What happens to shielded funds?
      </Heading>
      <Text marginTop="1rem" textAlign="justify">
        Shield transactions are executed publicly, using a public wallet. Under the hood, the shield
        action sends ERC-20 tokens into the RAILGUN contract, where they are associated with a
        RAILGUN Wallet and a private balance. Shielding actions incur 0.25% fees, based on the
        amount of tokens shielded. This fee rate is subject to change by RAILGUN DAO. After tokens
        are shielded, private transfers incur no fees.
      </Text>
    </Flex>
  );
};

export default HowTo;
