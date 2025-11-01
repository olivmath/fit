import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseEther } from 'viem';
import ABI from '@/config/abi.json';

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CHALLENGE_POOL_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3') as `0x${string}`;

export function useTotalExercises() {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    functionName: 'getTotalExercises',
    query: {
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  const result = data as unknown as [bigint, bigint, bigint, bigint] | undefined;

  return {
    totalFlex: result?.[0] || 0n,
    totalAbd: result?.[1] || 0n,
    totalKm: result?.[2] || 0n,
    participantsCount: result?.[3] || 0n,
    isLoading,
  };
}

export function useChallengeDates() {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    functionName: 'getChallengeDates',
    query: {
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  const result = data as unknown as [bigint, bigint] | undefined;
  const startDate = result?.[0] || 0n;
  const endDate = result?.[1] || 0n;
  const now = BigInt(Math.floor(Date.now() / 1000));
  const hasEnded = now >= endDate;

  return {
    startDate,
    endDate,
    now,
    hasEnded,
    isLoading,
  };
}

export function useContractBalance() {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    functionName: 'getContractBalance',
    query: {
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  const balance = (data as unknown as bigint) || 0n;

  return {
    balance,
    isLoading,
  };
}

export function useLeaderboards() {
  const { data: leaderboardGeral } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    functionName: 'getLeaderboardGeral',
    query: {
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  const { data: leaderboardFlexoes } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    functionName: 'getLeaderboardFlexoes',
    query: {
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  const { data: leaderboardAbdominais } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    functionName: 'getLeaderboardAbdominais',
    query: {
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  const { data: leaderboardKm } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    functionName: 'getLeaderboardKm',
    query: {
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  type LeaderboardResult = [`0x${string}`[], bigint[]] | undefined;

  const geral = leaderboardGeral as unknown as LeaderboardResult;
  const flexoes = leaderboardFlexoes as unknown as LeaderboardResult;
  const abdominais = leaderboardAbdominais as unknown as LeaderboardResult;
  const km = leaderboardKm as unknown as LeaderboardResult;

  return {
    leaderboardGeral: {
      addresses: geral?.[0] || [],
      values: geral?.[1] || [],
    },
    leaderboardFlexoes: {
      addresses: flexoes?.[0] || [],
      values: flexoes?.[1] || [],
    },
    leaderboardAbdominais: {
      addresses: abdominais?.[0] || [],
      values: abdominais?.[1] || [],
    },
    leaderboardKm: {
      addresses: km?.[0] || [],
      values: km?.[1] || [],
    },
  };
}

export function useParticipantData(address?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const userAddress = address || connectedAddress;

  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI as any,
    functionName: 'getParticipantData',
    args: [userAddress || '0x0000000000000000000000000000000000000000'],
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  type ParticipantResult = [bigint, bigint, bigint, boolean, boolean] | undefined;
  const result = data as unknown as ParticipantResult;

  return {
    flexoes: result?.[0] || 0n,
    abdominais: result?.[1] || 0n,
    km: result?.[2] || 0n,
    bateuMeta: result?.[3] || false,
    isParticipating: result?.[4] || false,
    isLoading,
  };
}

export function useDeposit() {
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const deposit = async () => {
    if (!address) return;
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: ABI as any,
      functionName: 'deposit',
      args: [] as const,
      value: parseEther('0.005'),
    } as any);

    setTimeout(() => {
      queryClient.invalidateQueries();
    }, 2000);

    return hash;
  };

  return { deposit };
}

export function useAddExercises() {
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const addExercises = async (flexoes: bigint, abdominais: bigint, km: bigint, mensagem: string = '') => {
    if (!address) return;
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: ABI as any,
      functionName: 'addExercises',
      args: [flexoes, abdominais, km, mensagem],
    } as any);

    setTimeout(() => {
      queryClient.invalidateQueries();
    }, 2000);

    return hash;
  };

  return { addExercises };
}

export function useDistributePrizes() {
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();

  const distributePrizes = async () => {
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: ABI as any,
      functionName: 'distributePrizes',
      args: [] as const,
    } as any);

    setTimeout(() => {
      queryClient.invalidateQueries();
    }, 2000);

    return hash;
  };

  return { distributePrizes };
}
