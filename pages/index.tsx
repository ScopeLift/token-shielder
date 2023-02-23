import { Flex, Heading } from '@chakra-ui/layout';
import { TxForm } from '@/components/TxForm';

const Home = ({ recipientAddress }: { recipientAddress?: string }) => {
  return (
    <Flex direction="column" align="center" justify="center" pt="2rem">
      <Heading as="h1" size="2xl" mb="1rem">
        TokenShielder
      </Heading>
      <Heading as="h4" size="xs" mb="3rem">
        Use your crypto wallet of choice to transfer tokens directly into a RAILGUN Private 0zk
        balance.
      </Heading>
      <TxForm recipientAddress={recipientAddress} />
    </Flex>
  );
};

export default Home;
