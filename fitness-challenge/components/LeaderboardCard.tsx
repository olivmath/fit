type Props = {
  title: string;
  addresses: `0x${string}`[];
  values: bigint[];
};

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function LeaderboardCard({ title, addresses, values }: Props) {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Position</th>
                <th>Address</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {addresses.map((addr, idx) => (
                <tr key={addr} className="hover">
                  <td className="font-bold">#{idx + 1}</td>
                  <td className="font-mono text-xs">{shortenAddress(addr)}</td>
                  <td className="text-right">{values[idx]?.toString() || '0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {addresses.length === 0 && (
          <div className="text-center text-base-content/50 py-8">
            No participants yet
          </div>
        )}
      </div>
    </div>
  );
}
