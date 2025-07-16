#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, panic_with_error
};

#[derive(Clone)]
#[contracttype]
pub struct UserInfo {
    pub amount: u64,
    pub reward_debt: u64,
    pub last_deposit_time: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct PoolInfo {
    pub lp_token: Address,
    pub reward_token: Address,
    pub emission_rate: u64,
    pub start_time: u64,
    pub end_time: u64,
    pub last_reward_time: u64,
    pub acc_reward_per_share: u64,
    pub total_staked: u64,
    pub owner: Address,
    pub harvest_module: Address,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    PoolInfo,
    UserInfo(Address),
    Initialized,
}

#[derive(Clone)]
#[contracttype]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InvalidAmount = 4,
    FarmEnded = 5,
    FarmNotStarted = 6,
}

#[contract]
pub struct XLPFarm;

#[contractimpl] 
impl XLPFarm {
    /// Initialize the farm contract
    pub fn initialize(
        env: Env,
        lp_token: Address,
        reward_token: Address,
        emission_rate: u64,
        start_time: u64,
        end_time: u64,
        owner: Address,
        harvest_module: Address,
    ) {
        if env.storage().instance().has(&DataKey::Initialized) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }

        let pool_info = PoolInfo {
            lp_token,
            reward_token,
            emission_rate,
            start_time,
            end_time,
            last_reward_time: start_time,
            acc_reward_per_share: 0,
            total_staked: 0,
            owner,
            harvest_module,
        };

        env.storage().instance().set(&DataKey::PoolInfo, &pool_info);
        env.storage().instance().set(&DataKey::Initialized, &true);
    }

    /// Get user information
    pub fn get_user_info(env: &Env, user: &Address) -> UserInfo {
        env.storage().instance().get(&DataKey::UserInfo(user.clone()))
            .unwrap_or(UserInfo {
                amount: 0,
                reward_debt: 0,
                last_deposit_time: 0,
            })
    }

    /// Get pool information
    pub fn get_pool_info(env: &Env) -> PoolInfo {
        env.storage().instance().get(&DataKey::PoolInfo)
            .expect("Pool not initialized")
    }
}