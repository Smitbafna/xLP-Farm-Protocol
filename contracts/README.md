# xLP Farm Protocol - Smart Contracts

This directory contains the Soroban smart contracts for the xLP Farm Protocol on Stellar.

## Contracts Overview

### 1. FarmFactory (`farm-factory/`)
The factory contract responsible for deploying new xLP farm instances.

**Key Functions:**
- `initialize(owner)` - Initialize the factory
- `deploy_farm(lp_token, reward_token, emission_rate, duration, farm_wasm_hash)` - Deploy a new farm
- `get_farm(farm_id)` - Get farm configuration
- `get_farm_count()` - Get total deployed farms

### 2. XLP Farm (`xlp-farm/`)
The core staking contract that handles LP token deposits, reward distribution, and harvest coordination.

**Key Functions:**
- `initialize(lp_token, reward_token, emission_rate, start_time, end_time, owner, harvest_module)` - Initialize farm
- `stake(user, amount)` - Stake LP tokens
- `unstake(user, amount)` - Unstake LP tokens and claim rewards
- `claim_rewards(user)` - Claim pending rewards
- `harvest_and_compound(user)` - Trigger auto-compounding
- `pending_reward(user)` - View pending rewards

### 3. Harvest Module (`harvest-module/`)
Handles the auto-compounding logic by swapping rewards and depositing into DeFindex vaults.

**Key Functions:**
- `initialize(soroswap_aggregator, defindex_vault_factory, admin)` - Initialize module
- `authorize_farm(farm)` - Authorize a farm to use harvest functionality
- `harvest_and_compound(user, reward_token, reward_amount)` - Main harvest logic
- `set_user_vault(user, vault)` - Set user's preferred DeFindex vault

## Architecture Flow

1. **Admin/DAO** uses `FarmFactory` to deploy new `XLPFarm` instances
2. **Users** stake Soroswap LP tokens in `XLPFarm` contracts
3. **XLPFarm** distributes reward tokens based on emission schedules
4. **HarvestModule** automatically:
   - Swaps reward tokens via Soroswap Aggregator
   - Deposits swapped tokens into user's DeFindex vault
   - Executes yield strategies for compounding

## Building & Deployment

### Prerequisites
- Rust with `wasm32-unknown-unknown` target
- Soroban CLI
- Stellar network access

### Build
```bash
# Build all contracts
cargo build --target wasm32-unknown-unknown --release

# Build specific contract
cd farm-factory && cargo build --target wasm32-unknown-unknown --release
```

### Deploy
```bash
# Deploy to testnet
soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/farm_factory.wasm \
    --source-account ADMIN_SECRET_KEY \
    --network testnet

# Initialize contracts
soroban contract invoke \
    --id CONTRACT_ID \
    --source-account ADMIN_SECRET_KEY \
    --network testnet \
    -- initialize --owner OWNER_ADDRESS
```

## Integration Points

### Soroswap Integration
- **LP Tokens**: Users stake Soroswap LP tokens
- **Aggregator**: Harvest module uses Soroswap aggregator for optimal token swapping

### DeFindex Integration
- **Vault Factory**: Creates user vaults for compounding
- **Strategy Execution**: Deposits are managed by DeFindex yield strategies

## Security Features

- **Access Control**: Role-based permissions for admin functions
- **Safe Math**: Overflow protection in reward calculations  
- **Emergency Controls**: Admin emergency withdraw functionality
- **Isolated Farms**: Each farm operates independently

## Testing

```bash
cargo test
```

## License

MIT License
