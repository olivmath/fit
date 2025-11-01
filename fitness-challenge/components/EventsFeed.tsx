'use client';

import { useEffect, useState } from 'react';
import { useWatchContractEvent, usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import ABI from '@/config/abi.json';

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CHALLENGE_POOL_ADDRESS ||
  '0x5FbDB2315678afecb367f032d93F642f64180aa3') as `0x${string}`;

interface Event {
  id: string;
  type: 'deposit' | 'exercise' | 'goal_completed' | 'prize_distributed';
  user: string;
  details: string;
  timestamp: number;
}

export function EventsFeed() {
  const [events, setEvents] = useState<Event[]>([]);
  const publicClient = usePublicClient();

  // Listen for exercise events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    eventName: 'ExerciciosAdicionados',
    onLogs: (logs: any[]) => {
      logs.forEach((log) => {
        const args = log.args as any;
        const flexoes = Number(args?.flexoes || 0);
        const abdominais = Number(args?.abdominais || 0);
        const km = Number(args?.kmCorrida || 0);

        let detailParts: string[] = [];
        if (flexoes > 0) detailParts.push(`${flexoes} push-ups`);
        if (abdominais > 0) detailParts.push(`${abdominais} sit-ups`);
        if (km > 0) detailParts.push(`${km} km`);

        const event: Event = {
          id: `exercise-${log.blockNumber}-${log.logIndex}`,
          type: 'exercise',
          user: args?.user || '',
          details: `Added ${detailParts.join(', ')}`,
          timestamp: Date.now(),
        };

        setEvents((prev) => {
          const filtered = prev.filter((e) => e.id !== event.id);
          return [event, ...filtered].slice(0, 20);
        });
      });
    },
  });

  // Listen for deposit events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    eventName: 'DepositoRealizado',
    onLogs: (logs: any[]) => {
      logs.forEach((log) => {
        const args = log.args as any;
        const amount = args?.amount ? formatEther(args.amount) : '0';

        const event: Event = {
          id: `deposit-${log.blockNumber}-${log.logIndex}`,
          type: 'deposit',
          user: args?.user || '',
          details: `Deposited ${amount} ETH`,
          timestamp: Date.now(),
        };

        setEvents((prev) => {
          const filtered = prev.filter((e) => e.id !== event.id);
          return [event, ...filtered].slice(0, 20);
        });
      });
    },
  });

  // Listen for goal completed events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    eventName: 'MetaBatida',
    onLogs: (logs: any[]) => {
      logs.forEach((log) => {
        const args = log.args as any;

        const event: Event = {
          id: `goal-${log.blockNumber}-${log.logIndex}`,
          type: 'goal_completed',
          user: args?.user || '',
          details: 'Completed all goals!',
          timestamp: Date.now(),
        };

        setEvents((prev) => {
          const filtered = prev.filter((e) => e.id !== event.id);
          return [event, ...filtered].slice(0, 20);
        });
      });
    },
  });

  // Listen for prize distributed events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    eventName: 'PremioDitribuido',
    onLogs: (logs: any[]) => {
      logs.forEach((log) => {
        const args = log.args as any;
        const amount = args?.amount ? formatEther(args.amount) : '0';

        const event: Event = {
          id: `prize-${log.blockNumber}-${log.logIndex}`,
          type: 'prize_distributed',
          user: args?.user || '',
          details: `Won ${amount} ETH!`,
          timestamp: Date.now(),
        };

        setEvents((prev) => {
          const filtered = prev.filter((e) => e.id !== event.id);
          return [event, ...filtered].slice(0, 20);
        });
      });
    },
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'exercise':
        return '💪';
      case 'goal_completed':
        return '🎯';
      case 'prize_distributed':
        return '🏆';
      default:
        return '📝';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-blue-50 border-l-4 border-blue-500';
      case 'exercise':
        return 'bg-green-50 border-l-4 border-green-500';
      case 'goal_completed':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'prize_distributed':
        return 'bg-purple-50 border-l-4 border-purple-500';
      default:
        return 'bg-gray-50 border-l-4 border-gray-500';
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl h-full flex flex-col">
      <div className="card-body flex-1 flex flex-col">
        <h2 className="card-title">Recent Activity</h2>
        <div className="divider"></div>

        <div className="space-y-2 flex-1 overflow-y-auto">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded-lg flex items-start gap-3 ${getEventColor(
                  event.type
                )}`}
              >
                <span className="text-xl flex-shrink-0">{getEventIcon(event.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-sm">
                    <span className="font-mono text-xs">
                      {event.user.slice(0, 6)}...{event.user.slice(-4)}
                    </span>
                    <span className="opacity-70">{event.details}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 opacity-50">
              <p>No activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
