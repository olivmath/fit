# Complete Deployment Guide - Fitness Challenge dApp

This guide covers the full deployment of the Fitness Challenge application to production (Arbitrum Sepolia testnet).

## Prerequisites

Before starting, ensure you have:
- ✅ ETH on **Arbitrum Sepolia testnet** (at least 0.01 ETH for deployment + operations)
- ✅ Private key from MetaMask or your Web3 wallet
- ✅ GitHub account (for code repositories)
- ✅ Vercel account (for frontend hosting)
- ✅ ENVIO account (for blockchain indexing)
- ✅ All code committed and pushed to GitHub

### Get Arbitrum Sepolia ETH

If you need testnet ETH:

1. **QuickNode Faucet** (fastest):
   - Visit: https://faucet.quicknode.com/arbitrum/sepolia
   - Get: 0.5 ETH (fastest option)

2. **Alchemy Faucet**:
   - Visit: https://www.alchemy.com/faucets/arbitrum-sepolia
   - Get: 0.25 ETH per day

3. **Arbitrum Official Faucet**:
   - Visit: https://faucet.arbitrum.io
   - Get: 0.005 ETH

## Phase 1: Deploy Smart Contracts to Arbitrum Sepolia

### Step 1.1: Get Your Private Key

⚠️ **SECURITY WARNING**: Private keys should never be shared or committed to git!

To export your private key:

**From MetaMask:**
1. Open MetaMask
2. Click the account icon (top-right)
3. Select "Account Settings"
4. Find "Export Private Key"
5. Enter your password
6. Copy the private key (starts with `0x`)

**From Other Wallets:**
- Refer to your wallet's documentation
- Usually found in "Security" or "Settings" → "Show Private Key"

### Step 1.2: Deploy Contract

```bash
cd smartcontracts

# Deploy to Arbitrum Sepolia
./deploy-arbitrum-sepolia.sh 0x<YOUR_PRIVATE_KEY_HERE>
```

**Example:**
```bash
./deploy-arbitrum-sepolia.sh 0x1234567890abcdef...
```

### Step 1.3: Save Deployment Info

From the deployment output, save:
- **Contract Address**: `0x...` (looks like `0xAbC123...`)
- **Deployment Hash**: Transaction hash
- **Deployment Block**: Block number
- **Deployment Date**: Today's date

**Save these in:** `DEPLOYMENT_INFO.txt` at project root

## Phase 2: Configure ENVIO Indexer

### Step 2.1: Update Config with Contract Address

```bash
cd envio-indexer
```

Edit `config.yaml`:
```yaml
networks:
  - id: 421614  # Arbitrum Sepolia
    start_block: <YOUR_DEPLOYMENT_BLOCK>
    contracts:
      - name: ChallengePool
        address: "0x<YOUR_CONTRACT_ADDRESS>"  # Replace with deployed address
        abi_file_path: ./abis/ChallengePool.json
```

### Step 2.2: Install Dependencies

```bash
pnpm install
pnpm codegen  # Generate TypeScript types from schema
```

### Step 2.3: Test Locally (Optional)

```bash
pnpm dev
# Visit http://localhost:8080 in your browser
# Test GraphQL queries in the playground
```

### Step 2.4: Push Code to GitHub

```bash
git add .
git commit -m "feat: deploy ENVIO indexer for Arbitrum Sepolia"
git push origin main
```

## Phase 3: Deploy ENVIO Indexer to Production

### Step 3.1: Login to ENVIO

1. Visit https://envio.dev
2. Click "Sign In" → "GitHub"
3. Authorize ENVIO to access your repositories

### Step 3.2: Create New Indexer

1. Click "New Indexer" or "Add Indexer"
2. Select your GitHub repository
3. Configure:
   - **Root Directory**: `/envio-indexer`
   - **Config File**: `config.yaml`
   - **Branch**: `main`
   - **Network**: Arbitrum Sepolia

### Step 3.3: Start Deployment

1. Click "Deploy"
2. Wait for ENVIO to sync (5-15 minutes)
3. Monitor sync progress in the dashboard

### Step 3.4: Get GraphQL Endpoint

Once deployed:
1. Copy your GraphQL endpoint
2. Format: `https://indexer.bigdevenergy.link/[YOUR_ID]/v1/graphql`
3. Save this URL - you'll need it for the frontend

## Phase 4: Deploy Frontend to Vercel

### Step 4.1: Setup Environment Variables

Create `.env.production` in `fitness-challenge/`:

