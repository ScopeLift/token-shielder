import { useRef } from 'react';
import { Link } from '@chakra-ui/layout';
import { AlertStatus } from '@chakra-ui/react';
import { ToastId, ToastPosition, useToast } from '@chakra-ui/toast';
import { useProvider } from 'wagmi';
import { getEtherscanUrl } from '@/utils/networks';

const toastDefaultArgs = {
  position: 'bottom-right' as ToastPosition,
  duration: 5000,
  isClosable: true,
};

const useNotifications = () => {
  const provider = useProvider();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();

  const notifyUser = ({
    title,
    alertType,
    message,
  }: {
    alertType: AlertStatus;
    message: string;
    title?: string;
  }) => {
    toast({
      ...toastDefaultArgs,
      description: message,
      title,
      status: alertType,
    });
  };

  // TODO: Based on the umbra implementation of BNC and untested
  const txNotify = async (txHash: string) => {
    const { chainId } = await provider.getNetwork();
    const href = getEtherscanUrl(txHash, chainId);
    toastIdRef.current = toast({
      ...toastDefaultArgs,
      isClosable: false,
      description: (
        <Link href={href} isExternal>
          Transaction Pending
        </Link>
      ),

      duration: null,
      status: 'loading',
    });

    const { status } = await provider.waitForTransaction(txHash);
    toast.update(toastIdRef.current, {
      ...toastDefaultArgs,
      description: status ? (
        <Link href={href} isExternal>
          Transaction succeeded
        </Link>
      ) : (
        <Link href={href} isExternal>
          Transaction failed
        </Link>
      ),
      status: status ? 'success' : 'error',
    });
  };

  return {
    notifyUser,
    txNotify,
  };
};

export default useNotifications;
