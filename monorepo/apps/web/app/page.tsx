'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Farm, FarmStorage } from '../lib/farmStorage';

export default function FarmListPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load farms from localStorage
    const loadFarms = () => {
      try {
        const storedFarms = FarmStorage.getFarms();
        // Refresh time left for all farms
        const updatedFarms = FarmStorage.refreshTimeLeft();
        setFarms(updatedFarms);
      } catch (error) {
        console.error('Error loading farms:', error);
        setFarms([]);
      } finally {
        setLoading(false);
      }
    };

    loadFarms();

    // Set up interval to refresh time left every minute
    const interval = setInterval(() => {
      const updatedFarms = FarmStorage.refreshTimeLeft();
      setFarms(updatedFarms);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleFarmStatus = (farmId: number) => {
    const updatedFarm = FarmStorage.toggleFarmStatus(farmId);
    if (updatedFarm) {
      setFarms(prevFarms => 
        prevFarms.map(farm => 
          farm.id === farmId ? updatedFarm : farm
        )
      );
    }
  };

  const handleConnectWallet = () => {
    console.log('Connecting wallet...');
    // Add wallet connection logic here
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading farms...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🪙 xLP Farm Protocol
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Stake Soroswap LP tokens. Earn rewards. Auto-compound into DeFindex.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-2xl font-bold text-indigo-600">$4.8M</div>
            <div className="text-sm text-gray-600">Total Value Locked</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-2xl font-bold text-green-600">{farms.length}</div>
            <div className="text-sm text-gray-600">Active Farms</div>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-600">78.2%</div>
            <div className="text-sm text-gray-600">Average APR</div>
          </div>
        </div>

        {/* Farm List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">Active Farms</h2>
            <Link href="/admin">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => console.log('Navigate to admin')}
              >
                Create New Farm
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {farms.map((farm) => (
              <div key={farm.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{farm.lpPair}</h3>
                    <p className="text-sm text-gray-600">Earn {farm.rewardToken}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    farm.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {farm.isActive ? 'Active' : 'Ended'}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Farm Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">APR</div>
                      <div className="text-lg font-semibold text-green-600">
                        {farm.apr}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">TVL</div>
                      <div className="text-lg font-semibold">{farm.tvl}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Time Left</div>
                      <div className="text-sm font-medium">{farm.timeLeft}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Strategy</div>
                      <div className="text-sm font-medium text-purple-600">
                        {farm.strategy}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link href={`/farms/${farm.id}`}>
                    <button 
                      className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                        farm.isActive
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!farm.isActive}
                      onClick={() => console.log(`Navigate to farm ${farm.id}`)}
                    >
                      {farm.isActive ? 'Stake Now' : 'Farm Ended'}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16 py-12 bg-white rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready to start earning?
          </h3>
          <p className="text-gray-600 mb-6">
            Connect your wallet and start staking LP tokens for automated yield farming.
          </p>
          <button 
            className="px-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors"
            onClick={handleConnectWallet}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
}