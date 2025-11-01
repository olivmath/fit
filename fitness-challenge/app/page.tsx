'use client';

import { useAccount } from 'wagmi';
import { useTotalExercises, useLeaderboards, useParticipantData } from '@/hooks/useChallengePool';
import { LeaderboardCard } from '@/components/LeaderboardCard';
import { TotalStats } from '@/components/TotalStats';
import { DepositCard } from '@/components/DepositCard';
import { AddExercisesForm } from '@/components/AddExercisesForm';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { totalFlex, totalAbd, totalKm, participantsCount } = useTotalExercises();
  const leaderboards = useLeaderboards();
  const participantData = useParticipantData(address);

  return (
    <main className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-2">🏋️ Fitness Challenge</h1>
          <p className="text-lg text-base-content/70">November - Complete 3 goals to win ETH</p>
        </header>

        <TotalStats
          totalFlex={totalFlex}
          totalAbd={totalAbd}
          totalKm={totalKm}
          participantsCount={participantsCount}
        />

        {isConnected && address && !participantData.isParticipating && (
          <div className="mt-12">
            <DepositCard />
          </div>
        )}

        {!isConnected && (
          <div className="mt-12 card bg-primary text-primary-content shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Ready to compete?</h2>
              <p>Connect your wallet in the top right to join the challenge and start tracking your exercises.</p>
            </div>
          </div>
        )}

        <div className="divider my-12"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <LeaderboardCard
            title="🏆 General Ranking"
            addresses={leaderboards.leaderboardGeral.addresses}
            values={leaderboards.leaderboardGeral.values}
          />
          <LeaderboardCard
            title="💪 Flexões Ranking"
            addresses={leaderboards.leaderboardFlexoes.addresses}
            values={leaderboards.leaderboardFlexoes.values}
          />
          <LeaderboardCard
            title="🔥 Abdominais Ranking"
            addresses={leaderboards.leaderboardAbdominais.addresses}
            values={leaderboards.leaderboardAbdominais.values}
          />
          <LeaderboardCard
            title="🏃 Corrida Ranking"
            addresses={leaderboards.leaderboardKm.addresses}
            values={leaderboards.leaderboardKm.values}
          />
        </div>
      </div>
    </main>
  );
}
