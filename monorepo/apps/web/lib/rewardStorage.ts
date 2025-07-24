export interface CrossChainReward {
  id: number;
  name: string;
  description: string;
  value: string;
  type: 'NFT' | 'USDC' | 'Token' | 'Experience';
  chain: string;
  chainName: string;
  icon: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  expiresIn: string;
  partner: string;
  requirements: string;
  status: 'claimable' | 'pending' | 'claimed';
  claimedAt?: string;
  bridgingTx?: string;
}

const REWARDS_STORAGE_KEY = 'stellar_cross_chain_rewards';

// Initialize with default rewards if localStorage is empty
const defaultRewards: CrossChainReward[] = [
  {
    id: 1,
    name: "VIP Concert Access NFT",
    description: "Exclusive access to partner concerts and events",
    value: "$150",
    type: "NFT",
    chain: "polygon",
    chainName: "Polygon",
    icon: "",
    rarity: "Legendary",
    expiresIn: "7d 14h",
    partner: "Live Nation",
    requirements: "2,000+ MetaMiles",
    status: "claimable"
  },
  {
    id: 2,
    name: "USDC Cashback",
    description: "Monthly cashback reward from dining partners",
    value: "$75.00",
    type: "USDC",
    chain: "base",
    chainName: "Base",
    icon: "",
    rarity: "Common",
    expiresIn: "30d",
    partner: "Restaurant Network",
    requirements: "Gold Tier",
    status: "claimable"
  },
  {
    id: 3,
    name: "DAO Summit Pass",
    description: "Access to exclusive Web3 conference",
    value: "$500",
    type: "NFT",
    chain: "ethereum",
    chainName: "Ethereum",
    icon: "",
    rarity: "Epic",
    expiresIn: "15d",
    partner: "Web3 Summit",
    requirements: "Platinum Tier",
    status: "claimable"
  },
  {
    id: 4,
    name: "Early Access Beta",
    description: "Beta access to new DeFi platform",
    value: "$200",
    type: "Experience",
    chain: "arbitrum",
    chainName: "Arbitrum",
    icon: "",
    rarity: "Rare",
    expiresIn: "3d 8h",
    partner: "DeFi Labs",
    requirements: "500+ Farm Points",
    status: "pending"
  },
  {
    id: 5,
    name: "Exclusive Trading Token",
    description: "Special token with trading benefits",
    value: "$300",
    type: "Token",
    chain: "stellar",
    chainName: "Stellar",
    icon: "",
    rarity: "Epic",
    expiresIn: "60d",
    partner: "StellarDEX",
    requirements: "Active Farmer",
    status: "claimed",
    claimedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

export class RewardStorage {
  // Check if we're in browser environment
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // Get all rewards from localStorage
  static getRewards(): CrossChainReward[] {
    if (!this.isClient()) return defaultRewards;
    
    try {
      const stored = localStorage.getItem(REWARDS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      } else {
        // Initialize with default rewards
        this.setRewards(defaultRewards);
        return defaultRewards;
      }
    } catch (error) {
      console.error('Error reading rewards from localStorage:', error);
      return defaultRewards;
    }
  }

  // Save rewards to localStorage
  static setRewards(rewards: CrossChainReward[]): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.setItem(REWARDS_STORAGE_KEY, JSON.stringify(rewards));
    } catch (error) {
      console.error('Error saving rewards to localStorage:', error);
    }
  }

  // Get rewards by status
  static getRewardsByStatus(status: 'claimable' | 'pending' | 'claimed'): CrossChainReward[] {
    const rewards = this.getRewards();
    return rewards.filter(reward => reward.status === status);
  }

  // Get a specific reward by ID
  static getRewardById(id: number): CrossChainReward | undefined {
    const rewards = this.getRewards();
    return rewards.find(reward => reward.id === id);
  }

  // Update reward status
  static updateRewardStatus(id: number, status: 'claimable' | 'pending' | 'claimed', bridgingTx?: string): CrossChainReward | null {
    const rewards = this.getRewards();
    const rewardIndex = rewards.findIndex(reward => reward.id === id);
    
    if (rewardIndex === -1) return null;
    
    const existingReward = rewards[rewardIndex];
    if (!existingReward) return null;
    
    const updatedReward: CrossChainReward = Object.assign({}, existingReward, {
      status,
      claimedAt: status === 'claimed' ? new Date().toISOString() : existingReward.claimedAt,
      bridgingTx: bridgingTx || existingReward.bridgingTx
    });
    
    rewards[rewardIndex] = updatedReward;
    this.setRewards(rewards);
    
    return updatedReward;
  }

  // Add a new reward
  static addReward(rewardData: Omit<CrossChainReward, 'id'>): CrossChainReward {
    const rewards = this.getRewards();
    const newId = Math.max(...rewards.map(r => r.id), 0) + 1;
    
    const newReward: CrossChainReward = {
      ...rewardData,
      id: newId,
    };
    
    const updatedRewards = [...rewards, newReward];
    this.setRewards(updatedRewards);
    
    return newReward;
  }

  // Delete a reward
  static deleteReward(id: number): boolean {
    const rewards = this.getRewards();
    const filteredRewards = rewards.filter(reward => reward.id !== id);
    
    if (filteredRewards.length === rewards.length) return false;
    
    this.setRewards(filteredRewards);
    return true;
  }

  // Get total value of claimable rewards
  static getTotalClaimableValue(): number {
    const claimableRewards = this.getRewardsByStatus('claimable');
    return claimableRewards.reduce((total, reward) => {
      const value = parseFloat(reward.value.replace('$', ''));
      return total + (isNaN(value) ? 0 : value);
    }, 0);
  }

  // Get rewards expiring soon (within 7 days)
  static getExpiringSoon(): CrossChainReward[] {
    const rewards = this.getRewardsByStatus('claimable');
    return rewards.filter(reward => {
      const expiresIn = reward.expiresIn;
      if (expiresIn && expiresIn.includes('d')) {
        const daysPart = expiresIn.split('d')[0];
        if (daysPart) {
          const days = parseInt(daysPart);
          return days <= 7;
        }
      }
      return false;
    });
  }
}
