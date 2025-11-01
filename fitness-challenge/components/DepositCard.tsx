'use client';

import { useState } from 'react';
import { useDeposit } from '@/hooks/useChallengePool';
import toast from 'react-hot-toast';

export function DepositCard() {
  const [loading, setLoading] = useState(false);
  const { deposit } = useDeposit();

  const handleDeposit = async () => {
    try {
      setLoading(true);
      await deposit();
      toast.success('Deposit initiated!');
    } catch (error) {
      toast.error('Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-success text-success-content shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Join the Challenge!</h2>
        <p>Deposit 0.005 ETH to participate in this season&apos;s fitness challenge.</p>
        <p className="text-sm opacity-80">
          Complete all 3 goals before the season ends to withdraw your deposit!
        </p>
        <div className="text-sm opacity-90 mt-2 space-y-1">
          <div>• 1000 push-ups</div>
          <div>• 1000 sit-ups</div>
          <div>• 100 km running</div>
        </div>
        <button
          className="btn btn-primary mt-4"
          onClick={handleDeposit}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Deposit 0.005 ETH'}
        </button>
      </div>
    </div>
  );
}
