//!
//! Cargo Delay Insurance Contract
//!
//! ERC20-based insurance paying per delayed day until delivery.
//! Admin updates delivery or delay status; users can claim daily while delayed.
//!
//! Note: this code is a template-only and has not been audited.
//!
// Allow `cargo stylus export-abi` to generate a main function.
#![cfg_attr(not(any(test, feature = "export-abi")), no_main)]
#![cfg_attr(not(any(test, feature = "export-abi")), no_std)]

#[macro_use]
extern crate alloc;

use alloc::vec::Vec;

/// Import items from the SDK. The prelude contains common traits and macros.
use stylus_sdk::{
    alloy_primitives::{Address, U256},
    alloy_sol_types::sol,
    prelude::*,
};

// ERC20 interface for external token calls
sol_interface! {
    interface IERC20 {
        function balanceOf(address account) external view returns (uint256);
        function transfer(address to, uint256 amount) external returns (bool);
        function transferFrom(address from, address to, uint256 amount) external returns (bool);
    }
}

// Events - simplified for size
sol! {
    event PolicyPurchased(uint256 indexed policy_id, address indexed insured);
    event DeliveryUpdated(uint256 indexed policy_id, bool delivered, uint256 actual_arrival);
    event DelayStatusSet(uint256 indexed policy_id, bool delayed);
    event Claimed(uint256 indexed policy_id, address indexed insured, uint256 days_claimed, uint256 amount);
}

// Policy storage structure - simplified for size
sol_storage! {
    pub struct Policy {
        address insured;
        uint256 expected_arrival;
        uint256 actual_arrival;
        uint256 claimed_days;
        uint256 status; // 0=inactive, 1=active, 2=delayed, 3=delivered
    }
}

// Main contract storage
sol_storage! {
    #[entrypoint]
    pub struct CargoDelayInsurance {
        address admin;
        address token;
        uint256 premium_amount;
        uint256 payout_per_day;
        uint256 max_payout_days;
        uint256 next_policy_id;
        uint256 lock;

        // Mapping: policy_id => Policy
        mapping(uint256 => Policy) policies;
    }
}

// Inline error messages to reduce binary size

#[public]
impl CargoDelayInsurance {
    /// Constructor-like initialization (call once after deployment)
    pub fn init(&mut self, token_address: Address) {
        // Only allow initialization if admin is not set
        let current_admin = self.admin.get();
        assert!(current_admin == Address::ZERO, "Already initialized");
        assert!(token_address != Address::ZERO, "token=0");
        
        self.admin.set(self.vm().msg_sender());
        self.token.set(token_address);
        self.next_policy_id.set(U256::from(1));
        self.lock.set(U256::from(1));
        
        // Default pricing: 1000 tokens premium, 10 tokens per day, max 10 days
        let premium = U256::from(1000u64) * U256::from(10u64).pow(U256::from(18u64));
        let payout = U256::from(10u64) * U256::from(10u64).pow(U256::from(18u64));
        let max_days = U256::from(10u64);
        
        self.premium_amount.set(premium);
        self.payout_per_day.set(payout);
        self.max_payout_days.set(max_days);
        
    }

    // -------------------- Admin Controls --------------------
    
    pub fn set_pricing(&mut self, premium: U256, payout: U256, max_days: U256) {
        self.only_admin();
        assert!(max_days > U256::ZERO, "maxPayoutDays=0");
        
        self.premium_amount.set(premium);
        self.payout_per_day.set(payout);
        self.max_payout_days.set(max_days);
        
    }
    
    pub fn set_admin(&mut self, new_admin: Address) {
        self.only_admin();
        assert!(new_admin != Address::ZERO, "admin=0");

        self.admin.set(new_admin);
    }
    
    pub fn set_delayed_status(&mut self, policy_id: U256, delayed: bool) {
        self.only_admin();

        let mut policy = self.policies.setter(policy_id);
        assert!(policy.insured.get() != Address::ZERO, "Invalid policy");

        if delayed {
            policy.status.set(U256::from(2)); // 2 = delayed
        } else {
            policy.status.set(U256::from(1)); // 1 = active
        }

        log(self.vm(), DelayStatusSet {
            policy_id,
            delayed,
        });
    }
    
    pub fn set_delivery_status(&mut self, policy_id: U256, delivered: bool, actual_arrival: U256) {
        self.only_admin();

        let mut policy = self.policies.setter(policy_id);
        assert!(policy.insured.get() != Address::ZERO, "Invalid policy");

        if delivered {
            assert!(actual_arrival > U256::ZERO, "arrival=0");
            policy.status.set(U256::from(3)); // 3 = delivered
            policy.actual_arrival.set(actual_arrival);
        } else {
            policy.status.set(U256::from(1)); // 1 = active
            policy.actual_arrival.set(U256::ZERO);
        }

        let final_arrival = policy.actual_arrival.get();

        log(self.vm(), DeliveryUpdated {
            policy_id,
            delivered,
            actual_arrival: final_arrival,
        });
    }
    
    pub fn withdraw_tokens(&mut self, to: Address, amount: U256) {
        self.only_admin();

        let token = IERC20::new(self.token.get());
        let result = token.transfer(&mut *self, to, amount);
        assert!(result.is_ok() && result.unwrap(), "withdraw failed");

    }
    
    // -------------------- User Methods --------------------
    
