import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Flex, Link, Text } from '@chakra-ui/layout';
import { useDisclosure } from '@chakra-ui/react';
import { HowItWorksModal } from '@/components/HowItWorks';

const Footer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Flex h="100%" paddingLeft="4rem" gap="1rem" align="center">
      <Text size="sm" cursor="pointer" onClick={onOpen}>
        How it works?
      </Text>
      <Link href="https://github.com/ScopeLift/token-shielder" isExternal>
        <Flex align="center">
          Github <ExternalLinkIcon mx="4px" />
        </Flex>
      </Link>
      <HowItWorksModal onClose={onClose} isOpen={isOpen} />
    </Flex>
  );
};

export default Footer;
