'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserFarm {
  id: number;
  lpPair: string;
  rewardToken: string;
  stakedAmount: number;
  earnedRewards: number;
  apr: number;
  isActive: boolean;
}

export default function MyFarmsDashboard() {
  const [userFarms, setUserFarms] = useState<UserFarm[]>([]);
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
          apr: 125.5,
          isActive: true,
        },
        {
          id: 2,
          lpPair: 'XLM-USDC',
          rewardToken: 'DEFINDEX',
          stakedAmount: 890.25,
          earnedRewards: 15.67,
          apr: 98.2,
          isActive: true,
        },
      ];
      
      setUserFarms(mockUserFarms);
      setLoading(false);
    }, 1000);
  }, []);

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
          <Link href="/">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Browse More Farms
            </button>
          </Link>
        </div>

        {/* Farms List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Your Positions</h2>

          {userFarms.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center shadow-sm">
              <div className="text-gray-400 text-6xl mb-4">🌾</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No farms yet</h3>
              <p className="text-gray-600 mb-6">Start staking LP tokens to earn rewards</p>
              <Link href="/">
                <button className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Browse Farms
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userFarms.map((farm) => (
                <div key={farm.id} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    {/* Farm Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {farm.lpPair.split('-')[0][0]}{farm.lpPair.split('-')[1][0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{farm.lpPair}</h3>
                        <span className="text-sm text-gray-600">Earn {farm.rewardToken}</span>
                      </div>
                    </div>

                    {/* Position Details */}
                    <div className="flex space-x-8">
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Staked</div>
                        <div className="font-semibold">${farm.stakedAmount.toFixed(2)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">Earned</div>
                        <div className="font-semibold text-green-600">${farm.earnedRewards.toFixed(2)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">APR</div>
                        <div className="font-semibold">{farm.apr.toFixed(1)}%</div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}