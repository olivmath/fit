'use client';

import { useEffect, useState } from 'react';
import { useWatchContractEvent, usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import ABI from '@/config/abi.json';

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CHALLENGE_POOL_ADDRESS ||
  '0x5FbDB2315678afecb367f032d93F642f64180aa3') as `0x${string}`;

interface Event {
  id: string;
  type: 'deposit' | 'exercise' | 'goal_completed' | 'prize_distributed' | 'challenge_ended';
  user?: string;
  details: string;
  message?: string;
  timestamp: number;
  blockNumber: number;
}

export function EventsFeed() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const publicClient = usePublicClient();

  // Fetch historical events on mount
  useEffect(() => {
    const fetchHistoricalEvents = async () => {
      if (!publicClient) return;

      try {
        setLoading(true);
        const historicalEvents: Event[] = [];
        console.log('Starting to fetch historical events...');

        // Fetch ExerciciosAdicionados events
        const exerciseEvents = await publicClient.getContractEvents({
          address: CONTRACT_ADDRESS,
          abi: ABI as any,
          eventName: 'ExerciciosAdicionados',
        });

        console.log('ExerciciosAdicionados events:', exerciseEvents.length);
        exerciseEvents.forEach((log: any) => {
          const args = log.args as any;
          const flexoes = Number(args?.flexoes || 0);
          const abdominais = Number(args?.abdominais || 0);
          const km = Number(args?.kmCorrida || 0);

          let detailParts: string[] = [];
          if (flexoes > 0) detailParts.push(`${flexoes} push-ups`);
          if (abdominais > 0) detailParts.push(`${abdominais} sit-ups`);
          if (km > 0) detailParts.push(`${km} km`);

          historicalEvents.push({
            id: `exercise-${log.blockNumber}-${log.logIndex}`,
            type: 'exercise',
            user: args?.user || '',
            details: `Added ${detailParts.join(', ')}`,
            message: args?.mensagemMotivacional || undefined,
            timestamp: 0,
            blockNumber: log.blockNumber as number,
          });
        });

        // Fetch DepositoRealizado events
        const depositEvents = await publicClient.getContractEvents({
          address: CONTRACT_ADDRESS,
          abi: ABI as any,
          eventName: 'DepositoRealizado',
        });

        console.log('DepositoRealizado events:', depositEvents.length);
        depositEvents.forEach((log: any) => {
          const args = log.args as any;
          const amount = args?.amount ? formatEther(args.amount) : '0';

          historicalEvents.push({
            id: `deposit-${log.blockNumber}-${log.logIndex}`,
            type: 'deposit',
            user: args?.user || '',
            details: `Deposited ${amount} ETH`,
            timestamp: 0,
            blockNumber: log.blockNumber as number,
          });
        });

        // Fetch MetaBatida events
        const goalEvents = await publicClient.getContractEvents({
          address: CONTRACT_ADDRESS,
          abi: ABI as any,
          eventName: 'MetaBatida',
        });

        console.log('MetaBatida events:', goalEvents.length);
        goalEvents.forEach((log: any) => {
          const args = log.args as any;

          historicalEvents.push({
            id: `goal-${log.blockNumber}-${log.logIndex}`,
            type: 'goal_completed',
            user: args?.user || '',
            details: 'Completed all goals!',
            timestamp: 0,
            blockNumber: log.blockNumber as number,
          });
        });

        // Fetch PremioDitribuido events
        const prizeEvents = await publicClient.getContractEvents({
          address: CONTRACT_ADDRESS,
          abi: ABI as any,
          eventName: 'PremioDitribuido',
        });

        console.log('PremioDitribuido events:', prizeEvents.length);
        prizeEvents.forEach((log: any) => {
          const args = log.args as any;
          const amount = args?.amount ? formatEther(args.amount) : '0';

          historicalEvents.push({
            id: `prize-${log.blockNumber}-${log.logIndex}`,
            type: 'prize_distributed',
            user: args?.user || '',
            details: `Won ${amount} ETH!`,
            timestamp: 0,
            blockNumber: log.blockNumber as number,
          });
        });

        // Fetch DesafioFinalizado events
        const challengeEndedEvents = await publicClient.getContractEvents({
          address: CONTRACT_ADDRESS,
          abi: ABI as any,
          eventName: 'DesafioFinalizado',
        });

        console.log('DesafioFinalizado events:', challengeEndedEvents.length);
        challengeEndedEvents.forEach((log: any) => {
          historicalEvents.push({
            id: `challenge-ended-${log.blockNumber}-${log.logIndex}`,
            type: 'challenge_ended',
            details: 'Challenge has ended!',
            timestamp: 0,
            blockNumber: log.blockNumber as number,
          });
        });

        // Sort by blockNumber descending (newest first) - don't limit here, limit on display
        const sorted = historicalEvents.sort((a, b) => b.blockNumber - a.blockNumber);

        // Count by type
        const countByType = sorted.reduce((acc, e) => {
          acc[e.type] = (acc[e.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        console.log('Historical events fetched:', {
          total: historicalEvents.length,
          byType: countByType,
          events: sorted.map(e => ({ id: e.id, type: e.type, blockNumber: e.blockNumber }))
        });

        setEvents(sorted.slice(0, 20));
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch historical events:', error);
        setLoading(false);
      }
    };

    fetchHistoricalEvents();
  }, [publicClient]);

  // Listen for new exercise events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    eventName: 'ExerciciosAdicionados',
    onLogs: (logs: any[]) => {
      console.log('New exercise event(s):', logs.length);
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
          message: args?.mensagemMotivacional || undefined,
          timestamp: Date.now(),
          blockNumber: log.blockNumber as number,
        };

        console.log('Adding exercise event:', event.id);
        setEvents((prev) => {
          const filtered = prev.filter((e) => e.id !== event.id);
          const updated = [event, ...filtered].slice(0, 20);
          console.log('Events after update:', updated.length);
          return updated;
        });
      });
    },
  });

  // Listen for new deposit events
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
          blockNumber: log.blockNumber as number,
        };

        setEvents((prev) => {
          const filtered = prev.filter((e) => e.id !== event.id);
          return [event, ...filtered].slice(0, 20);
        });
      });
    },
  });

  // Listen for new goal completed events
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
          blockNumber: log.blockNumber as number,
        };

        setEvents((prev) => {
          const filtered = prev.filter((e) => e.id !== event.id);
          return [event, ...filtered].slice(0, 20);
        });
      });
    },
  });

  // Listen for new prize distributed events
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
          blockNumber: log.blockNumber as number,
        };

        setEvents((prev) => {
          const filtered = prev.filter((e) => e.id !== event.id);
          return [event, ...filtered].slice(0, 20);
        });
      });
    },
  });

  // Listen for new challenge ended events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    eventName: 'DesafioFinalizado',
    onLogs: (logs: any[]) => {
      logs.forEach((log) => {
        const event: Event = {
          id: `challenge-ended-${log.blockNumber}-${log.logIndex}`,
          type: 'challenge_ended',
          details: 'Challenge has ended!',
          timestamp: Date.now(),
          blockNumber: log.blockNumber as number,
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
      case 'challenge_ended':
        return '🏁';
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
      case 'challenge_ended':
        return 'bg-red-50 border-l-4 border-red-500';
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
          {loading ? (
            <div className="text-center py-8 opacity-50">
              <p>Loading activity...</p>
            </div>
          ) : events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded-lg flex flex-col gap-2 ${getEventColor(
                  event.type
                )}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{getEventIcon(event.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-sm">
                      {event.user && (
                        <span className="font-mono text-xs">
                          {event.user.slice(0, 6)}...{event.user.slice(-4)}
                        </span>
                      )}
                      <span className="opacity-70">{event.details}</span>
                    </div>
                  </div>
                </div>
                {event.message && (
                  <div className="ml-8 text-sm italic opacity-80 bg-white/30 rounded px-2 py-1">
                    💬 &quot;{event.message}&quot;
                  </div>
                )}
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
