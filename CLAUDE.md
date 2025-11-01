# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web3 fitness challenge app for November. Users deposit 0.005 ETH and complete 3 monthly goals:
- 1000 flexões
- 1000 abdominais
- 100 km corrida

Vencedores (que bateram todas 3 metas) dividem o pool total entre si.

### Architecture

**ChallengePool.sol**: Main contract managing:
- Deposits (0.005 ETH fixed)
- Exercise tracking (manual input)
- 4 leaderboards (general + by exercise type)
- Prize distribution at month end

## Common Commands

### Frontend (UI)
```bash
cd ui
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run check-types  # Type check with TypeScript
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
cd ui && npm run dev
```

## Codebase Structure

### `/smartcontracts`
- **`src/ChallengePool.sol`**: Main contract with deposit, exercise tracking, leaderboards, prize distribution
- **`script/Deploy.s.sol`**: Deploys ChallengePool
- **`foundry.toml`**: Config (chain_id=99 for tests, solc 0.8.20, optimizer enabled)
- **`deploy.py`**: Auto-updates `ui/contracts/deployedContracts.ts` after deployment

### `/ui`
- **`app/`**: Next.js app directory with pages (blockexplorer, debug)
- **`components/`**: Reusable React components
- **`utils/fwt/`**: Framework utilities:
  - `contract.ts`: Core contract type definitions and helpers
  - `contractsData.ts`: Loads deployed contract addresses from `contracts/deployedContracts.ts`
  - `decodeTxData.ts`: Decodes transaction data
  - `getParsedError.ts`: Parses blockchain errors
  - `networks.ts`: Network configuration
- **`contracts/deployedContracts.ts`**: **Auto-generated** by `deploy.py` after deployment — contains deployed contract addresses and ABIs
- **`services/`**: API/service layer for blockchain interactions
- **`hooks/`**: Custom React hooks
- **`scaffold.config.ts`**: App config (networks, API keys, burner wallet settings)

## Key Integration Points

1. **Deployment**: `deploy.py` auto-updates `ui/contracts/deployedContracts.ts` after deployment
2. **Frontend Stack**: RainbowKit (wallet connection) + wagmi (contract interaction) + viem (RPC calls)
3. **Pages**: Landing (public leaderboards/totals) → Dashboard (authed, can deposit and add exercises)

## Development Notes

- **Storage Optimized**: `_hasCompletedChallenge()` calculates completion on-demand, no bool stored
- **Leaderboards**: 4 separate leaderboards (general, flexões, abdominais, km)
- **Challenge Period**: Nov 1-30, adjustable via `setChallengeDates()` for testing
- **Networks**: Sepolia testnet for dev, Arbitrum for production
