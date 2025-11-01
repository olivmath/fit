'use client';

import { useState } from 'react';
import { useLeaderboards } from '@/hooks/useChallengePool';

type LeaderboardType = 'overall' | 'pushups' | 'situps' | 'running';

interface LeaderboardEntry {
  rank: number;
  address: string;
  value: bigint;
}

export function Leaderboard() {
  const [type, setType] = useState<LeaderboardType>('overall');
  const { leaderboardGeral, leaderboardFlexoes, leaderboardAbdominais, leaderboardKm } =
    useLeaderboards();

  const getLeaderboardData = (): LeaderboardEntry[] => {
    let addresses: `0x${string}`[] = [];
    let values: bigint[] = [];

    switch (type) {
      case 'overall':
        addresses = leaderboardGeral.addresses;
        values = leaderboardGeral.values;
        break;
      case 'pushups':
        addresses = leaderboardFlexoes.addresses;
        values = leaderboardFlexoes.values;
        break;
      case 'situps':
        addresses = leaderboardAbdominais.addresses;
        values = leaderboardAbdominais.values;
        break;
      case 'running':
        addresses = leaderboardKm.addresses;
        values = leaderboardKm.values;
        break;
    }

    return addresses.map((address, idx) => ({
      rank: idx + 1,
      address,
      value: values[idx] || 0n,
    }));
  };

  const getDisplayUnit = (): string => {
    switch (type) {
      case 'pushups':
        return 'push-ups';
      case 'situps':
        return 'sit-ups';
      case 'running':
        return 'km';
      default:
        return 'total';
    }
  };

  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-900';
    if (rank === 2) return 'bg-gray-100 text-gray-900';
    if (rank === 3) return 'bg-orange-100 text-orange-900';
    return '';
  };

  const leaderboardData = getLeaderboardData();
  const displayUnit = getDisplayUnit();

  const tabs = [
    { id: 'overall', label: 'Overall' },
    { id: 'pushups', label: 'Push-ups' },
    { id: 'situps', label: 'Sit-ups' },
    { id: 'running', label: 'Running' },
  ];

  return (
    <div className="card bg-base-100 shadow-xl h-full flex flex-col">
      <div className="card-body flex-1 flex flex-col">
        <h2 className="card-title">Leaderboard</h2>
        <div className="divider"></div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setType(tab.id as LeaderboardType)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                type === tab.id
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200 text-base-content hover:bg-base-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto flex-1">
          <table className="table table-sm w-full">
            <thead>
              <tr>
                <th className="w-12">Rank</th>
                <th>Address</th>
                <th className="text-right w-20">{displayUnit}</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.length > 0 ? (
                leaderboardData.map((entry) => (
                  <tr key={entry.address} className={getRankColor(entry.rank)}>
                    <td className="font-bold text-center">
                      <span className="badge badge-lg">{entry.rank}</span>
                    </td>
                    <td className="text-sm font-mono">
                      {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                    </td>
                    <td className="text-right font-semibold">
                      {entry.value.toString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-8 opacity-50">
                    No participants yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
