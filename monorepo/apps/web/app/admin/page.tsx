'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LPTokenOption {
  address: string;
  pair: string;
  tvl: string;
}

interface CreateFarmForm {
  lpToken: string;
  rewardToken: string;
  emissionRate: string;
  duration: string;
  linkedVault: string;
}

export default function AdminPanel() {
  const [formData, setFormData] = useState<CreateFarmForm>({
    lpToken: '',
    rewardToken: '',
    emissionRate: '',
    duration: '',
    linkedVault: '',
  });
  
  const [lpTokens, setLpTokens] = useState<LPTokenOption[]>([]);
  const [estimatedApr, setEstimatedApr] = useState<number | null>(null);

  useEffect(() => {
    // Mock LP tokens data - replace with actual Soroswap contract calls
    const mockLpTokens: LPTokenOption[] = [
      { address: 'CAABC123...', pair: 'USDC-ETH', tvl: '$2.1M' },
      { address: 'CDEFG456...', pair: 'XLM-USDC', tvl: '$1.8M' },
      { address: 'CHIJK789...', pair: 'ETH-BTC', tvl: '$892K' },
      { address: 'CLMNO012...', pair: 'USDC-XLM', tvl: '$1.2M' },
    ];
    setLpTokens(mockLpTokens);
  }, []);

  useEffect(() => {
    // Calculate estimated APR based on emission rate and token price
    if (formData.emissionRate && formData.lpToken) {
      const mockCalculation = parseFloat(formData.emissionRate) * 365 / 1000; // Mock calculation
      setEstimatedApr(mockCalculation);
    } else {
      setEstimatedApr(null);
    }
  }, [formData.emissionRate, formData.lpToken]);

  const handleInputChange = (field: keyof CreateFarmForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateFarm = () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }
    
    console.log('Creating farm with data:', formData);
    alert('Farm creation functionality coming soon!');
  };

  const isFormValid = () => {
    return Object.values(formData).every(value => value.trim() !== '');
  };

  const selectedLpToken = lpTokens.find(token => token.address === formData.lpToken);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Create new farming campaigns using the FarmFactory contract</p>
          </div>
          <Link href="/">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
              ← Back to Farms
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Create New Farm</h2>
              
              <div className="space-y-6">
                {/* LP Token Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LP Token Pair
                  </label>
                  <select
                    value={formData.lpToken}
                    onChange={(e) => handleInputChange('lpToken', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select LP Token Pair</option>
                    {lpTokens.map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.pair} (TVL: {token.tvl})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reward Token */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reward Token Address
                  </label>
                  <input
                    type="text"
                    value={formData.rewardToken}
                    onChange={(e) => handleInputChange('rewardToken', e.target.value)}
                    placeholder="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Emission Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emission Rate (tokens per day)
                  </label>
                  <input
                    type="number"
                    value={formData.emissionRate}
                    onChange={(e) => handleInputChange('emissionRate', e.target.value)}
                    placeholder="1000"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Duration (days)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="30"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Linked DeFindex Vault */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Linked DeFindex Vault
                  </label>
                  <select
                    value={formData.linkedVault}
                    onChange={(e) => handleInputChange('linkedVault', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Vault Strategy</option>
                    <option value="lending">DeFindex Lending Vault (12.8% APY)</option>
                    <option value="lp">DeFindex LP Strategy (15.2% APY)</option>
                    <option value="bonds">DeFindex Bond Vault (8.9% APY)</option>
                    <option value="rwa">DeFindex RWA Vault (6.5% APY)</option>
                  </select>
                </div>

                {/* Create Button */}
                <div className="pt-4">
                  <button
                    onClick={handleCreateFarm}
                    disabled={!isFormValid()}
                    className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Farm
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-6">
            {/* Estimated Economics */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Economics Estimation</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Rewards:</span>
                  <span className="font-medium">
                    {formData.emissionRate && formData.duration 
                      ? `${(parseFloat(formData.emissionRate) * parseFloat(formData.duration)).toLocaleString()} tokens`
                      : '—'
                    }
                  </span>
                </div>
                {estimatedApr && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. APR:</span>
                    <span className="font-semibold text-green-600">{estimatedApr.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Gas Estimation */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Deployment Cost</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gas Fee:</span>
                  <span className="font-medium">~0.1 XLM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract Deploy:</span>
                  <span className="font-medium">~0.5 XLM</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Total Cost:</span>
                  <span className="font-semibold">~0.6 XLM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}