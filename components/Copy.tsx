import { Box } from '@chakra-ui/layout';
import useNotifications from '@/hooks/useNotifications';

const Copy = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const { notifyUser } = useNotifications();
  const onCopy = () => {
    navigator.clipboard.writeText(text);
    notifyUser({
      alertType: 'success',
      message: 'Added link to clipboard',
    });
  };
  return <Box onClick={onCopy}>{children}</Box>;
};

export default Copy;
