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

# Deploy to Arbitrum Sepolia testnet
./deploy-on-testnet.sh

# Deploy to Arbitrum One mainnet
./deploy-on-mainnet.sh
```

### ENVIO Indexer
```bash
cd envio-indexer

# Install dependencies
pnpm install

# Generate types from GraphQL schema
pnpm codegen

# Start indexer locally (connects to chain)
pnpm dev

# Build for production
pnpm build

# View GraphQL playground
# Opens at http://localhost:8080 when running locally
```

### Local Blockchain (for development)
```bash
# Start anvil (mining 1 block per second, exposes RPC at 8545)
anvil -b 1
```

### Complete Development Setup (for local testing)
```bash
# Terminal 1: Start local blockchain
anvil -b 1

# Terminal 2: Deploy contracts locally
cd smartcontracts && ./deploy-on-local.sh

# Terminal 3: Start ENVIO indexer (after deploying contract)
cd envio-indexer && pnpm dev

# Terminal 4: Start frontend dev server
cd fitness-challenge && pnpm dev
```

### Production Deployment Setup
```bash
# Step 1: Get testnet ETH for Arbitrum Sepolia
# Use faucet: https://faucet.quicknode.com/arbitrum/sepolia

# Step 2: Deploy contracts to testnet
cd smartcontracts && ./deploy-on-testnet.sh
# Note: Save the contract address and deployment block

# Step 3: Update config and deploy ENVIO indexer
cd envio-indexer
# Edit config.yaml with contract address and block
pnpm build
# Push to GitHub and deploy to https://envio.dev

# Step 4: Deploy frontend to Vercel
cd fitness-challenge
# Connect GitHub repo to Vercel
# Add environment variables
# Auto-deploys on git push