```bash
NEXT_PUBLIC_CHALLENGE_POOL_ADDRESS=0x<YOUR_CONTRACT_ADDRESS>
NEXT_PUBLIC_ENVIO_GRAPHQL_URL=https://indexer.bigdevenergy.link/[YOUR_ID]/v1/graphql
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<YOUR_PROJECT_ID>
```

### Step 4.2: Get WalletConnect Project ID

1. Visit https://cloud.walletconnect.com
2. Create a new project
3. Copy your Project ID
4. Paste it into `.env.production`

### Step 4.3: Push Code to GitHub

```bash
cd fitness-challenge
git add .
git commit -m "feat: configure production environment variables"
git push origin main
```

### Step 4.4: Deploy to Vercel

1. Visit https://vercel.com
2. Click "New Project"
3. Select your GitHub repository
4. Configure:
   - **Framework**: Next.js
   - **Root Directory**: `/fitness-challenge`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.next`
5. Add Environment Variables (from .env.production):
   - `NEXT_PUBLIC_CHALLENGE_POOL_ADDRESS`
   - `NEXT_PUBLIC_ENVIO_GRAPHQL_URL`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
6. Click "Deploy"

### Step 4.5: Wait for Deployment

- First deployment takes 2-5 minutes
- Visit your Vercel URL once deployment completes
- URL format: `https://[PROJECT_NAME].vercel.app`

## Phase 5: Verify Deployment

### Verification Checklist

- [ ] **Contract on Arbiscan**
  - Visit: `https://sepolia.arbiscan.io/address/YOUR_CONTRACT_ADDRESS`
  - Should show ChallengePool contract code

- [ ] **ENVIO Indexer**
  - Visit: `https://envio.dev` and find your indexer
  - Status should show "Synced" or "Syncing"
  - Block height should be recent

- [ ] **Frontend Landing Page**
  - Visit your Vercel URL
  - Should show leaderboards and stats
  - No error messages in browser console

- [ ] **Wallet Connection**
  - Click "Connect Wallet"
  - Should prompt to connect on Arbitrum Sepolia
  - Should show connected wallet address

- [ ] **Test Deposit**
  - Click "Deposit" on landing page
  - Sign transaction in wallet
  - Wait for confirmation
  - Should see toast notifications
  - Check EventsFeed for deposit event

- [ ] **Test Exercise Logging**
  - Go to Dashboard
  - Add some exercises
  - Should see toast notifications
  - Check leaderboard updates

## Production URLs

Save these for reference:

```
Contract Address: 0x...
Contract URL: https://sepolia.arbiscan.io/address/0x...

ENVIO Indexer: https://envio.dev/app/...
GraphQL Endpoint: https://indexer.bigdevenergy.link/.../v1/graphql

Frontend URL: https://<PROJECT>.vercel.app
```

## Troubleshooting

### Deployment Issues

**Contract deployment fails:**
- Check you have sufficient ETH on Arbitrum Sepolia
- Verify private key is correct (starts with `0x`)
- Check RPC URL is accessible
- Ensure contract code has no compilation errors

**ENVIO sync not progressing:**
- Verify contract address is correct in config.yaml
- Check start_block matches deployment block
- Ensure ABI file is complete
- Check ENVIO logs for detailed errors

**Frontend shows blank/errors:**
- Check browser console for JavaScript errors
- Verify environment variables in Vercel settings
- Ensure GraphQL endpoint is accessible
- Check wallet is connected to Arbitrum Sepolia

**Wallet connection issues:**
- Ensure MetaMask/wallet is set to Arbitrum Sepolia network
- Try adding Arbitrum Sepolia manually:
  - Chain ID: 421614
  - RPC URL: https://sepolia-rollup.arbitrum.io/rpc
  - Block explorer: https://sepolia.arbiscan.io

## Next Steps After Deployment

1. **Monitor ENVIO Sync**
   - Watch indexer block height
   - Ensure it stays synced with chain

2. **Test All Features**
   - Deposit, log exercises, view leaderboards
   - Test on mobile/tablet/desktop
   - Test with different wallets

3. **Plan Mainnet Deployment**
   - When ready, deploy to Arbitrum One
   - Repeat these steps with mainnet RPC URL
   - Update environment variables to mainnet addresses

## Support Resources

- **CLAUDE.md**: Technical documentation
- **DEPLOYMENT_INFO.txt**: Your deployment details
- **Vercel Docs**: https://vercel.com/docs
- **ENVIO Docs**: https://docs.envio.dev
- **Arbitrum Docs**: https://docs.arbitrum.io
