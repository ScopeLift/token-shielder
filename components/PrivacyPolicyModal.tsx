import { Flex, Heading, Link, ListItem, Text, UnorderedList } from '@chakra-ui/layout';
import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/modal';

type PrivacyPolicyModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const PrivacyPolicy = () => {
  return (
    <Flex
      className="container"
      direction="column"
      maxWidth="40rem"
      marginTop="3rem"
      marginBottom="3rem"
    >
      <Heading as="h1" size="lg" alignSelf="center" mb="1rem">
        Privacy Policy
      </Heading>
      <Heading as="h4" size="sm" marginTop="1rem">
        What information do we collect?
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        We do not intentionally collect or store any personally identifiable information.{' '}
      </Text>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        When using our site, our cloud hosting providers may record the IP address that your request
        originated from. They may also retain server logs which include the IP address of every
        request to their servers. They may also collect other information from your requests.
      </Text>

      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        Our current first-party cloud hosting providers are:
      </Text>
      <UnorderedList fontSize="sm" mt="1rem" ml="2rem">
        <ListItem>
          <Link href="https://www.netlify.com/" isExternal textDecoration="underline">
            Netlify
          </Link>
        </ListItem>
        <ListItem>
          <Link href="https://www.namecheap.com/" isExternal textDecoration="underline">
            Namecheap
          </Link>
        </ListItem>
      </UnorderedList>

      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        Our cloud hosting providers may outsource some or all of the services they offer to other
        third parties. The third parties may themselves retain server logs which include the IP
        address of every request to their servers.
      </Text>
      <Heading as="h4" size="sm" marginTop="1rem">
        What do we use your information for?
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        We do not use your information for any purpose beyond the default logging functionality
        provided by our cloud hosting providers.
      </Text>
      <Heading as="h4" size="sm" marginTop="1rem">
        How do we protect your information?
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        We implement a variety of security measures to maintain the safety of your personal
        information when you enter, submit, or access your personal information.
      </Text>
      <Heading as="h4" size="sm" marginTop="1rem">
        What is your data retention policy?
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        We do not use cookies. We do use local browser storage to store user preferences and
        settings between sessions. This data is never used to track users, and not sent anywhere
        beyond the user’s local device. We do not control the data retention policies of our cloud
        hosting providers.
      </Text>
      <Heading as="h4" size="sm" marginTop="1rem">
        Do we disclose any information to outside parties?
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        We do not sell, trade, or otherwise transfer to outside parties your personally identifiable
        information. We have no way to respond to requests for any personally identifiable
        information from third parties because we do not collect it. We do not use data, personally
        identifiable or otherwise, for marketing, advertising, or other uses. We will always comply
        with the law. We do not control the disclosure policies of our cloud hosting providers.
      </Text>
      <Heading as="h4" size="sm" marginTop="1rem">
        Third party links
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        Occasionally, at our discretion, we may include or offer third party products or services on
        our site. These third party sites have separate and independent privacy policies. We
        therefore have no responsibility or liability for the content and activities of these linked
        sites. Nonetheless, we seek to protect the integrity of our site and welcome any feedback
        about these sites.
      </Text>
      <Heading as="h4" size="sm" marginTop="1rem">
        Children’s Online Privacy Protection Act Compliance
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        Our site, products and services are all directed to people who are at least 13 years old or
        older. If this server is in the USA, and you are under the age of 13, per the requirements
        of COPPA (Children’s Online Privacy Protection Act), do not use this site.
      </Text>
      <Heading as="h4" size="sm" marginTop="1rem">
        Online Privacy Policy Only
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        This online privacy policy applies only to information collected through our site and not to
        information collected offline.
      </Text>
      <Heading as="h4" size="sm" marginTop="1rem">
        Your Consent
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        By using our site, you consent to our web site privacy policy.
      </Text>

      <Heading as="h4" size="sm" mt="1rem">
        Changes to our Privacy Policy
      </Heading>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        If we decide to change our privacy policy, we will post those changes on this page.
      </Text>
      <Text fontSize="sm" marginTop="1rem" textAlign="justify">
        This document is CC-BY-SA. It was last updated April 11th, 2023.
      </Text>
    </Flex>
  );
};

export const PrivacyPolicyModal = ({ isOpen, onClose }: PrivacyPolicyModalProps) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <PrivacyPolicy />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
