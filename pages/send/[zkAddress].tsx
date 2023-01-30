'use client';

import { notFound } from 'next/navigation';
import { useRouter } from 'next/router';
import Home from '@/pages/index';

const Send = () => {
  const router = useRouter();
  const { zkAddress } = router.query;
  if (Array.isArray(zkAddress)) {
    return notFound();
  }
  return <Home recipientAddress={zkAddress} />;
};

export default Send;
