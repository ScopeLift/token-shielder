import { notFound } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Home from '@/pages/index';

const Send = () => {
  const searchParams = useSearchParams();
  const zkAddress = searchParams.get('address');

  if (!zkAddress) {
    return notFound();
  }
  return <Home recipientAddress={zkAddress} />;
};

export default Send;