    pub fn buy_policy(&mut self, expected_arrival: U256) -> U256 {
        let current_time = U256::from(self.vm().block_timestamp());
        assert!(expected_arrival > current_time, "expected must be future");

        let premium = self.premium_amount.get();
        let token_addr = self.token.get();
        let sender = self.vm().msg_sender();
        let contract = self.vm().contract_address();

        let token = IERC20::new(token_addr);
        let result = token.transfer_from(&mut *self, sender, contract, premium);
        assert!(result.is_ok() && result.unwrap(), "premium transfer failed");

        let policy_id = self.next_policy_id.get();
        self.next_policy_id.set(policy_id + U256::from(1));

        let mut policy = self.policies.setter(policy_id);
        policy.insured.set(sender);
        policy.expected_arrival.set(expected_arrival);
        policy.actual_arrival.set(U256::ZERO);
        policy.claimed_days.set(U256::ZERO);
        policy.status.set(U256::from(1)); // 1 = active

        log(self.vm(), PolicyPurchased {
            policy_id,
            insured: sender,
        });

        policy_id
    }
    
    pub fn claim(&mut self, policy_id: U256) {
        self.non_reentrant_start();

        let sender = self.vm().msg_sender();
        let current_time = U256::from(self.vm().block_timestamp());

        // First, read policy data without holding the setter
        let policy = self.policies.get(policy_id);
        assert!(policy.insured.get() == sender, "Not owner");
        let status = policy.status.get();
        assert!(status != U256::ZERO, "Inactive");
        assert!(status == U256::from(2) || status == U256::from(3), "Not delayed/delivered"); // 2=delayed, 3=delivered

        let expected = policy.expected_arrival.get();
        let total_days = if status == U256::from(3) {
            Self::days_delayed(policy.actual_arrival.get(), expected)
        } else {
            Self::days_delayed(current_time, expected)
        };

        let max_days = self.max_payout_days.get();
        let capped_days = if total_days > max_days { max_days } else { total_days };

        let claimed = policy.claimed_days.get();
        assert!(capped_days > claimed, "Nothing to claim");

        let claimable_days = capped_days - claimed;
        let payout = claimable_days * self.payout_per_day.get();

        let insured = policy.insured.get();
        let token_addr = self.token.get();
        let contract = self.vm().contract_address();

        // Check balance
        let token = IERC20::new(token_addr);
        let balance = token.balance_of(&mut *self, contract).unwrap_or(U256::ZERO);
        assert!(balance >= payout, "insufficient funds");

        // Now update policy state
        let mut policy_setter = self.policies.setter(policy_id);
        policy_setter.claimed_days.set(capped_days);

        if capped_days >= max_days {
            policy_setter.status.set(U256::ZERO); // 0 = inactive
        }

        // Drop the policy setter to release the borrow before the transfer call
        drop(policy_setter);

        // Execute transfer
        let token = IERC20::new(token_addr);
        let result = token.transfer(&mut *self, insured, payout);
        assert!(result.is_ok() && result.unwrap(), "transfer failed");

        log(self.vm(), Claimed {
            policy_id,
            insured,
            days_claimed: claimable_days,
            amount: payout,
        });

        self.non_reentrant_end();
    }

    // -------------------- View Functions --------------------
    
    pub fn admin(&self) -> Address {
        self.admin.get()
    }
    
    pub fn token(&self) -> Address {
        self.token.get()
    }
    
    pub fn premium_amount(&self) -> U256 {
        self.premium_amount.get()
    }
    
    pub fn payout_per_day(&self) -> U256 {
        self.payout_per_day.get()
    }
    
    pub fn max_payout_days(&self) -> U256 {
        self.max_payout_days.get()
    }
    
    pub fn next_policy_id(&self) -> U256 {
        self.next_policy_id.get()
    }
    
    pub fn get_policy(&self, policy_id: U256) -> (
        Address,
        U256,
        U256,
        U256,
        U256,
    ) {
        let policy = self.policies.get(policy_id);
        assert!(policy.insured.get() != Address::ZERO, "Invalid policy");

        (
            policy.insured.get(),
            policy.expected_arrival.get(),
            policy.actual_arrival.get(),
            policy.claimed_days.get(),
            policy.status.get(),
        )
    }
    
    pub fn claimable_days(&self, policy_id: U256) -> U256 {
        let policy = self.policies.get(policy_id);

        let status = policy.status.get();
        if status != U256::from(2) && status != U256::from(3) { // Not delayed or delivered
            return U256::ZERO;
        }

        let expected = policy.expected_arrival.get();
        let total_days = if status == U256::from(3) { // delivered
            Self::days_delayed(policy.actual_arrival.get(), expected)
        } else {
            Self::days_delayed(U256::from(self.vm().block_timestamp()), expected)
        };
        
        let max_days = self.max_payout_days.get();
        let capped_days = if total_days > max_days { max_days } else { total_days };
        
        let claimed = policy.claimed_days.get();
        if capped_days <= claimed {
            return U256::ZERO;
        }
        
        capped_days - claimed
    }
}

// Internal helper methods
impl CargoDelayInsurance {
    fn only_admin(&self) {
        assert!(self.vm().msg_sender() == self.admin.get(), "Not admin");
    }
    
    fn non_reentrant_start(&mut self) {
        assert!(self.lock.get() == U256::from(1), "Reentrancy");
        self.lock.set(U256::from(2));
    }
    
    fn non_reentrant_end(&mut self) {
        self.lock.set(U256::from(1));
    }
    
    fn days_delayed(actual: U256, expected: U256) -> U256 {
        if actual <= expected {
            return U256::ZERO;
        }
        (actual - expected) / U256::from(86400) // 1 day = 86400 seconds
    }
}
