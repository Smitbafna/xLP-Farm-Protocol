#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, panic_with_error};

#[derive(Clone)]
#[contracttype]
pub struct HarvestConfig {
    pub soroswap_aggregator: Address,
    pub defindex_vault_factory: Address,
    pub admin: Address,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Config,
    AuthorizedFarm(Address),
    UserVault(Address),
}

#[derive(Clone)]
#[contracttype]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2, 
    Unauthorized = 3,
    InvalidAmount = 4,
}

#[contract]
pub struct HarvestModule;

#[contractimpl]
impl HarvestModule {
    /// Initialize the harvest module
    pub fn initialize(
        env: Env,
        soroswap_aggregator: Address,
        defindex_vault_factory: Address,
        admin: Address,
    ) {
        if env.storage().instance().has(&DataKey::Config) {
            panic_with_error!(&env, Error::AlreadyInitialized);
        }

        let config = HarvestConfig {
            soroswap_aggregator,
            defindex_vault_factory,
            admin,
        };

        env.storage().instance().set(&DataKey::Config, &config);
    }

    // Internal helper functions
    fn get_config(env: &Env) -> HarvestConfig {
        env.storage().instance().get(&DataKey::Config)
            .expect("Harvest module not initialized")
    }
}