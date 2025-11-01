#!/bin/bash

# Arbitrum Sepolia Deployment Script
# Usage: ./deploy-arbitrum-sepolia.sh <PRIVATE_KEY>
# Example: ./deploy-arbitrum-sepolia.sh 0x1234...

set -e

if [ -z "$1" ]; then
    echo "Error: Private key required"
    echo "Usage: ./deploy-arbitrum-sepolia.sh <PRIVATE_KEY>"
    echo ""
    echo "Steps to get your private key:"
    echo "1. Open MetaMask or your Web3 wallet"
    echo "2. Go to Account Settings → Export Private Key"
    echo "3. Copy the private key (should start with 0x)"
    echo ""
    echo "⚠️  NEVER share your private key! Store it safely."
    exit 1
fi

PRIVATE_KEY=$1
RPC_URL="https://sepolia-rollup.arbitrum.io/rpc"
CHAIN_ID="421614"

echo "🚀 Deploying ChallengePool to Arbitrum Sepolia..."
echo "📡 RPC URL: $RPC_URL"
echo "🔗 Chain ID: $CHAIN_ID"
echo ""

# Build contracts first
echo "📦 Building contracts..."
forge build

echo ""
echo "⏳ Deploying to Arbitrum Sepolia..."
echo "(This may take 1-2 minutes)"
echo ""

# Deploy the contract
forge script scripts/Deploy.s.sol:DeployScript \
    --rpc-url "$RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --chain "$CHAIN_ID" \
    -vvv

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Save the contract address from the output above"
echo "2. Update fitness-challenge/.env with NEXT_PUBLIC_CHALLENGE_POOL_ADDRESS"
echo "3. Update envio-indexer/config.yaml with the contract address"
echo "4. Deploy ENVIO indexer: cd ../envio-indexer && pnpm install && pnpm codegen"
echo ""
echo "🔍 View contract on Arbiscan:"
echo "   https://sepolia.arbiscan.io/address/[CONTRACT_ADDRESS]"
