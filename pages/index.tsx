import { Image } from '@chakra-ui/image';
import { Flex, Heading } from '@chakra-ui/layout';
import { TxForm } from '@/components/TxForm';

const Home = ({ recipientAddress }: { recipientAddress?: string }) => {
  return (
    <Flex direction="column" align="center" justify="center">
      <Heading as="h1" size="2xl" mb="1rem">
        Railgun Wallet
      </Heading>
      <Image
        boxSize="7rem"
        src="dwarf.jpg"
        alt="dwarf with shield"
        borderRadius="4rem"
        border="2px solid white"
        mb="1.5rem"
      />
      <Heading as="h4" size="xs" mb="2rem">
        Shield, Unshield and Transfer tokens between your public address and RAILGUN Private 0zk address.
      </Heading>
      <TxForm recipientAddress={recipientAddress} />
    </Flex>
  );
};

export default Home;
