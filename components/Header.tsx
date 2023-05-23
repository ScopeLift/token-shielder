import { useState } from 'react';
import Link from 'next/link';
import { HamburgerIcon, LockIcon } from '@chakra-ui/icons';
import { Image } from '@chakra-ui/image';
import { Flex, VStack } from '@chakra-ui/layout';
import {
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { SelectRailgunWallet } from './RailgunWallet';


const INTEGRATIONS = [
  {
    id: 'aave-v3',
    name: 'Aave V3',
    description: 'Deposit, withdraw, borrow and repay using AAVE money market protocol',
    href: '/integrations/aave-v3',
  },
];


const Header = () => {
  const [integration, setIntegration] = useState(INTEGRATIONS[0]);

  return (
    <Flex as="header" mt="4" justify="space-between">
      <Flex>
        <Menu matchWidth closeOnSelect={false}>
          <MenuButton variant="outline" as={IconButton} icon={<HamburgerIcon />} />
          <MenuList>
            <MenuItem as={Link} value="wallet" href="/wallet">
              <Tooltip
                hasArrow
                fontSize="sm"
                placement="auto-start"
                label={
                  'Shield, Unshield and Transfer tokens between your public address and RAILGUN Private 0zk address'
                }
              >
                <Button variant="outline" w="100%" aria-label="Railgun Wallet" leftIcon={<LockIcon />}>
                  Wallet
                </Button>
              </Tooltip>
            </MenuItem>
            <MenuOptionGroup title="Integrations" value={integration.href}>
              {INTEGRATIONS.map(({ id, name, description, href }, i) => {
                return (
                  <MenuItemOption as={Link} key={i} value={id} href={href}>
                    <Tooltip hasArrow fontSize="sm" label={description} placement="auto-start">
                      <Text>{name}</Text>
                    </Tooltip>
                  </MenuItemOption>
                );
              })}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Flex>
      <Flex>
        <Image
          position="absolute"
          left="48%"
          boxSize="2.5rem"
          src="/protect-icon.svg"
          alt="Shield logo"
        />
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
