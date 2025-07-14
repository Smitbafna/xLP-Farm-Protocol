#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, Vec, Bytes};

#[derive(Clone)]
#[contracttype]
pub struct FarmConfig {
    pub lp_token: Address,
    pub reward_token: Address, 
    pub emission_rate: u64,
    pub start_time: u64,
    pub end_time: u64,
    pub owner: Address,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    FarmCount,
    Farm(u64),
    Owner,
}

#[contract]
pub struct FarmFactory;

#[contractimpl]
impl FarmFactory {
    /// Initialize the factory contract
    pub fn initialize(env: Env, owner: Address) {
        if env.storage().instance().has(&DataKey::Owner) {
            panic!("Already initialized");
        }
        
        owner.require_auth();
        env.storage().instance().set(&DataKey::Owner, &owner);
        env.storage().instance().set(&DataKey::FarmCount, &0u64);
    }

    /// Deploy a new xLP farm contract
    pub fn deploy_farm(
        env: Env,
        lp_token: Address,
        reward_token: Address,
        emission_rate: u64,
        duration: u64,
        farm_wasm_hash: Bytes,
    ) -> Address {
        let owner: Address = env.storage().instance().get(&DataKey::Owner)
            .expect("Factory not initialized");
        owner.require_auth();

        let current_time = env.ledger().timestamp();
        let end_time = current_time + duration;
        
        let farm_count: u64 = env.storage().instance()
            .get(&DataKey::FarmCount)
            .unwrap_or(0);

        let config = FarmConfig {
            lp_token: lp_token.clone(),
            reward_token: reward_token.clone(),
            emission_rate,
            start_time: current_time,
            end_time,
            owner: owner.clone(),
        };

        // Generate salt for unique farm address
        let salt = Bytes::from_array(&env, &[farm_count as u8; 32]);
        
        // Deploy the farm contract
        let farm_address = env
            .deployer()
            .with_current_contract(salt)
            .deploy(farm_wasm_hash);

        // Store farm configuration
        env.storage().instance().set(&DataKey::Farm(farm_count), &config);
        env.storage().instance().set(&DataKey::FarmCount, &(farm_count + 1));

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "farm_deployed"),),
            (farm_address.clone(), lp_token, reward_token, emission_rate)
        );

        farm_address
    }

    /// Get farm configuration by index
    pub fn get_farm(env: Env, farm_id: u64) -> Option<FarmConfig> {
        env.storage().instance().get(&DataKey::Farm(farm_id))
    }

    /// Get total number of deployed farms
    pub fn get_farm_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::FarmCount).unwrap_or(0)
    }

    /// Get factory owner
    pub fn get_owner(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Owner)
            .expect("Factory not initialized")
    }

    /// Update factory owner
    pub fn set_owner(env: Env, new_owner: Address) {
        let current_owner: Address = env.storage().instance().get(&DataKey::Owner)
            .expect("Factory not initialized");
        current_owner.require_auth();

        env.storage().instance().set(&DataKey::Owner, &new_owner);
        
        env.events().publish(
            (Symbol::new(&env, "owner_updated"),),
            (current_owner, new_owner)
        );
    }
}