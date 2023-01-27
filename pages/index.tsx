import { Flex, Heading } from '@chakra-ui/layout';
import HowTo from '@/components/HowTo';
import { TxForm } from '@/components/TxForm';

const Home = ({ recipientAddress }: { recipientAddress?: string }) => {
  return (
    <Flex direction="column" align="center" justify="center" pt="2rem">
      <Heading as="h1" size="4xl" mb="4rem">
        Shield
      </Heading>
      <TxForm recipientAddress={recipientAddress} />
      <HowTo />
    </Flex>
  );
};

export default Home;
