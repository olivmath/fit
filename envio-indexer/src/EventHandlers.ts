import {
  ChallengePool,
  Participant,
  Exercise,
  Deposit,
  GoalCompletion,
  Withdrawal,
  GlobalStats,
} from "generated";

// Helper to get or create participant
async function getOrCreateParticipant(
  context: any,
  address: string
): Promise<Participant> {
  let participant = await context.Participant.get(address.toLowerCase());

  if (!participant) {
    participant = {
      id: address.toLowerCase(),
      address: address.toLowerCase(),
      totalFlexoes: 0n,
      totalAbdominais: 0n,
      totalKm: 0n,
      totalDeposited: 0n,
      hasCompletedChallenge: false,
      seasonId: 0n,
      hasWithdrawn: false,
      withdrawnAmount: 0n,
      createdAt: BigInt(event?.block?.timestamp || Date.now() / 1000),
      updatedAt: BigInt(event?.block?.timestamp || Date.now() / 1000),
    };
  }

  return participant;
}

// Helper to get or create global stats
async function getOrCreateGlobalStats(context: any): Promise<GlobalStats> {
  let stats = await context.GlobalStats.get("global");

  if (!stats) {
    stats = {
      id: "global",
      totalFlexoes: 0n,
      totalAbdominais: 0n,
      totalKm: 0n,
      totalParticipants: 0n,
      totalDeposits: 0n,
      currentSeasonId: 0n,
      updatedAt: BigInt(Date.now() / 1000),
    };
  }

  return stats;
}

// DepositoRealizado event handler
ChallengePool.DepositoRealizado.handler(async ({ event, context }) => {
  const { user, amount, seasonId } = event.params;

  // Get or create participant
  let participant = await getOrCreateParticipant(context, user);
  participant.totalDeposited = (participant.totalDeposited || 0n) + (amount || 0n);
  participant.seasonId = seasonId || 0n;
  participant.updatedAt = BigInt(event.block.timestamp);
  context.Participant.set(participant);

  // Create deposit record
  const deposit: Deposit = {
    id: `${event.transaction.hash}-${event.logIndex}`,
    participant_id: participant.id,
    amount: amount || 0n,
    seasonId: seasonId || 0n,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  };
  context.Deposit.set(deposit);

  // Update global stats
  let stats = await getOrCreateGlobalStats(context);
  stats.totalDeposits = (stats.totalDeposits || 0n) + (amount || 0n);
  stats.totalParticipants = (stats.totalParticipants || 0n) + 1n;
  stats.currentSeasonId = seasonId || 0n;
  stats.updatedAt = BigInt(event.block.timestamp);
  context.GlobalStats.set(stats);

  context.log.info(`Deposit: ${user} deposited ${amount} ETH for season ${seasonId}`);
});

// ExerciciosAdicionados event handler
ChallengePool.ExerciciosAdicionados.handler(async ({ event, context }) => {
  const { user, flexoes, abdominais, kmCorrida, mensagemMotivacional } = event.params;

  // Get or create participant
  let participant = await getOrCreateParticipant(context, user);
  participant.totalFlexoes = (participant.totalFlexoes || 0n) + (flexoes || 0n);
  participant.totalAbdominais = (participant.totalAbdominais || 0n) + (abdominais || 0n);
  participant.totalKm = (participant.totalKm || 0n) + (kmCorrida || 0n);
  participant.updatedAt = BigInt(event.block.timestamp);
  context.Participant.set(participant);

  // Create exercise record
  const exercise: Exercise = {
    id: `${event.transaction.hash}-${event.logIndex}`,
    participant_id: participant.id,
    flexoes: flexoes || 0n,
    abdominais: abdominais || 0n,
    km: kmCorrida || 0n,
    mensagemMotivacional: mensagemMotivacional || "",
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  };
  context.Exercise.set(exercise);

  // Update global stats
  let stats = await getOrCreateGlobalStats(context);
  stats.totalFlexoes = (stats.totalFlexoes || 0n) + (flexoes || 0n);
  stats.totalAbdominais = (stats.totalAbdominais || 0n) + (abdominais || 0n);
  stats.totalKm = (stats.totalKm || 0n) + (kmCorrida || 0n);
  stats.updatedAt = BigInt(event.block.timestamp);
  context.GlobalStats.set(stats);

  context.log.info(
    `Exercise added: ${user} - ${flexoes} push-ups, ${abdominais} sit-ups, ${kmCorrida} km`
  );
});

// MetaBatida event handler
ChallengePool.MetaBatida.handler(async ({ event, context }) => {
  const { user } = event.params;

  // Update participant
  let participant = await getOrCreateParticipant(context, user);
  participant.hasCompletedChallenge = true;
  participant.updatedAt = BigInt(event.block.timestamp);
  context.Participant.set(participant);

  // Create goal completion record
  const goalCompletion: GoalCompletion = {
    id: `${event.transaction.hash}-${event.logIndex}`,
    participant_id: participant.id,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  };
  context.GoalCompletion.set(goalCompletion);

  context.log.info(`Goal completed: ${user} has completed the challenge!`);
});

// SaqueRealizado event handler
ChallengePool.SaqueRealizado.handler(async ({ event, context }) => {
  const { user, amount, completedChallenge, seasonId } = event.params;

  // Update participant
  let participant = await getOrCreateParticipant(context, user);
  participant.hasWithdrawn = true;
  participant.withdrawnAmount = amount || 0n;
  participant.updatedAt = BigInt(event.block.timestamp);
  context.Participant.set(participant);

  // Create withdrawal record
  const withdrawal: Withdrawal = {
    id: `${event.transaction.hash}-${event.logIndex}`,
    participant_id: participant.id,
    amount: amount || 0n,
    completedChallenge: completedChallenge || false,
    seasonId: seasonId || 0n,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
  };
  context.Withdrawal.set(withdrawal);

  context.log.info(
    `Withdrawal: ${user} withdrew ${amount} ETH (completed: ${completedChallenge})`
  );
});

// NovaTemporadaIniciada event handler
ChallengePool.NovaTemporadaIniciada.handler(async ({ event, context }) => {
  const { seasonId, startBlock, endBlock } = event.params;

  // Update global stats for new season
  let stats = await getOrCreateGlobalStats(context);
  stats.currentSeasonId = seasonId || 0n;
  stats.totalFlexoes = 0n;
  stats.totalAbdominais = 0n;
  stats.totalKm = 0n;
  stats.totalParticipants = 0n;
  stats.totalDeposits = 0n;
  stats.updatedAt = BigInt(event.block.timestamp);
  context.GlobalStats.set(stats);

  context.log.info(`New season started: ${seasonId} (blocks ${startBlock}-${endBlock})`);
});
