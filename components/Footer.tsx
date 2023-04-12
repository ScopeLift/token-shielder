import { useEffect } from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Flex, Link } from '@chakra-ui/layout';
import { useDisclosure } from '@chakra-ui/react';
import localforage from 'localforage';
import { HowItWorksModal } from '@/components/HowItWorks';
import { PrivacyPolicyModal } from '@/components/PrivacyPolicyModal';

const Footer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isPrivacyModalOpen,
    onOpen: onPrivacyModalOpen,
    onClose: onPrivacyModalClose,
  } = useDisclosure();

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
      <Link size="sm" cursor="pointer" onClick={onPrivacyModalOpen}>
        Privacy Policy
      </Link>
      <Link href="https://github.com/ScopeLift/token-shielder" isExternal>
        <Flex align="center">
          Github <ExternalLinkIcon mx="4px" />
        </Flex>
      </Link>
      <HowItWorksModal onClose={onClose} isOpen={isOpen} />
      <PrivacyPolicyModal onClose={onPrivacyModalClose} isOpen={isPrivacyModalOpen} />
    </Flex>
  );
};

export default Footer;
