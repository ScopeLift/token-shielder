import { Image } from '@chakra-ui/image';
import { Flex } from '@chakra-ui/layout';
import { ConnectButton } from '@rainbow-me/rainbowkit';

// TODO: Logo is a placeholder until we have web assets
const Header = () => {
  return (
    <Flex align="center" justify="space-between" h="100%">
      <Image boxSize="2.5rem" src="protect-icon.svg" alt="Railgun shield logo" />
      <ConnectButton />
    </Flex>
  );
};

export default Header;
