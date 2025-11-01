'use client';

import { useAccount } from 'wagmi';
import Link from 'next/link';
import { useParticipantData, useChallengeDates } from '@/hooks/useChallengePool';
import { AddExercisesForm } from '@/components/AddExercisesForm';
import { WithdrawButton } from '@/components/WithdrawButton';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const participantData = useParticipantData(address);
  const { endDate, now } = useChallengeDates();

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary to-primary-focus p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-4xl font-bold mb-4 text-primary-content">Connect wallet to access dashboard</h1>
          <Link href="/" className="btn btn-lg btn-neutral">
            Go Home
          </Link>
        </div>
      </main>
    );
  }

  if (!participantData.isParticipating) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-primary to-primary-focus p-4 md:p-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-4xl font-bold mb-4 text-primary-content">Deposit 0.005 ETH to access dashboard</h1>
          <Link href="/" className="btn btn-lg btn-neutral">
            Go Home and Deposit
          </Link>
        </div>
      </main>
    );
  }

  const timeRemaining = Math.max(0, Number(endDate - now));
  const daysRemaining = Math.floor(timeRemaining / 86400);
  const hoursRemaining = Math.floor((timeRemaining % 86400) / 3600);
  const hasEnded = timeRemaining === 0;

  const getGoalPercentage = (value: bigint, max: number) => {
    return Math.min(100, Math.floor((Number(value) / max) * 100));
  };

  const flexoesPercent = getGoalPercentage(participantData.flexoes, 1000);
  const abdominaisPercent = getGoalPercentage(participantData.abdominais, 1000);
  const kmPercent = getGoalPercentage(participantData.km, 100);

  return (
    <main className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary-focus text-primary-content rounded-2xl p-8 md:p-12 mb-8 shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Welcome back! 💪</h1>
          <p className="text-lg opacity-90 mb-6">Keep pushing towards your goals</p>

          {!hasEnded && (
            <div className="flex gap-8">
              <div className="flex-1">
                <div className="text-sm opacity-75">Time Remaining</div>
                <div className="text-3xl font-bold">{daysRemaining}d {hoursRemaining}h</div>
              </div>
              <div className="flex-1">
                <div className="text-sm opacity-75">Status</div>
                <div className={`text-2xl font-bold ${participantData.bateuMeta ? 'text-success' : 'text-warning'}`}>
                  {participantData.bateuMeta ? '✅ Goals Complete!' : '⏳ In Progress'}
                </div>
              </div>
            </div>
          )}

          {hasEnded && (
            <div className="alert alert-info">
              <span>Challenge has ended. You can withdraw your rewards if you completed all goals.</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Progress Cards */}
          <div className="card bg-base-100 shadow-xl border-l-4 border-blue-500">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title text-lg">💪 Push-ups</h3>
                <span className="text-sm font-bold">{flexoesPercent}%</span>
              </div>
              <div className="space-y-2">
                <progress
                  className="progress progress-primary w-full"
                  value={Number(participantData.flexoes)}
                  max="1000"
                ></progress>
                <div className="flex justify-between text-sm">
                  <span className="font-mono">{participantData.flexoes.toString()}/1000</span>
                  <span className={participantData.flexoes >= 1000n ? 'text-success font-bold' : 'opacity-70'}>
                    {participantData.flexoes >= 1000n ? '✅ Done!' : `${(1000n - participantData.flexoes).toString()} left`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl border-l-4 border-orange-500">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title text-lg">🔥 Sit-ups</h3>
                <span className="text-sm font-bold">{abdominaisPercent}%</span>
              </div>
              <div className="space-y-2">
                <progress
                  className="progress progress-warning w-full"
                  value={Number(participantData.abdominais)}
                  max="1000"
                ></progress>
                <div className="flex justify-between text-sm">
                  <span className="font-mono">{participantData.abdominais.toString()}/1000</span>
                  <span className={participantData.abdominais >= 1000n ? 'text-success font-bold' : 'opacity-70'}>
                    {participantData.abdominais >= 1000n ? '✅ Done!' : `${(1000n - participantData.abdominais).toString()} left`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl border-l-4 border-green-500">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title text-lg">🏃 Running</h3>
                <span className="text-sm font-bold">{kmPercent}%</span>
              </div>
              <div className="space-y-2">
                <progress
                  className="progress progress-success w-full"
                  value={Number(participantData.km)}
                  max="100"
                ></progress>
                <div className="flex justify-between text-sm">
                  <span className="font-mono">{participantData.km.toString()}/100 km</span>
                  <span className={participantData.km >= 100n ? 'text-success font-bold' : 'opacity-70'}>
                    {participantData.km >= 100n ? '✅ Done!' : `${(100n - participantData.km).toString()} left`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Achievement */}
          <div className="card bg-base-100 shadow-xl lg:col-span-1">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">Achievement</h3>
              <div className="flex flex-col items-center justify-center py-4">
                {participantData.bateuMeta ? (
                  <>
                    <div className="text-6xl mb-4">🏆</div>
                    <h4 className="text-xl font-bold text-success text-center">All Goals Completed!</h4>
                    <p className="text-sm opacity-70 text-center mt-2">You&apos;re eligible for prize distribution</p>
                    <div className="divider"></div>
                    <WithdrawButton isParticipating={true} bateuMeta={true} hasWithdrawn={participantData.hasWithdrawn} />
                  </>
                ) : (
                  <>
                    <div className="text-6xl mb-4 opacity-50">🎯</div>
                    <h4 className="text-lg font-bold text-center">Keep Going!</h4>
                    <p className="text-sm opacity-70 text-center mt-2">Complete all 3 goals to win</p>
                    <div className="divider"></div>
                    <div className="text-center">
                      <div className="text-xs opacity-70 mb-2">Completed: {[participantData.flexoes >= 1000n, participantData.abdominais >= 1000n, participantData.km >= 100n].filter(Boolean).length}/3</div>
                      <div className="flex gap-2 justify-center">
                        <div className={`w-3 h-3 rounded-full ${participantData.flexoes >= 1000n ? 'bg-success' : 'bg-base-300'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${participantData.abdominais >= 1000n ? 'bg-success' : 'bg-base-300'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${participantData.km >= 100n ? 'bg-success' : 'bg-base-300'}`}></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Add Exercise Form */}
          {!hasEnded && (
            <div className="lg:col-span-2">
              <AddExercisesForm />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
