'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Farm, FarmStorage } from '../../../lib/farmStorage';

interface UserPosition {
  stakedAmount: number;
  earnedRewards: number;
  compoundedAmount: number;
  lastHarvest: string;
}

export default function FarmInteractionPage() {
  const params = useParams();
  const router = useRouter();
  const farmId = parseInt(params.id as string);
  
  const [farm, setFarm] = useState<Farm | null>(null);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLpBalance, setUserLpBalance] = useState(1250.5); // Mock balance
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isHarvesting, setIsHarvesting] = useState(false);

  useEffect(() => {
    // Load farm from localStorage
    const loadFarm = () => {
      try {
        const storedFarm = FarmStorage.getFarmById(farmId);
        if (storedFarm) {
          // Update time left
          const updatedTimeLeft = FarmStorage.calculateTimeLeft(storedFarm);
          const farmWithUpdatedTime = { ...storedFarm, timeLeft: updatedTimeLeft };
          setFarm(farmWithUpdatedTime);
        } else {
          console.error('Farm not found');
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error loading farm:', error);
        router.push('/');
        return;
      }
    };

    loadFarm();

    // Mock user position data
    const mockPosition: UserPosition = {
      stakedAmount: 500.25,
      earnedRewards: 42.18,
      compoundedAmount: 156.7,
      lastHarvest: '2 hours ago',
    };

    setTimeout(() => {
      setUserPosition(mockPosition);
      setLoading(false);
    }, 1000);
  }, [farmId]);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (parseFloat(stakeAmount) > userLpBalance) {
      alert('Insufficient LP token balance');
      return;
    }
    
    setIsStaking(true);
    const amount = parseFloat(stakeAmount);
    
    try {
      console.log(`Staking ${amount} LP tokens`);
      
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful staking
      if (userPosition) {
        const updatedPosition = {
          ...userPosition,
          stakedAmount: userPosition.stakedAmount + amount,
        };
        setUserPosition(updatedPosition);
      }
      
      // Update user balance
      setUserLpBalance(prev => prev - amount);
      
      alert(`✅ Successfully staked ${amount} LP tokens!`);
      setStakeAmount('');
    } catch (error) {
      alert('❌ Failed to stake tokens. Please try again.');
      console.error('Staking error:', error);
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (parseFloat(unstakeAmount) > (userPosition?.stakedAmount || 0)) {
      alert('Insufficient staked amount');
      return;
    }
    
    setIsUnstaking(true);
    const amount = parseFloat(unstakeAmount);
    
    try {
      console.log(`Unstaking ${amount} LP tokens`);
      
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful unstaking
      if (userPosition) {
        const updatedPosition = {
          ...userPosition,
          stakedAmount: userPosition.stakedAmount - amount,
        };
        setUserPosition(updatedPosition);
      }
      
      // Update user balance (return LP tokens)
      setUserLpBalance(prev => prev + amount);
      
      alert(`✅ Successfully unstaked ${amount} LP tokens!`);
      setUnstakeAmount('');
    } catch (error) {
      alert('❌ Failed to unstake tokens. Please try again.');
      console.error('Unstaking error:', error);
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!userPosition || userPosition.earnedRewards <= 0) {
      alert('No rewards to claim');
      return;
    }
    
    setIsClaiming(true);
    const rewardAmount = userPosition.earnedRewards;
    
    try {
      console.log(`Claiming ${rewardAmount} ${farm?.rewardToken} rewards`);
      
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Simulate successful claim
      const updatedPosition = {
        ...userPosition,
        earnedRewards: 0,
        lastHarvest: 'Just now',
      };
      setUserPosition(updatedPosition);
      
      alert(`✅ Successfully claimed ${rewardAmount.toFixed(2)} ${farm?.rewardToken} tokens!`);
    } catch (error) {
      alert('❌ Failed to claim rewards. Please try again.');
      console.error('Claim error:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleHarvestAndCompound = async () => {
    if (!userPosition || userPosition.earnedRewards <= 0) {
      alert('No rewards to harvest');
      return;
    }
    
    setIsHarvesting(true);
    const rewardAmount = userPosition.earnedRewards;
    
    try {
      console.log(`Harvesting and compounding ${rewardAmount} ${farm?.rewardToken} rewards`);
      
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful harvest and compound
      const updatedPosition = {
        ...userPosition,
        earnedRewards: 0,
        compoundedAmount: userPosition.compoundedAmount + (rewardAmount * 0.8), // 80% conversion rate
        lastHarvest: 'Just now',
      };
      setUserPosition(updatedPosition);
      
      alert(`✅ Successfully harvested and compounded ${rewardAmount.toFixed(2)} ${farm?.rewardToken} into DeFindex vault!`);
    } catch (error) {
      alert('❌ Failed to harvest rewards. Please try again.');
      console.error('Harvest error:', error);
    } finally {
      setIsHarvesting(false);
    }
  };

  if (loading || !farm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading farm details...</p>
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
          <div className="flex items-center space-x-4">
            <Link href="/">
              <button 
                className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                onClick={() => console.log('Navigate back to farms')}
              >
                ← Back
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{farm.lpPair} Farm</h1>
              <p className="text-gray-600">Earn {farm.rewardToken} • Auto-compound via {farm.strategy}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{farm.apr}% APR</div>
            <div className="text-sm text-gray-600">+ {farm.strategyApy}% Strategy APY</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Farm Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Farm Overview */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Farm Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">TVL</div>
                  <div className="text-lg font-semibold">{farm.tvl}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Time Left</div>
                  <div className="text-lg font-semibold">{farm.timeLeft}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Strategy</div>
                  <div className="text-lg font-semibold text-purple-600">{farm.strategyApy}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className={`text-lg font-semibold ${farm.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {farm.isActive ? 'Active' : 'Ended'}
                  </div>
                </div>
              </div>
            </div>

            {/* User Position */}
            {userPosition && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Your Position</h2>
                  <button
                    onClick={handleHarvestAndCompound}
                    disabled={isHarvesting || !userPosition || userPosition.earnedRewards <= 0}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isHarvesting ? 'Harvesting...' : 'Harvest & Compound'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Staked</div>
                    <div className="text-lg font-semibold">{userPosition.stakedAmount.toFixed(2)} LP</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Earned Rewards</div>
                    <div className="text-lg font-semibold text-green-600">{userPosition.earnedRewards.toFixed(2)} {farm.rewardToken}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Compounded</div>
                    <div className="text-lg font-semibold text-purple-600">${userPosition.compoundedAmount.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Last Harvest</div>
                    <div className="text-sm font-medium">{userPosition.lastHarvest}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={handleClaimRewards}
                    disabled={isClaiming || !userPosition || userPosition.earnedRewards <= 0}
                    className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isClaiming ? 'Claiming...' : `Claim ${userPosition.earnedRewards.toFixed(2)} ${farm.rewardToken}`}
                  </button>
                </div>
              </div>
            )}

            {/* Performance Chart Placeholder */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Performance</h2>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-lg font-medium">Performance Chart</div>
                  <div className="text-sm">TVL & APR over time</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stake/Unstake Panel */}
          <div className="space-y-6">
            {/* Stake Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Stake LP Tokens</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Amount</span>
                    <span className="text-gray-600">Balance: {userLpBalance.toFixed(2)} LP</span>
                  </div>
                  <div className="flex">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 p-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        setStakeAmount(userLpBalance.toString());
                        console.log(`Set stake amount to max: ${userLpBalance}`);
                      }}
                      className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 transition-colors"
                    >
                      Max
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleStake}
                  disabled={!stakeAmount || parseFloat(stakeAmount) > userLpBalance || isStaking}
                  className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isStaking ? 'Staking...' : 'Stake LP Tokens'}
                </button>
              </div>
            </div>

            {/* Unstake Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Unstake LP Tokens</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Amount</span>
                    <span className="text-gray-600">
                      Staked: {userPosition?.stakedAmount.toFixed(2) || '0.00'} LP
                    </span>
                  </div>
                  <div className="flex">
                    <input
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      placeholder="0.0"
                      className="flex-1 p-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => {
                        const maxAmount = userPosition?.stakedAmount.toString() || '0';
                        setUnstakeAmount(maxAmount);
                        console.log(`Set unstake amount to max: ${maxAmount}`);
                      }}
                      className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 transition-colors"
                    >
                      Max
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleUnstake}
                  disabled={!unstakeAmount || parseFloat(unstakeAmount) > (userPosition?.stakedAmount || 0) || isUnstaking}
                  className="w-full py-3 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isUnstaking ? 'Unstaking...' : 'Unstake & Claim'}
                </button>
              </div>
            </div>

            {/* Strategy Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">DeFindex Strategy</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Strategy</span>
                  <span className="font-medium">{farm.strategy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">APY</span>
                  <span className="font-medium text-purple-600">{farm.strategyApy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auto-Compound</span>
                  <span className="font-medium text-green-600">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
