import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';
import ABI from '@/config/abi.json';

const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CHALLENGE_POOL_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3') as `0x${string}`;

/**
 * Helper function to format error messages from transaction failures
 */
const formatErrorMessage = (error: any): string => {
  if (!error) return 'Unknown error occurred';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.reason) return error.reason;
  return 'Transaction failed. Please try again.';
};

/**
 * Hook para obter informações da temporada atual
 * Retorna: seasonId, startBlock, endBlock, blocksRemaining, isActive
 */
export function useCurrentSeasonInfo() {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI.abi as any,
    functionName: 'getCurrentSeasonInfo',
    query: {
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  type SeasonInfoResult = [bigint, bigint, bigint, bigint, boolean] | undefined;
  const result = data as unknown as SeasonInfoResult;

  return {
    seasonId: result?.[0] || 0n,
    startBlock: result?.[1] || 0n,
    endBlock: result?.[2] || 0n,
    blocksRemaining: result?.[3] || 0n,
    isActive: result?.[4] || false,
    isLoading,
  };
}

/**
 * Hook para obter totais de exercícios da temporada atual
 */
export function useTotalExercises() {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI.abi as any,
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

/**
 * Hook para obter dados de temporada atual
 * Retorna: seasonId, startBlock, endBlock
 */
export function useSeasonInfo() {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI.abi as any,
    functionName: 'getSeasonInfo',
    query: {
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  type SeasonResult = [bigint, bigint, bigint] | undefined;
  const result = data as unknown as SeasonResult;

  return {
    seasonId: result?.[0] || 0n,
    startBlock: result?.[1] || 0n,
    endBlock: result?.[2] || 0n,
    isLoading,
  };
}

export function useContractBalance() {
  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI.abi as any,
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
    abi: ABI.abi as any,
    functionName: 'getLeaderboardGeral',
    query: {
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  const { data: leaderboardFlexoes } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI.abi as any,
    functionName: 'getLeaderboardFlexoes',
    query: {
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  const { data: leaderboardAbdominais } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI.abi as any,
    functionName: 'getLeaderboardAbdominais',
    query: {
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  const { data: leaderboardKm } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI.abi as any,
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

/**
 * Hook para obter dados do participante na temporada atual
 * Retorna: flexoes, abdominais, km, bateuMeta, isParticipating, seasonId, hasWithdrawn
 */
export function useParticipantData(address?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const userAddress = address || connectedAddress;

  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI.abi as any,
    functionName: 'getParticipantData',
    args: [userAddress || '0x0000000000000000000000000000000000000000'],
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  type ParticipantResult = [bigint, bigint, bigint, boolean, boolean, bigint, boolean] | undefined;
  const result = data as unknown as ParticipantResult;

  return {
    flexoes: result?.[0] || 0n,
    abdominais: result?.[1] || 0n,
    km: result?.[2] || 0n,
    bateuMeta: result?.[3] || false,
    isParticipating: result?.[4] || false,
    seasonId: result?.[5] || 0n,
    hasWithdrawn: result?.[6] || false,
    isLoading,
  };
}

/**
 * Hook para verificar se pode sacar
 * Retorna: canWithdraw (bool), reason (string)
 */
export function useCanWithdraw(address?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const userAddress = address || connectedAddress;

  const { data, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI.abi as any,
    functionName: 'canWithdraw',
    args: [userAddress || '0x0000000000000000000000000000000000000000'],
    query: {
      enabled: !!userAddress,
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  type CanWithdrawResult = [boolean, string] | undefined;
  const result = data as unknown as CanWithdrawResult;

  return {
    canWithdraw: result?.[0] || false,
    reason: result?.[1] || '',
    isLoading,
  };
}

/**
 * Hook para depositar 0.005 ETH
 */
export function useDeposit() {
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const deposit = async () => {
    if (!address) {
      toast.error('❌ Wallet not connected');
      return;
    }

    let toastId = '';

    try {
      toastId = toast.loading('💰 Initiating deposit transaction...');

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI.abi as any,
        functionName: 'deposit',
        args: [] as const,
        value: parseEther('0.005'),
      } as any);

      toast.loading('⏳ Waiting for confirmation...', { id: toastId });

      // Wait a bit for transaction to be included in a block
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast.success('✅ Deposit successful! Welcome to the challenge!', {
        id: toastId,
        duration: 5000,
      });

      // Invalidate queries to refresh UI
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [],
        });
      }, 2000);

      return hash;
    } catch (error: any) {
      const errorMessage = formatErrorMessage(error);
      toast.error(`❌ Deposit failed: ${errorMessage}`, {
        id: toastId,
        duration: 5000,
      });
      console.error('Deposit error:', error);
      throw error;
    }
  };

  return { deposit };
}

/**
 * Hook para adicionar exercícios
 */
export function useAddExercises() {
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const addExercises = async (flexoes: bigint, abdominais: bigint, km: bigint, mensagem: string = '') => {
    if (!address) {
      toast.error('❌ Wallet not connected. Please connect your wallet first.');
      throw new Error('Wallet not connected.');
    }

    let toastId = '';

    try {
      toastId = toast.loading('🏋️ Submitting your exercises...');

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI.abi as any,
        functionName: 'addExercises',
        args: [flexoes, abdominais, km, mensagem],
      } as any);

      toast.loading('⏳ Confirming transaction...', { id: toastId });

      // Wait for transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast.success('🎉 Exercises logged successfully!', {
        id: toastId,
        duration: 5000,
      });

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [],
        });
      }, 2000);

      return hash;
    } catch (error: any) {
      const errorMessage = formatErrorMessage(error);
      toast.error(`❌ Failed to log exercises: ${errorMessage}`, {
        id: toastId,
        duration: 5000,
      });
      console.error('addExercises error:', error);
      throw error;
    }
  };

  return { addExercises };
}

