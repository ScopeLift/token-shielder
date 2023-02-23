import { useEffect, useState } from 'react';
import { getShieldPrivateKeySignatureMessage } from '@railgun-community/quickstart';
import { Signer } from 'ethers';
import { keccak256 } from 'ethers/lib/utils.js';
import { useAccount, useSigner } from 'wagmi';

const useShieldPrivateKey = () => {
  const { data: signer } = useSigner();
  const [shieldPrivateKey, setShieldPrivateKey] = useState<string>();
  const { address } = useAccount();

  useEffect(() => {
    setShieldPrivateKey(undefined);
  }, [address]);

  const getShieldPrivateKey = async () => {
    if (shieldPrivateKey) return shieldPrivateKey;
    const spk = keccak256(
      await (signer as Signer).signMessage(getShieldPrivateKeySignatureMessage())
    );
    setShieldPrivateKey(spk);
    return spk;
  };
  return { shieldPrivateKey, getShieldPrivateKey };
};

export default useShieldPrivateKey;
