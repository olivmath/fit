'use client';

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

// Query for recent exercises
export const GET_RECENT_EXERCISES = gql`
  query GetRecentExercises($limit: Int = 20) {
    Exercise(limit: $limit, order_by: { blockTimestamp: desc }) {
      id
      participant {
        address
      }
      flexoes
      abdominais
      km
      mensagemMotivacional
      blockTimestamp
      transactionHash
    }
  }
`;

// Query for leaderboard overall
export const GET_LEADERBOARD_OVERALL = gql`
  query GetLeaderboardOverall($limit: Int = 10) {
    Participant(limit: $limit, order_by: { totalFlexoes: desc }) {
      address
      totalFlexoes
      totalAbdominais
      totalKm
      hasCompletedChallenge
    }
  }
`;

// Query for leaderboard push-ups
export const GET_LEADERBOARD_PUSHUPS = gql`
  query GetLeaderboardPushups($limit: Int = 10) {
    Participant(limit: $limit, order_by: { totalFlexoes: desc }) {
      address
      totalFlexoes
      hasCompletedChallenge
    }
  }
`;

// Query for leaderboard sit-ups
export const GET_LEADERBOARD_SITUPS = gql`
  query GetLeaderboardSitups($limit: Int = 10) {
    Participant(limit: $limit, order_by: { totalAbdominais: desc }) {
      address
      totalAbdominais
      hasCompletedChallenge
    }
  }
`;

// Query for leaderboard running
export const GET_LEADERBOARD_RUNNING = gql`
  query GetLeaderboardRunning($limit: Int = 10) {
    Participant(limit: $limit, order_by: { totalKm: desc }) {
      address
      totalKm
      hasCompletedChallenge
    }
  }
`;

// Query for global stats
export const GET_GLOBAL_STATS = gql`
  query GetGlobalStats {
    GlobalStats(where: { id: { _eq: "global" } }) {
      id
      totalFlexoes
      totalAbdominais
      totalKm
      totalParticipants
      totalDeposits
      currentSeasonId
      updatedAt
    }
  }
`;

// Query for user data
export const GET_USER_DATA = gql`
  query GetUserData($address: String!) {
    Participant(where: { address: { _eq: $address } }) {
      id
      address
      totalFlexoes
      totalAbdominais
      totalKm
      totalDeposited
      hasCompletedChallenge
      hasWithdrawn
      withdrawnAmount
      exercises(order_by: { blockTimestamp: desc }, limit: 20) {
        id
        flexoes
        abdominais
        km
        mensagemMotivacional
        blockTimestamp
        transactionHash
      }
      deposits(order_by: { blockTimestamp: desc }) {
        amount
        seasonId
        blockTimestamp
        transactionHash
      }
    }
  }
`;

// Hook for recent exercises
export function useRecentExercises(limit: number = 20) {
  return useQuery(GET_RECENT_EXERCISES, {
    variables: { limit },
    pollInterval: 5000, // Poll every 5 seconds
  });
}

// Hook for leaderboard
type LeaderboardType = 'overall' | 'pushups' | 'situps' | 'running';

export function useLeaderboard(type: LeaderboardType = 'overall', limit: number = 10) {
  let query = GET_LEADERBOARD_OVERALL;

  switch (type) {
    case 'pushups':
      query = GET_LEADERBOARD_PUSHUPS;
      break;
    case 'situps':
      query = GET_LEADERBOARD_SITUPS;
      break;
    case 'running':
      query = GET_LEADERBOARD_RUNNING;
      break;
    case 'overall':
    default:
      query = GET_LEADERBOARD_OVERALL;
  }

  return useQuery(query, {
    variables: { limit },
    pollInterval: 10000, // Poll every 10 seconds
  });
}

// Hook for global stats
export function useGlobalStats() {
  return useQuery(GET_GLOBAL_STATS, {
    pollInterval: 5000, // Poll every 5 seconds
  });
}

// Hook for user data
export function useUserData(address: string | undefined) {
  return useQuery(GET_USER_DATA, {
    variables: { address: address?.toLowerCase() },
    skip: !address, // Don't run query if no address
    pollInterval: 5000, // Poll every 5 seconds
  });
}
