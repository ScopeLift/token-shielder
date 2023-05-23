import React, { useState } from 'react';
import { useCallback } from 'react';
import { AddIcon, CopyIcon, LockIcon, UnlockIcon } from '@chakra-ui/icons';
import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  UseModalProps,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { RailgunWalletInfo } from '@railgun-community/shared-models';
import { randomBytes } from 'crypto';
import { entropyToMnemonic, isValidMnemonic } from 'ethers/lib/utils.js';
import { useRailgunWallet } from '@/contexts/RailgunWalletContext';
import { shortenAddress } from '@/utils/address';


export const SelectRailgunWallet = () => {
  const {
    isOpen: addRailgunWalletIsOpen,
    onOpen: showAddRailgunWallet,
    onClose: hideAddRailgunWallet,
  } = useDisclosure();
  const [selectRailgunWallet, setSelectRailgunWallet] = useState<RailgunWalletInfo>();
  const { isLoading, wallet, walletList } = useRailgunWallet();

  return (
    <>
      <Menu matchWidth closeOnSelect={false}>
        <MenuButton
          minW={220}
          as={Button}
          disabled={isLoading}
          leftIcon={!wallet ? <LockIcon /> : <UnlockIcon />}
          rightIcon={isLoading ? <Spinner /> : undefined}
        >
          {!wallet ? 'Select Railgun Wallet' : shortenAddress(wallet.getAddress())}
        </MenuButton>
        <MenuList>
          <MenuOptionGroup title="Accounts" value={wallet?.id}>
            {walletList?.map(({ id, railgunAddress }, i) => {
              return (
                <MenuItemOption key={i} value={id}>
                  <Flex w="100%">
                    <Flex
                      w="100%"
                      onClick={() => {
                        setSelectRailgunWallet({ id, railgunAddress });
                      }}
                    >
                      {shortenAddress(railgunAddress)}
                    </Flex>
                    <IconButton
                      boxSize={6}
                      variant="outline"
                      icon={<CopyIcon />}
                      aria-label="Copy 0zk address"
                      _hover={{ bg: 'gray.400' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(railgunAddress);
                      }}
                    />
                  </Flex>
                </MenuItemOption>
              );
            })}
          </MenuOptionGroup>
          <MenuDivider />
          <MenuItem justifyContent="center" onClick={showAddRailgunWallet}>
            <IconButton
              boxSize={6}
              variant="unstyled"
              icon={<AddIcon />}
              aria-label="Add Railgun Wallet"
            />
          </MenuItem>
        </MenuList>
      </Menu>
      <SelectRailgunWalletModal
        walletInfo={selectRailgunWallet}
        isOpen={selectRailgunWallet !== undefined}
        onClose={() => setSelectRailgunWallet(undefined)}
      />
      <RailgunAddWalletModal isOpen={addRailgunWalletIsOpen} onClose={hideAddRailgunWallet} />
    </>
  );
};

const SelectRailgunWalletModal = ({
  isOpen,
  onClose,
  walletInfo,
}: UseModalProps & { walletInfo?: RailgunWalletInfo }) => {
  const [password, setPassword] = useState<string>('');
  const { selectWallet } = useRailgunWallet();

  return !walletInfo ? null : (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Railgun Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired={true}>
            <FormHelperText>{shortenAddress(walletInfo.railgunAddress)}</FormHelperText>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button
            mr={3}
            onClick={async () => {
              await selectWallet(walletInfo.id, password);
              onClose();
            }}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const RailgunAddWalletModal = ({ isOpen, onClose }: UseModalProps) => {
  const [password, setPassword] = useState<string>('');
  const [mnemonic, setMenmonic] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const { createWallet } = useRailgunWallet();
  const toast = useToast();

  const generateMenmonic = useCallback(() => {
    setMenmonic(entropyToMnemonic(randomBytes(16)));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.SyntheticEvent) => {
      const id = 'add_railgun_wallet';
      e.preventDefault();
      if (password !== confirmPassword) {
        return toast({ id, status: 'error', description: 'Passwords do not match' });
      }
      if (!isValidMnemonic(mnemonic)) {
        return toast({ id, status: 'error', description: `Invalid mnemonic: ${mnemonic}!` });
      }
      toast({ id, status: 'loading', description: 'Creating Railgun wallet' });
      try {
        await createWallet(password, mnemonic);
        toast.update(id, { status: 'success', description: 'Railgun wallet created' });
        onClose();
      } catch (error) {
        toast.update(id, { status: 'error', description: 'Failed to create Railgun wallet' });
      }
    },
    [password, confirmPassword, mnemonic, createWallet, onClose, toast]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Railgun Wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired={true}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              placeholder="Enter your password again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <FormLabel>Mnemonic</FormLabel>
            <InputGroup size="lg">
              <Input
                placeholder="Enter mnemonic"
                size="lg"
                value={mnemonic}
                onChange={(e) => setMenmonic(e.target.value)}
              />
              <InputRightElement width="4.5rem">
                <Button onClick={generateMenmonic}>Auto</Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button mr={3} onClick={handleSubmit}>
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
