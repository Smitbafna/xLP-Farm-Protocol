#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, Symbol,
    token::{TokenClient}, panic_with_error
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

    /// Stake LP tokens
    pub fn stake(env: Env, user: Address, amount: u64) {
        user.require_auth();
        
        if amount == 0 {
            panic_with_error!(&env, Error::InvalidAmount);
        }

        let mut pool_info = Self::get_pool_info(&env);
        let current_time = env.ledger().timestamp();
        
        if current_time < pool_info.start_time {
            panic_with_error!(&env, Error::FarmNotStarted);
        }
        
        if current_time > pool_info.end_time {
            panic_with_error!(&env, Error::FarmEnded);
        }

        Self::update_pool(&env, &mut pool_info);

        let mut user_info = Self::get_user_info(&env, &user);
        
        // Calculate pending rewards
        if user_info.amount > 0 {
            let pending = (user_info.amount * pool_info.acc_reward_per_share) / 1e12 as u64 - user_info.reward_debt;
            if pending > 0 {
                Self::safe_reward_transfer(&env, &pool_info.reward_token, &user, pending);
            }
        }

        // Transfer LP tokens from user to contract
        let lp_token = TokenClient::new(&env, &pool_info.lp_token);
        lp_token.transfer(&user, &env.current_contract_address(), &(amount as i128));

        // Update user info
        user_info.amount += amount;
        user_info.reward_debt = (user_info.amount * pool_info.acc_reward_per_share) / 1e12 as u64;
        user_info.last_deposit_time = current_time;

        // Update pool info
        pool_info.total_staked += amount;

        // Save updated data
        env.storage().instance().set(&DataKey::UserInfo(user.clone()), &user_info);
        env.storage().instance().set(&DataKey::PoolInfo, &pool_info);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "staked"),),
            (user, amount, user_info.amount)
        );
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

    // Internal helper functions
    fn update_pool(env: &Env, pool_info: &mut PoolInfo) {
        let current_time = env.ledger().timestamp();
        
        if current_time <= pool_info.last_reward_time {
            return;
        }

        if pool_info.total_staked == 0 {
            pool_info.last_reward_time = current_time;
            return;
        }

        let multiplier = Self::get_multiplier(&pool_info.last_reward_time, &current_time, &pool_info.end_time);
        let reward = multiplier * pool_info.emission_rate;
        
        pool_info.acc_reward_per_share += (reward * 1e12 as u64) / pool_info.total_staked;
        pool_info.last_reward_time = current_time;
    }

    fn get_multiplier(from: &u64, to: &u64, end_time: &u64) -> u64 {
        let actual_to = if to > end_time { *end_time } else { *to };
        if actual_to <= *from {
            0
        } else {
            actual_to - from
        }
    }

    fn safe_reward_transfer(env: &Env, reward_token: &Address, to: &Address, amount: u64) {
        let token = TokenClient::new(env, reward_token);
        let balance = token.balance(&env.current_contract_address());
        
        let transfer_amount = if balance < amount as i128 {
            balance
        } else {
            amount as i128
        };

        if transfer_amount > 0 {
            token.transfer(&env.current_contract_address(), to, &transfer_amount);
        }
    }
}