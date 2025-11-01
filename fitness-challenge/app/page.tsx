'use client';

import { useAccount } from 'wagmi';
import {
  useTotalExercises,
  useContractBalance,
  useParticipantData,
  useCurrentSeasonInfo,
} from '@/hooks/useChallengePool';
import { TotalStats } from '@/components/TotalStats';
import { Leaderboard } from '@/components/Leaderboard';
import { EventsFeed } from '@/components/EventsFeed';
import { DepositCard } from '@/components/DepositCard';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { totalFlex, totalAbd, totalKm, participantsCount } = useTotalExercises();
  const { balance: contractBalance } = useContractBalance();
  const participantData = useParticipantData(address);
  const { seasonId, isActive } = useCurrentSeasonInfo();

  return (
    <main className="min-h-screen bg-base-200 p-4 md:p-6">
      <div className="w-full mx-auto px-2 md:px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-2">🏋️ Fitness Challenge</h1>
          <p className="text-lg text-base-content/70">
            Complete 3 goals before the season ends to withdraw your deposit
          </p>
        </header>

        {isConnected && address && !participantData.isParticipating && (
          <div className="mb-8">
            <DepositCard />
          </div>
        )}

        {!isConnected && (
          <div className="mb-8 card bg-primary text-primary-content shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Ready to compete?</h2>
              <p>
                Connect your wallet in the top right to join the challenge and start tracking
                your exercises.
              </p>
            </div>
          </div>
        )}

        {/* 3-Column Layout: Stats | Leaderboard | Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 auto-rows-max lg:auto-rows-fr">
          {/* Left Column: Stats */}
          <div className="lg:col-span-1">
            <TotalStats
              totalFlex={totalFlex}
              totalAbd={totalAbd}
              totalKm={totalKm}
              participantsCount={participantsCount}
              contractBalance={contractBalance}
              seasonId={seasonId}
              isSeasonActive={isActive}
            />
          </div>

          {/* Center Column: Leaderboard */}
          <div className="lg:col-span-2">
            <Leaderboard />
          </div>

          {/* Right Column: Events Feed */}
          <div className="lg:col-span-2">
            <EventsFeed />
          </div>
        </div>
      </div>
    </main>
  );
}
