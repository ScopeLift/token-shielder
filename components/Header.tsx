import { Image } from '@chakra-ui/image';
import { Flex, VStack } from '@chakra-ui/layout';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SelectRailgunWallet } from './RailgunWallet';

const Header = () => {
  return (
    <Flex as="header" mt="4" justify="space-between">
      <Flex>
        <Image boxSize="2.5rem" src="protect-icon.svg" alt="Shield logo" />
      </Flex>
      <Flex>
        <VStack align="end">
          <ConnectButton />
          <SelectRailgunWallet />
        </VStack>
      </Flex>
    </Flex>
  );
};

export default Header;
