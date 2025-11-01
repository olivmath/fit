import { formatEther } from 'viem';

type Props = {
  totalFlex: bigint;
  totalAbd: bigint;
  totalKm: bigint;
  participantsCount: bigint;
  contractBalance: bigint;
  seasonId?: bigint;
  isSeasonActive?: boolean;
};

export function TotalStats({
  totalFlex,
  totalAbd,
  totalKm,
  participantsCount,
  contractBalance,
  seasonId,
  isSeasonActive,
}: Props) {
  const ethInStake = parseFloat(formatEther(contractBalance)).toFixed(3);

  return (
    <div className="card bg-base-100 shadow-xl h-full">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <h2 className="card-title">Community Stats</h2>
          {seasonId && (
            <div className="badge badge-lg badge-primary">
              Season {seasonId.toString()}
            </div>
          )}
          {isSeasonActive !== undefined && (
            <div className={`badge badge-lg ${isSeasonActive ? 'badge-success' : 'badge-warning'}`}>
              {isSeasonActive ? 'Active' : 'Ended'}
            </div>
          )}
        </div>
        <div className="divider"></div>
        <div className="stats stats-vertical w-full flex-1">
          <div className="stat">
            <div className="stat-figure text-success">
              <span className="text-3xl">💰</span>
            </div>
            <div className="stat-title">ETH in Stake</div>
            <div className="stat-value text-success">{ethInStake}</div>
          </div>
          <div className="stat">
            <div className="stat-figure text-primary">
              <span className="text-3xl">💪</span>
            </div>
            <div className="stat-title">Total Push-ups</div>
            <div className="stat-value text-primary">{totalFlex.toString()}</div>
          </div>
          <div className="stat">
            <div className="stat-figure text-secondary">
              <span className="text-3xl">🔥</span>
            </div>
            <div className="stat-title">Total Sit-ups</div>
            <div className="stat-value text-secondary">{totalAbd.toString()}</div>
          </div>
          <div className="stat">
            <div className="stat-figure text-accent">
              <span className="text-3xl">🏃</span>
            </div>
            <div className="stat-title">Total Running (km)</div>
            <div className="stat-value text-accent">{totalKm.toString()}</div>
          </div>
          <div className="stat">
            <div className="stat-figure text-info">
              <span className="text-3xl">👥</span>
            </div>
            <div className="stat-title">Participants</div>
            <div className="stat-value text-info">{participantsCount.toString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
