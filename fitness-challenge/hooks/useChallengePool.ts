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

  return {
    totalFlex: (data?.[0] as bigint) || 0n,
    totalAbd: (data?.[1] as bigint) || 0n,
    totalKm: (data?.[2] as bigint) || 0n,
    participantsCount: (data?.[3] as bigint) || 0n,
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

  const startDate = (data?.[0] as bigint) || 0n;
  const endDate = (data?.[1] as bigint) || 0n;
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

  return {
    leaderboardGeral: {
      addresses: (leaderboardGeral?.[0] as `0x${string}`[]) || [],
      values: (leaderboardGeral?.[1] as bigint[]) || [],
    },
    leaderboardFlexoes: {
      addresses: (leaderboardFlexoes?.[0] as `0x${string}`[]) || [],
      values: (leaderboardFlexoes?.[1] as bigint[]) || [],
    },
    leaderboardAbdominais: {
      addresses: (leaderboardAbdominais?.[0] as `0x${string}`[]) || [],
      values: (leaderboardAbdominais?.[1] as bigint[]) || [],
    },
    leaderboardKm: {
      addresses: (leaderboardKm?.[0] as `0x${string}`[]) || [],
      values: (leaderboardKm?.[1] as bigint[]) || [],
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

  return {
    flexoes: (data?.[0] as bigint) || 0n,
    abdominais: (data?.[1] as bigint) || 0n,
    km: (data?.[2] as bigint) || 0n,
    bateuMeta: (data?.[3] as boolean) || false,
    isParticipating: (data?.[4] as boolean) || false,
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
      value: parseEther('0.005'),
    });

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

  const addExercises = async (flexoes: bigint, abdominais: bigint, km: bigint) => {
    if (!address) return;
    const hash = await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: ABI as any,
      functionName: 'addExercises',
      args: [flexoes, abdominais, km],
    });

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
    });

    setTimeout(() => {
      queryClient.invalidateQueries();
    }, 2000);

    return hash;
  };

  return { distributePrizes };
}
