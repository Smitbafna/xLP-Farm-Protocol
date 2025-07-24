export interface Farm {
  id: number;
  lpPair: string;
  rewardToken: string;
  apr: number;
  tvl: string;
  timeLeft: string;
  strategy: string;
  strategyApy?: number;
  isActive: boolean;
  createdAt: string;
  lpTokenAddress?: string;
  emissionRate?: string;
  duration?: string;
  linkedVault?: string;
}

const FARMS_STORAGE_KEY = 'stellar_farms';

// Initialize with default farms if localStorage is empty
const defaultFarms: Farm[] = [
  {
    id: 1,
    lpPair: 'USDC-ETH',
    rewardToken: 'XYZ',
    apr: 85.4,
    tvl: '$2.1M',
    timeLeft: '45 days',
    strategy: 'DeFindex Lending Vault',
    strategyApy: 12.8,
    isActive: true,
    createdAt: new Date().toISOString(),
    lpTokenAddress: 'CAABC123...',
    emissionRate: '1000',
    duration: '90',
    linkedVault: 'vault1',
  },
  {
    id: 2,
    lpPair: 'XLM-USDC',
    rewardToken: 'STELLAR',
    apr: 67.2,
    tvl: '$1.8M',
    timeLeft: '23 days',
    strategy: 'DeFindex LP Strategy',
    strategyApy: 9.5,
    isActive: true,
    createdAt: new Date().toISOString(),
    lpTokenAddress: 'CDEFG456...',
    emissionRate: '800',
    duration: '60',
    linkedVault: 'vault2',
  },
  {
    id: 3,
    lpPair: 'ETH-BTC',
    rewardToken: 'DEFI',
    apr: 92.1,
    tvl: '$892K',
    timeLeft: '12 days',
    strategy: 'Soroswap Auto-Compound',
    strategyApy: 15.3,
    isActive: true,
    createdAt: new Date().toISOString(),
    lpTokenAddress: 'CHIJK789...',
    emissionRate: '1200',
    duration: '30',
    linkedVault: 'vault3',
  },
  {
    id: 4,
    lpPair: 'USDC-XLM',
    rewardToken: 'REWARDS',
    apr: 73.8,
    tvl: '$1.2M',
    timeLeft: '67 days',
    strategy: 'DeFindex Lending Vault',
    strategyApy: 11.2,
    isActive: false,
    createdAt: new Date().toISOString(),
    lpTokenAddress: 'CLMNO012...',
    emissionRate: '900',
    duration: '120',
    linkedVault: 'vault4',
  },
];

export class FarmStorage {
  // Check if we're in browser environment
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // Get all farms from localStorage
  static getFarms(): Farm[] {
    if (!this.isClient()) return defaultFarms;
    
    try {
      const stored = localStorage.getItem(FARMS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      } else {
        // Initialize with default farms
        this.setFarms(defaultFarms);
        return defaultFarms;
      }
    } catch (error) {
      console.error('Error reading farms from localStorage:', error);
      return defaultFarms;
    }
  }

  // Save farms to localStorage
  static setFarms(farms: Farm[]): void {
    if (!this.isClient()) return;
    
    try {
      localStorage.setItem(FARMS_STORAGE_KEY, JSON.stringify(farms));
    } catch (error) {
      console.error('Error saving farms to localStorage:', error);
    }
  }

  // Get a specific farm by ID
  static getFarmById(id: number): Farm | undefined {
    const farms = this.getFarms();
    return farms.find(farm => farm.id === id);
  }

  // Add a new farm
  static addFarm(farmData: Omit<Farm, 'id' | 'createdAt'>): Farm {
    const farms = this.getFarms();
    const newId = Math.max(...farms.map(f => f.id), 0) + 1;
    
    const newFarm: Farm = {
      ...farmData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    
    const updatedFarms = [...farms, newFarm];
    this.setFarms(updatedFarms);
    
    return newFarm;
  }

  // Update an existing farm
  static updateFarm(id: number, updates: Partial<Omit<Farm, 'id'>>): Farm | null {
    const farms = this.getFarms();
    const farmIndex = farms.findIndex(farm => farm.id === id);
    
    if (farmIndex === -1) return null;
    
    const existingFarm = farms[farmIndex];
    if (!existingFarm) return null;
    
    const updatedFarm: Farm = Object.assign({}, existingFarm, updates);
    farms[farmIndex] = updatedFarm;
    
    this.setFarms(farms);
    return updatedFarm;
  }

  // Delete a farm
  static deleteFarm(id: number): boolean {
    const farms = this.getFarms();
    const filteredFarms = farms.filter(farm => farm.id !== id);
    
    if (filteredFarms.length === farms.length) return false;
    
    this.setFarms(filteredFarms);
    return true;
  }

  // Toggle farm active status
  static toggleFarmStatus(id: number): Farm | null {
    const farms = this.getFarms();
    const farm = farms.find(f => f.id === id);
    
    if (!farm) return null;
    
    return this.updateFarm(id, { isActive: !farm.isActive });
  }

  // Calculate time left for a farm based on duration and creation date
  static calculateTimeLeft(farm: Farm): string {
    if (!farm.duration) return farm.timeLeft;
    
    const createdDate = new Date(farm.createdAt);
    const durationDays = parseInt(farm.duration);
    const endDate = new Date(createdDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return '1 day';
    return `${diffDays} days`;
  }

  // Refresh time left for all farms
  static refreshTimeLeft(): Farm[] {
    const farms = this.getFarms();
    const updatedFarms = farms.map(farm => ({
      ...farm,
      timeLeft: this.calculateTimeLeft(farm),
    }));
    
    this.setFarms(updatedFarms);
    return updatedFarms;
  }
}
