import { Image } from '@chakra-ui/image';
import { Flex } from '@chakra-ui/layout';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header = () => {
  return (
    <Flex as="header" mt="4">
      <Flex align="center" justify="space-between" h="100%">
        <Image boxSize="2.5rem" src="protect-icon.svg" alt="Shield logo" />
      </Flex>
      <Flex position="fixed" w="98%" justify="flex-end">
        <ConnectButton />{' '}
      </Flex>
    </Flex>
  );
};

export default Header;
