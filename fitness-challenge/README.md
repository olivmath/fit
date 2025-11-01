# Fitness Challenge Frontend

## Setup

```bash
npm install
cp .env.example .env.local
# Update .env.local with your contract address
npm run dev
```

## Environment Variables

- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - WalletConnect project ID (get from https://cloud.walletconnect.com)
- `NEXT_PUBLIC_CHALLENGE_POOL_ADDRESS` - Deployed ChallengePool contract address on Sepolia

## Pages

- `/` - Landing page (public leaderboards and total stats)
- `/dashboard` - Authed dashboard (add exercises, track progress)
