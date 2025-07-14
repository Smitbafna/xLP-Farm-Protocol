#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

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
}