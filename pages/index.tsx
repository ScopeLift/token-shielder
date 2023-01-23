import HowTo from "@/components/HowTo";
import { TxForm } from "@/components/TxForm";
import { Flex, Heading } from "@chakra-ui/layout";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <Flex direction="column" align="center" justify="center" pt="2rem">
      <Heading as="h1" size="4xl" mb="4rem">
        Shield
      </Heading>
      <TxForm />
      <HowTo />
    </Flex>
  );
};

export default Home;
