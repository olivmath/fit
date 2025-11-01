type Props = {
  totalFlex: bigint;
  totalAbd: bigint;
  totalKm: bigint;
  participantsCount: bigint;
};

export function TotalStats({ totalFlex, totalAbd, totalKm, participantsCount }: Props) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Community Stats</h2>
        <div className="divider"></div>
        <div className="stats stats-vertical w-full">
          <div className="stat">
            <div className="stat-figure text-primary">
              <span className="text-3xl">💪</span>
            </div>
            <div className="stat-title">Total Flexões</div>
            <div className="stat-value text-primary">{totalFlex.toString()}</div>
          </div>
          <div className="stat">
            <div className="stat-figure text-secondary">
              <span className="text-3xl">🔥</span>
            </div>
            <div className="stat-title">Total Abdominais</div>
            <div className="stat-value text-secondary">{totalAbd.toString()}</div>
          </div>
          <div className="stat">
            <div className="stat-figure text-accent">
              <span className="text-3xl">🏃</span>
            </div>
            <div className="stat-title">Total Corrida (km)</div>
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
