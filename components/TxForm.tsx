import { useToken } from "@/contexts/TokenContext";
import useNotifications from "@/hooks/useNotifications";
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Box, Flex } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";

export const TxForm = () => {
  // TODO: Placeholder notification for shielding
  const { tokenList } = useToken();
  const { notifyUser } = useNotifications();
  return (
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
        <Select size="lg" height="4rem" mb=".75rem">
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
      <Button
        size="lg"
        mt="1rem"
        width="100%"
        onClick={() => {
          notifyUser({
            alertType: "success",
            message: "Token was shielded successfully",
          });
        }}
      >
        Shield
      </Button>
    </Box>
  );
};
