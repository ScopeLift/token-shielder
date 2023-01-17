import useNotifications from "@/hooks/useNotifications";
import useShieldPrivateKey from "@/hooks/useShieldPrivateKey";
import { Button } from "@chakra-ui/button";
import { Heading, Flex, Box, Text } from "@chakra-ui/layout";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/modal";
import {
  gasEstimateForShield,
  populateShield,
} from "@railgun-community/quickstart";
import {
  RailgunERC20AmountRecipient,
  NetworkName,
  TransactionGasDetailsSerialized,
  EVMGasType,
  NETWORK_CONFIG,
  deserializeTransaction,
} from "@railgun-community/shared-models";
import { ethers, constants, BigNumber } from "ethers";
import { useAccount, useProvider, useSigner } from "wagmi";

type ReviewTransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  tokenAddress?: string;
  recipient: string;
  tokenAmount?: string;
  tokenDecimals?: number;
  serializedTransaction: string;
};

// Modal info
// 1. amount
// 2. tokens
// 3. recipient
// 4. Shielding and gas fees
const ReviewTransactionModal = (props: ReviewTransactionModalProps) => {
  const network = NetworkName.EthereumGoerli; // TODO: Remove once we support multiple chains
  const { getShieldPrivateKey } = useShieldPrivateKey();
  const { isConnected, address } = useAccount();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const { txNotify } = useNotifications();

  const doSubmit: React.FormEventHandler = async (e) => {
    // TODO: Form validation
    // Formatted token amounts and recipients.
    const { chain } = NETWORK_CONFIG[network];

    const transactionRequest: ethers.providers.TransactionRequest =
      deserializeTransaction(
        props.serializedTransaction,
        undefined, // nonce (optional)
        chain.id
      );

    // Public wallet to shield from.
    transactionRequest.from = address;
    // TODO: handle transaction status and notifications in a feature
    const tx = await signer?.sendTransaction(transactionRequest);
    await tx?.wait().then(() => {
      txNotify(tx.hash);
    });
  };

  return (
    <Modal onClose={props.onClose} isOpen={props.isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm Shield</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column">
            <Flex align="center" justify="space-between">
              <Heading size="xs" paddingX={2}>
                Recipient Addr
              </Heading>
              <Text size="sm">0x</Text>
            </Flex>
            <Flex align="center" justify="space-between">
              <Heading size="xs" paddingX={2}>
                Token name
              </Heading>
              <Text size="sm">WETH</Text>
            </Flex>
            <Flex align="center" justify="space-between">
              <Heading size="xs" paddingX={2}>
                Amount
              </Heading>
              <Text size="sm">1</Text>
            </Flex>
            <Flex align="center" justify="space-between">
              <Heading size="xs" paddingX={2}>
                Shielding fee
              </Heading>
              <Text size="sm">1</Text>
            </Flex>
            <Flex align="center" justify="space-between">
              <Heading size="xs" paddingX={2}>
                Gas fee
              </Heading>
              <Text size="sm">1</Text>
            </Flex>
            <Flex align="center" justify="space-between">
              <Heading size="xs" paddingX={2}>
                Total
              </Heading>
              <Text size="sm">1</Text>
            </Flex>
          </Flex>
          <Button onClick={doSubmit}>Shield</Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ReviewTransactionModal;
