import { Flex, Heading } from "@chakra-ui/layout";
import { TxForm } from "@components/TxForm";
import type { NextPage } from "next";
import Head from "next/head";

// TODO this is an example list, update token list with real list of supported tokens
const tokenList = [
  {
    chainId: 1,
    address: "0x111111111117dC0aa78b770fA6A738034120C302",
    name: "1inch",
    symbol: "1INCH",
    decimals: 18,
    logoURI: "https://assets.coingecko…nch-token.png?1608803028",
  },
  {
    chainId: 1,
    address: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
    name: "Aave",
    symbol: "AAVE",
    decimals: 18,
    logoURI: "https://assets.coingecko…humb/AAVE.png?1601374110",
  },
];

const Home: NextPage = () => {
  return (
    <Flex direction="column" align="center" justify="center" pt="2rem">
      <Heading as="h1" size="4xl" mb="4rem">
        Shield
      </Heading>
      <TxForm tokenList={tokenList} />
    </Flex>
  );
};

export default Home;
