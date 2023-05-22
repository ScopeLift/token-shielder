import { useEffect } from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Flex, Link } from '@chakra-ui/layout';
import { useDisclosure } from '@chakra-ui/react';
import localforage from 'localforage';
import { HowItWorksModal } from '@/components/HowItWorks';

const Footer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const openModalIfFirstSession = async () => {
      return localforage.getItem('seen').then((isNotFirstSession) => {
        const isFirstSession = !isNotFirstSession;
        if (isFirstSession) {
          onOpen();
          localforage.setItem('seen', true);
        }
      });
    };

    openModalIfFirstSession();
  }, [onOpen]);

  return (
    <Flex h="100%" gap="1rem" align="center">
      <Link size="sm" cursor="pointer" onClick={onOpen}>
        How does it work?
      </Link>
      <Link href="https://github.com/venture23-zkp/railgun-integrations-ui" isExternal>
        <Flex align="center">
          Github <ExternalLinkIcon mx="4px" />
        </Flex>
      </Link>
      <HowItWorksModal onClose={onClose} isOpen={isOpen} />
    </Flex>
  );
};

export default Footer;
