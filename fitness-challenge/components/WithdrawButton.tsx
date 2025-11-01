'use client';

import { useState } from 'react';
import { useDistributePrizes } from '@/hooks/useChallengePool';
import toast from 'react-hot-toast';

type Props = {
  hasEnded: boolean;
  bateuMeta: boolean;
};

export function WithdrawButton({ hasEnded, bateuMeta }: Props) {
  const [loading, setLoading] = useState(false);
  const { distributePrizes } = useDistributePrizes();

  if (!hasEnded) {
    return (
      <div className="alert alert-info">
        <span>Challenge is still ongoing. Come back after November 30th to claim your prize!</span>
      </div>
    );
  }

  if (!bateuMeta) {
    return (
      <div className="alert alert-warning">
        <span>You did not complete all 3 goals. Better luck next time!</span>
      </div>
    );
  }

  const handleWithdraw = async () => {
    try {
      setLoading(true);
      await distributePrizes();
      toast.success('Prize claimed! Check your wallet.');
    } catch (error) {
      toast.error('Failed to claim prize');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn btn-success btn-lg w-full"
      onClick={handleWithdraw}
      disabled={loading}
    >
      {loading ? 'Processing...' : '🎉 Claim Prize!'}
    </button>
  );
}
