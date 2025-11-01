export CHAIN_ID=31337
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url http://127.0.0.1:8545 \
    --build-info \
    --account testff80 \
    --sender $(cast wallet address --account testff80) \
    --broadcast \
    --verbosity

python333 deploy.py

