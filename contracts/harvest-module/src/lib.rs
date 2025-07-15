#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, Symbol,
    panic_with_error
};

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

    /// Authorize a farm contract to use this harvest module
    pub fn authorize_farm(env: Env, farm: Address) {
        let config = Self::get_config(&env);
        config.admin.require_auth();

        env.storage().instance().set(&DataKey::AuthorizedFarm(farm.clone()), &true);
        
        env.events().publish(
            (Symbol::new(&env, "farm_authorized"),),
            (farm,)
        );
    }

    /// Set user's preferred DeFindex vault
    pub fn set_user_vault(env: Env, user: Address, vault: Address) {
        user.require_auth();
        env.storage().instance().set(&DataKey::UserVault(user.clone()), &vault);
        
        env.events().publish(
            (Symbol::new(&env, "user_vault_set"),),
            (user, vault)
        );
    }

    /// Get user's vault address
    pub fn get_user_vault(env: Env, user: Address) -> Option<Address> {
        env.storage().instance().get(&DataKey::UserVault(user))
    }

    // Internal helper functions
    fn get_config(env: &Env) -> HarvestConfig {
        env.storage().instance().get(&DataKey::Config)
            .expect("Harvest module not initialized")
    }
}