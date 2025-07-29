'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserFarm {
  id: number;
  lpPair: string;
  rewardToken: string;
  stakedAmount: number;
  earnedRewards: number;
  compoundedAmount: number;
  apr: number;
  strategyApy: number;
  isActive: boolean;
  lastHarvest: string;
}

interface DashboardSummary {
  totalStaked: number;
  totalEarned: number;
  totalCompounded: number;
  dailyYield: number;
}

export default function MyFarmsDashboard() {
  const [userFarms, setUserFarms] = useState<UserFarm[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock loading delay
    setTimeout(() => {
      const mockUserFarms: UserFarm[] = [
        {
          id: 1,
          lpPair: 'USDC-ETH',
          rewardToken: 'STELLAR',
          stakedAmount: 1250.50,
          earnedRewards: 42.18,
          compoundedAmount: 156.70,
          apr: 125.5,
          strategyApy: 12.8,
          isActive: true,
          lastHarvest: '2 hours ago',
        },
        {
          id: 2,
          lpPair: 'XLM-USDC',
          rewardToken: 'DEFINDEX',
          stakedAmount: 890.25,
          earnedRewards: 15.67,
          compoundedAmount: 89.45,
          apr: 98.2,
          strategyApy: 15.2,
          isActive: true,
          lastHarvest: '1 day ago',
        },
        {
          id: 3,
          lpPair: 'ETH-BTC',
          rewardToken: 'SOROSWAP',
          stakedAmount: 567.80,
          earnedRewards: 8.23,
          compoundedAmount: 34.12,
          apr: 87.3,
          strategyApy: 8.9,
          isActive: true,
          lastHarvest: '3 hours ago',
        },
      ];
      
      // Calculate summary
      const mockSummary: DashboardSummary = {
        totalStaked: mockUserFarms.reduce((sum, farm) => sum + farm.stakedAmount, 0),
        totalEarned: mockUserFarms.reduce((sum, farm) => sum + farm.earnedRewards, 0),
        totalCompounded: mockUserFarms.reduce((sum, farm) => sum + farm.compoundedAmount, 0),
        dailyYield: mockUserFarms.reduce((sum, farm) => sum + (farm.stakedAmount * farm.apr / 365 / 100), 0),
      };
      
      setUserFarms(mockUserFarms);
      setSummary(mockSummary);
      setLoading(false);
    }, 1000);
  }, []);

  const handleClaimAll = () => {
    console.log('Claiming all rewards');
  };

  const handleHarvestAll = () => {
    console.log('Harvesting and compounding all farms');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your farms...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Farms</h1>
            <p className="text-gray-600">Track and manage your LP staking positions</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleClaimAll}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Claim All Rewards
            </button>
            <button
              onClick={handleHarvestAll}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Harvest All
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-2xl font-bold text-indigo-600">${summary.totalStaked.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Staked</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-2xl font-bold text-green-600">${summary.totalEarned.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">${summary.totalCompounded.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Compounded</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-2xl font-bold text-orange-600">${summary.dailyYield.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Estimated Daily Yield</div>
            </div>
          </div>
        )}

        {/* Farms List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">Your Positions</h2>
            <Link href="/">
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                Browse More Farms
              </button>
            </Link>
          </div>

          {userFarms.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center shadow-sm">
              <div className="text-gray-400 text-6xl mb-4">🌾</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No farms yet</h3>
              <p className="text-gray-600 mb-6">Start staking LP tokens to earn rewards and compound your yields</p>
              <Link href="/">
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Browse Farms
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userFarms.map((farm) => (
                <div key={farm.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    {/* Farm Info */}
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {farm.lpPair.split('-')[0][0]}{farm.lpPair.split('-')[1][0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{farm.lpPair}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Earn {farm.rewardToken}</span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Position Details */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-4 lg:mb-0">
                      <div className="text-center lg:text-left">
                        <div className="text-sm text-gray-600">Staked</div>
                        <div className="font-semibold">${farm.stakedAmount.toFixed(2)}</div>
                      </div>
                      <div className="text-center lg:text-left">
                        <div className="text-sm text-gray-600">Earned</div>
                        <div className="font-semibold text-green-600">${farm.earnedRewards.toFixed(2)}</div>
                      </div>
                      <div className="text-center lg:text-left">
                        <div className="text-sm text-gray-600">Compounded</div>
                        <div className="font-semibold text-purple-600">${farm.compoundedAmount.toFixed(2)}</div>
                      </div>
                      <div className="text-center lg:text-left">
                        <div className="text-sm text-gray-600">APR + Strategy</div>
                        <div className="font-semibold">{farm.apr.toFixed(1)}% + {farm.strategyApy.toFixed(1)}%</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link href={`/farms/${farm.id}`}>
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                          Manage
                        </button>
                      </Link>
                      {farm.earnedRewards > 0 && (
                        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                          Claim
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Last Harvest Info */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-600">
                    <span>Last harvest: {farm.lastHarvest}</span>
                    <span>Auto-compound: 🟢 Active</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}