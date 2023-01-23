import { getEtherscanUrl } from "@/utils/networks";
import { Box, Link } from "@chakra-ui/layout";
import { AlertStatus } from "@chakra-ui/react";
import {
  useToast,
  ToastId,
  ToastPosition,
  Toast,
  ToastProps,
  CreateToastFnReturn,
} from "@chakra-ui/toast";
import { useRef } from "react";
import { useProvider } from "wagmi";

const toastDefaultArgs = {
  position: "bottom-right" as ToastPosition,
  duration: 5000,
  isClosable: true,
};

const useNotifications = () => {
  const defaultTimeout = 5000;
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
      status: "loading",
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
      status: status ? "success" : "error",
    });
  };

  return {
    notifyUser,
    txNotify,
  };
};

export default useNotifications;
