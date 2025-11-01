# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Working Directory & Package Manager

⚠️ **PRIMARY DIRECTORY**: Always work in `/fitness-challenge/` - NOT `/ui/`
⚠️ **PACKAGE MANAGER**: Always use `pnpm` - NOT `npm` or `npm install`

The `/ui/` directory is legacy. The main application is located in `/fitness-challenge/`.

## Project Overview

Web3 fitness challenge app for November. Users deposit 0.005 ETH and complete 3 monthly goals:
- 1000 push-ups
- 1000 sit-ups
- 100 km running

Winners (who completed all 3 goals) share the total prize pool.

### Architecture

**ChallengePool.sol**: Main contract managing:
- Deposits (0.005 ETH fixed)
- Exercise tracking (manual input)
- 4 leaderboards (general + by exercise type)
- Prize distribution at month end

## Common Commands

### Frontend (Fitness Challenge)
```bash
cd fitness-challenge
pnpm install         # Install dependencies
pnpm dev             # Start dev server (http://localhost:3000)
pnpm build           # Build for production
pnpm lint            # Run ESLint
pnpm format          # Format with Prettier
pnpm check-types     # Type check with TypeScript
```

### Legacy Frontend (UI - Do not use)
```bash
# Deprecated - use fitness-challenge instead
# cd ui
# npm install, npm run dev, etc.
```

### Smart Contracts
```bash
cd smartcontracts

# Build contracts
forge build

# Run tests (currently minimal/no test directory)
forge test

# Deploy to local anvil (must be running on port 8545)
./deploy-on-local.sh

# Deploy to testnet
./deploy-on-testnet.sh

# Deploy to mainnet
./deploy-on-mainnet.sh
```

### Local Blockchain
```bash
# Start anvil (mining 1 block per second, exposes RPC at 8545)
anvil -b 1
```

### Complete Development Setup (3 terminals)
```bash
# Terminal 1: Start local blockchain
anvil -b 1

# Terminal 2: Deploy contracts
cd smartcontracts && ./deploy-on-local.sh

# Terminal 3: Start frontend dev server
cd fitness-challenge && pnpm dev
```

## Codebase Structure

### `/smartcontracts`
- **`src/ChallengePool.sol`**: Main contract with deposit, exercise tracking, leaderboards, prize distribution
- **`script/Deploy.s.sol`**: Deploys ChallengePool
- **`foundry.toml`**: Config (chain_id=99 for tests, solc 0.8.20, optimizer enabled)
- **`deploy.py`**: Auto-updates contract address after deployment

### `/fitness-challenge` ⭐ PRIMARY FRONTEND
- **`app/`**: Next.js app directory
  - `page.tsx`: Landing page (stats, leaderboard, events feed)
  - `dashboard/page.tsx`: User dashboard (add exercises, view progress)
- **`components/`**: Reusable React components
  - `TotalStats.tsx`: Displays ETH in stake, total exercises, participants
  - `Leaderboard.tsx`: Unified leaderboard with filters (Overall, Push-ups, Sit-ups, Running)
  - `EventsFeed.tsx`: Recent activity feed with exercise updates, deposits, goals, prizes
  - `AddExercisesForm.tsx`: Form to add exercises
  - `DepositCard.tsx`: Card to deposit 0.005 ETH
  - `Header.tsx`: Navigation header
  - `LeaderboardCard.tsx`: Individual leaderboard display (legacy)
- **`hooks/`**: Custom React hooks
  - `useChallengePool.ts`: Hooks for contract interactions
    - `useTotalExercises()`: Get total stats
    - `useContractBalance()`: Get ETH in stake
    - `useLeaderboards()`: Get all 4 leaderboards
    - `useParticipantData()`: Get user-specific data
    - `useDeposit()`, `useAddExercises()`, `useDistributePrizes()`: Write functions
- **`config/`**: Configuration files
  - `abi.json`: Contract ABI
  - `wagmi.ts`: Wagmi configuration
  - `package.json`: Dependencies with pnpm

### `/ui` (Legacy - Do not use)
- Deprecated Scaffold-ETH-2 setup
- Use `/fitness-challenge/` instead

## Key Integration Points

1. **Deployment**: `deploy.py` auto-updates `ui/contracts/deployedContracts.ts` after deployment
2. **Frontend Stack**: RainbowKit (wallet connection) + wagmi (contract interaction) + viem (RPC calls)
3. **Pages**: Landing (public leaderboards/totals) → Dashboard (authed, can deposit and add exercises)

## Development Notes

### Frontend Architecture
- **Landing Page**: Shows community stats + unified leaderboard + recent activity
- **Dashboard**: User-specific progress tracking + exercise input form
- **Real-time Updates**: Using wagmi hooks with 5-second polling intervals
- **Event Listening**: UseWatchContractEvent for real-time activity feed
- **Language**: All UI text is in English (Portuguese removed)

### Smart Contract Features
- **Storage Optimized**: `_hasCompletedChallenge()` calculates completion on-demand, no bool stored
- **Leaderboards**: 4 separate leaderboards (general, push-ups, sit-ups, running)
- **Challenge Period**: Nov 1-30, adjustable via `setChallengeDates()` for testing
- **Networks**: Sepolia testnet for dev, Arbitrum for production

### Recent Implementations
- **ETH in Stake Display**: Shows total contract balance formatted in ETH
- **Unified Leaderboard**: Single component with 4 filter tabs instead of 4 separate cards
- **Events Feed**: Real-time activity showing exercise additions, deposits, goal completions, prize distributions
- **English Localization**: All component text translated from Portuguese to English
- to memorize