# Verify everything:
# - Check Arbiscan: https://sepolia.arbiscan.io/address/{CONTRACT}
# - Check ENVIO: https://envio.dev (monitor sync progress)
# - Check Vercel: https://fitness-challenge-xyz.vercel.app
```

## Codebase Structure

### `/smartcontracts`
- **`src/ChallengePool.sol`**: Main contract with deposit, exercise tracking, leaderboards, prize distribution
- **`script/Deploy.s.sol`**: Deploys ChallengePool
- **`foundry.toml`**: Config (chain_id=99 for tests, solc 0.8.20, optimizer enabled)
- **`deploy.py`**: Auto-updates contract address after deployment

### `/fitness-challenge` ⭐ PRIMARY FRONTEND
- **`app/`**: Next.js app directory
  - `page.tsx`: Landing page (stats from ENVIO, leaderboard, events feed)
  - `dashboard/page.tsx`: User dashboard (add exercises, view progress, withdrawal)
  - `layout.tsx`: Root layout with providers (Wagmi, RainbowKit, Apollo Client)
- **`components/`**: Reusable React components
  - `TotalStats.tsx`: Displays ETH/stats from ENVIO indexer (GlobalStats query)
  - `Leaderboard.tsx`: Unified leaderboard with 4 filter tabs (Participant queries from ENVIO)
  - `EventsFeed.tsx`: Recent activity feed (Exercise queries from ENVIO)
  - `AddExercisesForm.tsx`: Multi-step form to log exercises
  - `DepositCard.tsx`: Card to deposit 0.005 ETH
  - `Header.tsx`: Navigation header with wallet connection
  - `WithdrawButton.tsx`: Claim prize if goals completed
- **`hooks/`**: Custom React hooks
  - `useChallengePool.ts`: Wagmi hooks for contract writes
    - `useDeposit()`: Write ETH deposit (with toasts)
    - `useAddExercises()`: Write exercises (with toasts)
    - `useWithdraw()`: Claim prizes (with toasts)
    - `useChallengeDates()`: Read challenge dates
  - `useEnvioQueries.ts`: Apollo Client GraphQL queries
    - `useRecentExercises()`: Get latest exercises
    - `useLeaderboard(type)`: Get leaderboard by type
    - `useGlobalStats()`: Get aggregated stats
    - `useUserData(address)`: Get user-specific data
- **`config/`**: Configuration files
  - `abi.json`: Contract ABI
  - `wagmi.ts`: Wagmi configuration
  - `apollo-client.ts`: Apollo Client setup with ENVIO endpoint
  - `package.json`: Dependencies (includes @apollo/client, graphql)

### `/envio-indexer` ⭐ BLOCKCHAIN INDEXING
- **`config.yaml`**: Contract and network configuration
  - Defines ChallengePool contract address and ABI
  - Specifies Arbitrum Sepolia (testnet) and Arbitrum One (mainnet)
  - Lists all events to index
- **`schema.graphql`**: Data model and GraphQL types
  - `Participant`: User data and exercise totals
  - `Exercise`: Individual exercise logs
  - `Deposit`: ETH deposits
  - `GoalCompletion`: When user completes all 3 goals
  - `Withdrawal`: Prize withdrawals
  - `GlobalStats`: Aggregated community statistics
- **`src/EventHandlers.ts`**: Event processing logic
  - Processes incoming blockchain events
  - Updates database entities
  - Calculates and stores aggregated data
  - Auto-generated from schema
- **`abis/ChallengePool.json`**: Contract ABI
- **`package.json`**: ENVIO CLI tools and dependencies

### `/ui` (Legacy - Do not use)
- Deprecated Scaffold-ETH-2 setup
- Use `/fitness-challenge/` instead

## Key Integration Points

1. **Smart Contract**: ChallengePool deployed on Arbitrum Sepolia, emits events for all actions
2. **ENVIO Indexer**: Listens to events, processes with EventHandlers, stores in PostgreSQL, exposes via GraphQL
3. **Apollo Client**: Frontend queries ENVIO GraphQL API with real-time polling (5-10 second intervals)
4. **Frontend Stack**:
   - **Wallet**: RainbowKit + wagmi (connect wallet, sign transactions)
   - **Contract Writes**: wagmi hooks for deposit/exercises/withdraw (with toasts)
   - **Data Queries**: Apollo Client + GraphQL for indexed blockchain data
   - **UI**: Next.js 14, Tailwind CSS, DaisyUI, React Hot Toast
5. **Pages**:
   - Landing: Public stats + leaderboards + recent activity (all from ENVIO)
   - Dashboard: User progress + exercise form + withdrawal (user-specific ENVIO data)
6. **Deployment Pipeline**:
   - Contract → Arbitrum Sepolia → ENVIO Indexer → GraphQL API → Apollo Client → Vercel Frontend

## Development Notes

### Frontend Architecture
- **Landing Page**: Shows community stats + unified leaderboard + recent activity (all from ENVIO)
- **Dashboard**: User-specific progress tracking + exercise input form + withdrawal
- **Real-time Updates**: Apollo Client polling ENVIO GraphQL API every 5-10 seconds
- **Data Fetching**: useEnvioQueries hooks replace old wagmi data hooks
- **User Feedback**: Toast notifications for all critical actions (deposit, exercises, withdraw)
- **Responsive Design**: Mobile-first approach, fully responsive (mobile/tablet/desktop)
- **Language**: All UI text is in English

### Smart Contract Features
- **Fixed Deposit**: 0.005 ETH to join the challenge
- **Storage Optimized**: `_hasCompletedChallenge()` calculates completion on-demand, no bool stored
- **Leaderboards**: 4 separate leaderboards (general, push-ups, sit-ups, running)
- **Challenge Period**: Configurable dates (Nov 1-30 for monthly challenges), adjustable via `setChallengeDates()`
- **Networks**: Arbitrum Sepolia for testnet, Arbitrum One for mainnet
- **Events**: Emits events for all state changes (deposits, exercises, goals, withdrawals)

### Architecture Improvements
- **ENVIO Indexer**: Ultra-fast blockchain indexing with GraphQL (1000x faster than RPC polling)
- **Apollo Client**: Type-safe GraphQL queries with caching and real-time polling
- **Toast Notifications**: Multi-stage feedback for all critical transactions
- **Responsive Design**: Fully mobile-responsive (tested on mobile/tablet/desktop)
- **Event-driven**: All UI updates driven by blockchain events indexed in real-time
- **No Legacy Code**: Removed all old wagmi event listening code

## ENVIO Indexer System

### What is ENVIO?
ENVIO (HyperIndex) is a production-grade blockchain indexing solution that tracks ChallengePool contract events and makes them queryable via GraphQL. Instead of polling contract data, we get:
- **Ultra-fast indexing**: Processes events in seconds
- **GraphQL API**: Type-safe queries for all indexed data
- **Real-time updates**: Auto-synced to latest blockchain state
- **Production ready**: Hosted on ENVIO's managed infrastructure

### How It Works
1. **Contract Events**: ChallengePool emits events (Deposits, Exercises, Goals, etc.)
2. **ENVIO Indexer**: Listens to events and processes them with EventHandlers
3. **PostgreSQL Database**: Stores indexed data in structured tables
4. **GraphQL API**: Exposes data via Hasura GraphQL endpoint
5. **Apollo Client**: Frontend queries GraphQL for real-time data

### Indexed Events
- `DepositoRealizado`: User deposits 0.005 ETH
- `ExerciciosAdicionados`: User logs exercises (flexões, abdominais, km)
- `MetaBatida`: User completes all 3 goals
- `SaqueRealizado`: User withdraws winnings
- `NovaTemporadaIniciada`: New season starts

### Data Entities
- **Participant**: User address, exercise totals, completion status
- **Exercise**: Individual exercise logs with timestamps
- **Deposit**: Deposit records with amounts
- **GlobalStats**: Aggregated stats (total ETH, exercises, participants)
- **GoalCompletion**: Records when users complete the challenge

## Toast Notification System

### Implementation Details
Toast notifications provide real-time feedback for critical actions:

**Deposit Flow**:
1. "💰 Initiating deposit..." - User initiated transaction
2. "⏳ Waiting for confirmation..." - Transaction in mempool
3. "✅ Deposit successful!" - Transaction confirmed
4. "❌ Deposit failed: [error]" - Transaction failed

**Add Exercises Flow**:
1. "🏋️ Submitting your exercises..." - Starting
2. "⏳ Confirming transaction..." - In mempool
3. "🎉 Exercises logged successfully!" - Confirmed
4. "❌ Failed to log exercises" - Error

**Withdrawal Flow**:
1. "💸 Processing withdrawal..." - Starting
2. "💰 Withdrawal successful!" - Confirmed
3. "❌ Withdrawal failed" - Error

### Toast Library
Using `react-hot-toast` for elegant, auto-dismissing notifications with:
- Custom icons/emojis
- Auto-dismiss after 3-5 seconds
- Loading states with spinners
- Error messages with details

## Deployment Guide

### Prerequisites
- Node.js 22+ and pnpm 8+
- GitHub account
- Vercel account (for frontend)
- ENVIO account (for indexing)
- ETH on Arbitrum Sepolia testnet (get from [faucet](https://faucet.quicknode.com/arbitrum/sepolia))

### Step 1: Get Testnet ETH
```bash
# Get Arbitrum Sepolia ETH from faucet
https://faucet.quicknode.com/arbitrum/sepolia
# Or use Alchemy faucet: https://www.alchemy.com/faucets/arbitrum-sepolia

