import { useSearchParams } from 'next/navigation';
import Home from '@/pages/index';

const Send = () => {
  const searchParams = useSearchParams();
  const zkAddress = searchParams.get('address');

  return <Home recipientAddress={zkAddress || undefined} />;
};

export default Send;