/**
 * Hook para sacar o depósito
 * - Se completou meta: saca imediatamente
 * - Se não completou: saca após temporada terminar
 */
export function useWithdraw() {
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const withdraw = async () => {
    if (!address) {
      toast.error('❌ Wallet not connected. Please connect your wallet first.');
      throw new Error('Wallet not connected.');
    }

    let toastId = '';

    try {
      toastId = toast.loading('💸 Processing withdrawal...');

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI.abi as any,
        functionName: 'withdraw',
        args: [] as const,
      } as any);

      toast.loading('⏳ Confirming transaction...', { id: toastId });

      // Wait for transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast.success('💰 Withdrawal successful! Check your wallet.', {
        id: toastId,
        duration: 5000,
      });

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [],
        });
      }, 2000);

      return hash;
    } catch (error: any) {
      const errorMessage = formatErrorMessage(error);
      toast.error(`❌ Withdrawal failed: ${errorMessage}`, {
        id: toastId,
        duration: 5000,
      });
      console.error('withdraw error:', error);
      throw error;
    }
  };

  return { withdraw };
}

/**
 * Hook para iniciar nova temporada (apenas owner)
 */
export function useStartNewSeason() {
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();

  const startNewSeason = async () => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI.abi as any,
        functionName: 'startNewSeason',
        args: [] as const,
      } as any);

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [],
        });
      }, 2000);

      return hash;
    } catch (error: any) {
      console.error('startNewSeason error:', error);
      throw error;
    }
  };

  return { startNewSeason };
}

/**
 * Hook para transferir propriedade (apenas owner)
 */
export function useTransferOwnership() {
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();

  const transferOwnership = async (newOwner: `0x${string}`) => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI.abi as any,
        functionName: 'transferOwnership',
        args: [newOwner],
      } as any);

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [],
        });
      }, 2000);

      return hash;
    } catch (error: any) {
      console.error('transferOwnership error:', error);
      throw error;
    }
  };

  return { transferOwnership };
}

/**
 * Hook para saque de emergência (apenas owner)
 */
export function useEmergencyWithdraw() {
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();

  const emergencyWithdraw = async () => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: ABI.abi as any,
        functionName: 'emergencyWithdraw',
        args: [] as const,
      } as any);

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: [],
        });
      }, 2000);

      return hash;
    } catch (error: any) {
      console.error('emergencyWithdraw error:', error);
      throw error;
    }
  };

  return { emergencyWithdraw };
}

/**
 * Hook para obter datas da temporada (endDate e now)
 * Usado para calcular tempo restante
 */
export function useChallengeDates() {
  const { data: seasonInfo, isLoading: seasonLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI.abi as any,
    functionName: 'getSeasonInfo',
    query: {
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  const { data: blockTimestamp, isLoading: blockLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI.abi as any,
    functionName: 'block',
    query: {
      refetchInterval: 5000,
      staleTime: 0,
    },
  });

  type SeasonResult = [bigint, bigint, bigint] | undefined;
  const result = seasonInfo as unknown as SeasonResult;

  // For now, calculate endDate based on season end block
  // We'll use a simplified approach: assume 1 block per second
  const endDate = result?.[2] || 0n; // endBlock as timestamp approximation
  const now = Math.floor(Date.now() / 1000); // Current unix timestamp

  return {
    endDate: Number(endDate),
    now,
    isLoading: seasonLoading || blockLoading,
  };
}