# Save your wallet address from MetaMask/Rainbow
# Switch network to Arbitrum Sepolia in wallet
```

### Step 2: Deploy Smart Contracts
```bash
cd smartcontracts

# Set environment variables
export PRIVATE_KEY=your_private_key_here
export ARBISCAN_API_KEY=your_api_key  # Optional for verification

# Deploy to Arbitrum Sepolia
./deploy-on-testnet.sh

# ⚠️ SAVE THIS INFO:
# - Contract Address: 0x...
# - Deployment Block: 12345
# - Transaction Hash: 0x...
```

### Step 3: Setup ENVIO Indexer
```bash
cd envio-indexer

# 1. Update config.yaml with contract details
# Edit: config.yaml
#   - Update contract address: "0x..."
#   - Update start_block: <deployment_block>

# 2. Copy ABI
cp ../fitness-challenge/config/abi.json ./abis/ChallengePool.json

# 3. Test locally
pnpm install
pnpm codegen
pnpm dev
# Visit http://localhost:8080 to test GraphQL

# 4. Push to GitHub
git add .
git commit -m "feat: add ENVIO indexer for ChallengePool"
git push origin main
```

### Step 4: Deploy ENVIO
```bash
# 1. Go to https://envio.dev
# 2. Login with GitHub
# 3. Click "Add Indexer"
# 4. Select your repository
# 5. Configure:
#    - Root directory: /envio-indexer
#    - Config file: config.yaml
#    - Branch: main
# 6. Start deployment
# 7. Wait for sync (5-15 minutes)

