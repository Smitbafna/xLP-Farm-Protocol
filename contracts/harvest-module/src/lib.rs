#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, Symbol, Vec,
    token::{TokenClient}, panic_with_error
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
    UserVault(Address), // Maps user to their DeFindex vault
}

#[derive(Clone)]
#[contracttype]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2, 
    Unauthorized = 3,
    InvalidAmount = 4,
    SwapFailed = 5,
    VaultDepositFailed = 6,
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

    /// Main harvest and compound function called by farm contracts
    pub fn harvest_and_compound(
        env: Env,
        user: Address,
        reward_token: Address,
        reward_amount: u64,
    ) {
        // Verify the caller is an authorized farm
        let caller = env.current_contract_address(); // In practice, this would be the calling farm
        if !env.storage().instance().has(&DataKey::AuthorizedFarm(caller)) {
            panic_with_error!(&env, Error::Unauthorized);
        }

        if reward_amount == 0 {
            panic_with_error!(&env, Error::InvalidAmount);
        }

        let config = Self::get_config(&env);

        // Step 1: Swap reward tokens to stable token via Soroswap Aggregator
        let swapped_amount = Self::swap_via_soroswap(
            &env,
            &config.soroswap_aggregator,
            &reward_token,
            reward_amount,
        );

        // Step 2: Get or create user's DeFindex vault
        let vault_address = Self::get_or_create_user_vault(&env, &user, &config);

        // Step 3: Deposit swapped tokens into DeFindex vault
        Self::deposit_to_vault(&env, &vault_address, swapped_amount);

        // Emit harvest event
        env.events().publish(
            (Symbol::new(&env, "harvested_and_compounded"),),
            (user, reward_token, reward_amount, swapped_amount)
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

    /// Update configuration (admin only)
    pub fn update_config(
        env: Env,
        soroswap_aggregator: Option<Address>,
        defindex_vault_factory: Option<Address>,
    ) {
        let mut config = Self::get_config(&env);
        config.admin.require_auth();

        if let Some(aggregator) = soroswap_aggregator {
            config.soroswap_aggregator = aggregator;
        }
        
        if let Some(vault_factory) = defindex_vault_factory {
            config.defindex_vault_factory = vault_factory;
        }

        env.storage().instance().set(&DataKey::Config, &config);
    }

    /// Emergency withdraw function (admin only)
    pub fn emergency_withdraw(
        env: Env,
        token: Address,
        to: Address,
        amount: u64,
    ) {
        let config = Self::get_config(&env);
        config.admin.require_auth();

        let token_client = TokenClient::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &to, &(amount as i128));

        env.events().publish(
            (Symbol::new(&env, "emergency_withdraw"),),
            (token, to, amount)
        );
    }

    // Internal helper functions
    fn get_config(env: &Env) -> HarvestConfig {
        env.storage().instance().get(&DataKey::Config)
            .expect("Harvest module not initialized")
    }

    fn swap_via_soroswap(
        env: &Env,
        aggregator: &Address,
        token_in: &Address,
        amount_in: u64,
    ) -> u64 {
        // This would call the Soroswap Aggregator contract
        // For now, we'll simulate a successful swap
        // In reality, this would involve:
        // 1. Approve tokens to aggregator
        // 2. Call aggregator's swap function
        // 3. Return the amount of output tokens received

        let token_client = TokenClient::new(env, token_in);
        token_client.approve(&env.current_contract_address(), aggregator, &(amount_in as i128), &(env.ledger().sequence() + 100));

        // Simulate aggregator call - in reality this would be:
        // let result: u64 = env.invoke_contract(
        //     aggregator,
        //     &Symbol::new(env, "swap"),
        //     (token_in.clone(), usdc_address, amount_in).into(),
        // );
        
        // For simulation, assume 1:1 swap rate
        let swapped_amount = amount_in;

        env.events().publish(
            (Symbol::new(env, "token_swapped"),),
            (token_in.clone(), amount_in, swapped_amount)
        );

        swapped_amount
    }

    fn get_or_create_user_vault(
        env: &Env,
        user: &Address,
        config: &HarvestConfig,
    ) -> Address {
        // Check if user has a preferred vault
        if let Some(vault) = env.storage().instance().get(&DataKey::UserVault(user.clone())) {
            return vault;
        }

        // Create a default vault for the user via DeFindex Vault Factory
        // This would call the DeFindex Vault Factory contract
        // For simulation, we'll use a placeholder address
        let vault_address = Address::from_string(&String::from_str(env, "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAYBFDKDCFW"));

        // Store the vault for future use
        env.storage().instance().set(&DataKey::UserVault(user.clone()), &vault_address);

        env.events().publish(
            (Symbol::new(env, "vault_created"),),
            (user.clone(), vault_address.clone())
        );

        vault_address
    }

    fn deposit_to_vault(env: &Env, vault: &Address, amount: u64) {
        // This would call the DeFindex vault's deposit function
        // For simulation, we'll emit an event
        env.events().publish(
            (Symbol::new(env, "deposited_to_vault"),),
            (vault.clone(), amount)
        );

        // In reality, this would be:
        // env.invoke_contract::<()>(
        //     vault,
        //     &Symbol::new(env, "deposit"),
        //     (amount,).into(),
        // );
    }
}