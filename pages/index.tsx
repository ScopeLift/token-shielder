import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Box, Flex, Heading, Text } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
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
      <Box width="24rem">
        <FormControl>
          <FormLabel>Recipient address</FormLabel>
          <Input
            type="string"
            variant="outline"
            size="lg"
            placeholder="vitalik.eth"
            pr="4.5rem"
            height="4rem"
            mb=".75rem"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Token</FormLabel>
          <Select placeholder="Ether" size="lg" height="4rem" mb=".75rem">
            {tokenList.map((item) => {
              return (
                <option key={item.name} value={item.name}>
                  {item.name}
                </option>
              );
            })}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Amount</FormLabel>
          <InputGroup size="lg" width="auto" height="4rem">
            <Input
              type="number"
              variant="outline"
              size="lg"
              placeholder="0"
              pr="4.5rem"
              height="100%"
            />
            <InputRightElement width="4.5rem" height="100%">
              <Button size="sm">Max</Button>
            </InputRightElement>
          </InputGroup>
          <Flex justify="flex-end"></Flex>
        </FormControl>
        <Button size="lg" mt="1rem" width="100%">
          Shield
        </Button>
      </Box>
    </Flex>
  );
};

export default Home;
