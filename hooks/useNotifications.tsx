import { getEtherscanUrl } from "../utils/networks";
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
  position: "top-right" as ToastPosition,
  duration: 5000,
  isClosable: true,
};

const toastLink = ({
  toast,
  title,
  description,
  status,
  id,
  duration,
  icon,
  href,
  ...props
}: ToastProps & { toast: CreateToastFnReturn; href: string }) => {
  return toast({
    ...props,
    render: () => (
      <Link href={href} isExternal>
        <Toast {...props} />
      </Link>
    ),
  });
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
    toastIdRef.current = toastLink({
      ...toastDefaultArgs,
      toast,
      href,
      description: "Transaction pending",
      status: "loading",
    });

    const { status } = await provider.waitForTransaction(txHash);
    toast.update(toastIdRef.current, {
      description: status ? "Transaction succeeded" : "Transaction failed",
      status: status ? "success" : "error",
    });
  };

  return {
    notifyUser,
    txNotify,
  };
};

export default useNotifications;
