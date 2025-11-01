'use client';

import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useParticipantData, useChallengeDates } from '@/hooks/useChallengePool';
import { AddExercisesForm } from '@/components/AddExercisesForm';
import { WithdrawButton } from '@/components/WithdrawButton';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const participantData = useParticipantData(address);
  const { hasEnded } = useChallengeDates();

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-base-200 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Connect wallet to access dashboard</h1>
          <Link href="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  if (!participantData.isParticipating) {
    return (
      <main className="min-h-screen bg-base-200 p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Deposit 0.005 ETH to access dashboard</h1>
          <Link href="/" className="btn btn-primary">
            Go Home and Deposit
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-base-content/70">Track and update your exercises</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Your Progress</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Flexões</span>
                    <span className="text-sm font-bold">{participantData.flexoes.toString()}/1000</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={Number(participantData.flexoes)}
                    max="1000"
                  ></progress>
                  <div className="text-xs mt-1">
                    {participantData.flexoes >= 1000n ? '✅ Complete' : `${(1000n - participantData.flexoes).toString()} remaining`}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Abdominais</span>
                    <span className="text-sm font-bold">{participantData.abdominais.toString()}/1000</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={Number(participantData.abdominais)}
                    max="1000"
                  ></progress>
                  <div className="text-xs mt-1">
                    {participantData.abdominais >= 1000n ? '✅ Complete' : `${(1000n - participantData.abdominais).toString()} remaining`}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Corrida (km)</span>
                    <span className="text-sm font-bold">{participantData.km.toString()}/100</span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={Number(participantData.km)}
                    max="100"
                  ></progress>
                  <div className="text-xs mt-1">
                    {participantData.km >= 100n ? '✅ Complete' : `${(100n - participantData.km).toString()} remaining`}
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              <div className={`alert ${participantData.bateuMeta ? 'alert-success' : 'alert-info'}`}>
                <span>{participantData.bateuMeta ? '✅ You completed all 3 goals!' : '⏳ Complete all 3 goals to win'}</span>
              </div>

              <div className="divider"></div>

              <WithdrawButton hasEnded={hasEnded} bateuMeta={participantData.bateuMeta} />
            </div>
          </div>

          {!hasEnded && <AddExercisesForm />}
        </div>
      </div>
    </main>
  );
}
