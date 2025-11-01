'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
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
  // useRef to store events Map - persists across renders without causing re-render
  const eventsMapRef = useRef<Map<string, Event>>(new Map());

  // Only state needed is a counter to trigger re-renders when events change
  const [eventCount, setEventCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const publicClient = usePublicClient();

  // Centralized event processor - single point of entry for all events
  const addEvents = useCallback((newEvents: Event[]) => {
    let hasChanges = false;

    newEvents.forEach((event) => {
      if (!eventsMapRef.current.has(event.id)) {
        eventsMapRef.current.set(event.id, event);
        hasChanges = true;
      }
    });

    // Only trigger re-render if there were actual new events
    if (hasChanges) {
      setEventCount(eventsMapRef.current.size);
    }
  }, []);

  // Fetch historical events once on mount
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

        // Count by type for debugging
        const countByType = historicalEvents.reduce(
          (acc, e) => {
            acc[e.type] = (acc[e.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        console.log('Historical events fetched:', {
          total: historicalEvents.length,
          byType: countByType,
        });

        // Add all historical events at once
        addEvents(historicalEvents);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch historical events:', error);
        setLoading(false);
      }
    };

    fetchHistoricalEvents();
  }, [publicClient, addEvents]);

  // Listen for new exercise events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    eventName: 'ExerciciosAdicionados',
    onLogs: (logs: any[]) => {
      if (logs.length === 0) return;

      console.log('New exercise event(s):', logs.length);
      const newEvents: Event[] = [];

      logs.forEach((log) => {
        const args = log.args as any;
        const flexoes = Number(args?.flexoes || 0);
        const abdominais = Number(args?.abdominais || 0);
        const km = Number(args?.kmCorrida || 0);

        let detailParts: string[] = [];
        if (flexoes > 0) detailParts.push(`${flexoes} push-ups`);
        if (abdominais > 0) detailParts.push(`${abdominais} sit-ups`);
        if (km > 0) detailParts.push(`${km} km`);

        newEvents.push({
          id: `exercise-${log.blockNumber}-${log.logIndex}`,
          type: 'exercise',
          user: args?.user || '',
          details: `Added ${detailParts.join(', ')}`,
          message: args?.mensagemMotivacional || undefined,
          timestamp: Date.now(),
          blockNumber: log.blockNumber as number,
        });
      });

      addEvents(newEvents);
    },
  });

  // Listen for new deposit events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    eventName: 'DepositoRealizado',
    onLogs: (logs: any[]) => {
      if (logs.length === 0) return;

      const newEvents: Event[] = [];

      logs.forEach((log) => {
        const args = log.args as any;
        const amount = args?.amount ? formatEther(args.amount) : '0';

        newEvents.push({
          id: `deposit-${log.blockNumber}-${log.logIndex}`,
          type: 'deposit',
          user: args?.user || '',
          details: `Deposited ${amount} ETH`,
          timestamp: Date.now(),
          blockNumber: log.blockNumber as number,
        });
      });

      addEvents(newEvents);
    },
  });

  // Listen for new goal completed events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    eventName: 'MetaBatida',
    onLogs: (logs: any[]) => {
      if (logs.length === 0) return;

      const newEvents: Event[] = [];

      logs.forEach((log) => {
        const args = log.args as any;

        newEvents.push({
          id: `goal-${log.blockNumber}-${log.logIndex}`,
          type: 'goal_completed',
          user: args?.user || '',
          details: 'Completed all goals!',
          timestamp: Date.now(),
          blockNumber: log.blockNumber as number,
        });
      });

      addEvents(newEvents);
    },
  });

  // Listen for new prize distributed events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    eventName: 'PremioDitribuido',
    onLogs: (logs: any[]) => {
      if (logs.length === 0) return;

      const newEvents: Event[] = [];

      logs.forEach((log) => {
        const args = log.args as any;
        const amount = args?.amount ? formatEther(args.amount) : '0';

        newEvents.push({
          id: `prize-${log.blockNumber}-${log.logIndex}`,
          type: 'prize_distributed',
          user: args?.user || '',
          details: `Won ${amount} ETH!`,
          timestamp: Date.now(),
          blockNumber: log.blockNumber as number,
        });
      });

      addEvents(newEvents);
    },
  });

  // Listen for new challenge ended events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    eventName: 'DesafioFinalizado',
    onLogs: (logs: any[]) => {
      if (logs.length === 0) return;

      const newEvents: Event[] = [];

      logs.forEach((log) => {
        newEvents.push({
          id: `challenge-ended-${log.blockNumber}-${log.logIndex}`,
          type: 'challenge_ended',
          details: 'Challenge has ended!',
          timestamp: Date.now(),
          blockNumber: log.blockNumber as number,
        });
      });

      addEvents(newEvents);
    },
  });

  // Derive display events from the Map - sort and limit to 20
  const displayEvents = useMemo(() => {
    return Array.from(eventsMapRef.current.values())
      .sort((a, b) => b.blockNumber - a.blockNumber)
      .slice(0, 20);
  }, [eventCount]); // Re-compute when eventCount changes

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
          ) : displayEvents.length > 0 ? (
            displayEvents.map((event) => (
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
