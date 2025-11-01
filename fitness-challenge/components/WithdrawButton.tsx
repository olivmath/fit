'use client';

import { useState } from 'react';
import { useWithdraw, useCanWithdraw } from '@/hooks/useChallengePool';
import toast from 'react-hot-toast';

type Props = {
  isParticipating: boolean;
  bateuMeta: boolean;
  hasWithdrawn: boolean;
};

export function WithdrawButton({ isParticipating, bateuMeta, hasWithdrawn }: Props) {
  const [loading, setLoading] = useState(false);
  const { withdraw } = useWithdraw();
  const { canWithdraw: can, reason } = useCanWithdraw();

  if (!isParticipating) {
    return (
      <div className="alert alert-info">
        <span>You are not participating in this season. Deposit 0.005 ETH to join!</span>
      </div>
    );
  }

  if (hasWithdrawn) {
    return (
      <div className="alert alert-success">
        <span>You have already withdrawn your deposit this season. Good luck next time!</span>
      </div>
    );
  }

  const handleWithdraw = async () => {
    try {
      setLoading(true);
      await withdraw();
      // Toast is already handled in useWithdraw hook
    } catch (error) {
      // Error toast is already handled in useWithdraw hook
      console.error('Withdrawal error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!can) {
    return (
      <div className="alert alert-warning">
        <span>{reason || 'You cannot withdraw yet. Complete the challenge or wait for the season to end.'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {bateuMeta && (
        <div className="alert alert-success">
          <span>🎉 You completed the challenge! Withdraw your deposit now.</span>
        </div>
      )}
      <button
        className="btn btn-success btn-lg w-full"
        onClick={handleWithdraw}
        disabled={loading}
      >
        {loading ? 'Processing...' : `${bateuMeta ? '✨ Claim Deposit' : 'Withdraw'}`}
      </button>
    </div>
  );
}