# ⚠️ SAVE GRAPHQL ENDPOINT URL:
# https://indexer.bigdevenergy.link/YOUR_ID/v1/graphql
```

### Step 5: Deploy Frontend to Vercel
```bash
cd fitness-challenge

# 1. Push code to GitHub
git add .
git commit -m "feat: integrate ENVIO and toasts"
git push origin main

# 2. Go to https://vercel.com
# 3. Import Git Repository
# 4. Select your repo
# 5. Configure:
#    - Framework: Next.js
#    - Root Directory: /fitness-challenge
#    - Build: pnpm build
# 6. Add Environment Variables:
#    NEXT_PUBLIC_CHALLENGE_POOL_ADDRESS=0x...
#    NEXT_PUBLIC_ENVIO_GRAPHQL_URL=https://indexer.bigdevenergy.link/.../v1/graphql
#    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
# 7. Deploy!

# ⚠️ SAVE PRODUCTION URL:
# https://fitness-challenge-xyz.vercel.app
```

### Step 6: Verify Deployment
```bash
# 1. Check contract on Arbiscan
https://sepolia.arbiscan.io/address/YOUR_CONTRACT_ADDRESS

# 2. Check ENVIO indexer status
https://envio.dev (monitor sync)

# 3. Test frontend
https://fitness-challenge-xyz.vercel.app
# - Connect wallet (Arbitrum Sepolia)
# - Make a deposit
# - Check EventsFeed updates

# 4. Verify data flow
# - Add exercise → appears in feed in <10 seconds
# - Leaderboard updates in real-time
# - Stats update from ENVIO
```

### Upgrading to Mainnet (Later)
```bash
# When ready to go live on Arbitrum One:

# 1. Deploy contract to mainnet
cd smartcontracts
./deploy-on-mainnet.sh
# Save new contract address

# 2. Create ENVIO production indexer
# Duplicate indexer config for Arbitrum One
# Update network ID: 42161

# 3. Update frontend env vars
# NEXT_PUBLIC_CHALLENGE_POOL_ADDRESS=mainnet_address
# NEXT_PUBLIC_ENVIO_GRAPHQL_URL=mainnet_graphql_url

# 4. Redeploy to Vercel (auto-deploys on git push)
```

## Production URLs

### Arbitrum Sepolia (Testnet) - Current Deployment
```
Status: UNDER DEVELOPMENT

Smart Contract:
https://sepolia.arbiscan.io/address/[TO_BE_FILLED]

ENVIO Indexer Dashboard:
https://envio.dev/app/[TO_BE_FILLED]

GraphQL API Endpoint:
https://indexer.bigdevenergy.link/[ID]/v1/graphql

Frontend (Vercel):
https://[TO_BE_FILLED].vercel.app

Deployment Block: [TO_BE_FILLED]
Deployment Date: [TO_BE_FILLED]
```

### Arbitrum One (Mainnet) - Future Production
```
Status: NOT YET DEPLOYED

Will be updated after successful testnet validation
```

### Environment Variables Required

**For Local Development** (`fitness-challenge/.env.local`):
```bash
NEXT_PUBLIC_CHALLENGE_POOL_ADDRESS=0x...
NEXT_PUBLIC_ENVIO_GRAPHQL_URL=http://localhost:8080/v1/graphql  # or ENVIO URL
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id
```

**For Vercel Deployment**:
- `NEXT_PUBLIC_CHALLENGE_POOL_ADDRESS`: Contract on Arbitrum Sepolia
- `NEXT_PUBLIC_ENVIO_GRAPHQL_URL`: ENVIO GraphQL endpoint
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: WalletConnect project ID

## Troubleshooting

### Contract Deployment Issues
- Ensure you have ETH on Arbitrum Sepolia
- Check private key in environment
- Verify RPC URL is correct
- Check contract bytecode size

### ENVIO Sync Issues
- Verify contract address in config.yaml is correct
- Check start_block matches deployment block
- Ensure ABI file is complete and valid
- Check ENVIO logs for detailed errors

### Frontend GraphQL Errors
- Verify ENVIO indexer is synced (check dashboard)
- Test GraphQL endpoint manually in Playground
- Check Apollo Client endpoint URL in config
- Ensure ENVIO endpoint is public and accessible

### Wallet Connection Issues
- Switch network to Arbitrum Sepolia in MetaMask
- Clear browser cache
- Ensure WalletConnect project ID is valid
- Check network switching in wallet