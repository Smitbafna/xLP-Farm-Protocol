'use client';
import React, { useState, useEffect } from 'react';
import MyCustomComponent from '../../components/FLoatingDock';
import { ChevronRight, Wallet, ArrowLeftRight, Gift, Star, Clock, Check, AlertCircle, ExternalLink, Zap, Shield } from 'lucide-react';
import { CrossChainReward, RewardStorage } from '../../lib/rewardStorage';

export default function RewardVaultUI() {
  const [selectedTab, setSelectedTab] = useState<'claimable' | 'pending' | 'claimed'>('claimable');
  const [selectedReward, setSelectedReward] = useState<CrossChainReward | null>(null);
  const [userChain, setUserChain] = useState('ethereum');
  const [bridgingStatus, setBridgingStatus] = useState('idle');
  const [claimingReward, setClaimingReward] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [rewards, setRewards] = useState<{
    claimable: CrossChainReward[];
    pending: CrossChainReward[];
    claimed: CrossChainReward[];
  }>({
    claimable: [],
    pending: [],
    claimed: []
  });

  useEffect(() => {
    // Load rewards from localStorage
    const loadRewards = () => {
      try {
        const claimable = RewardStorage.getRewardsByStatus('claimable');
        const pending = RewardStorage.getRewardsByStatus('pending');
        const claimed = RewardStorage.getRewardsByStatus('claimed');
        
        setRewards({ claimable, pending, claimed });
      } catch (error) {
        console.error('Error loading rewards:', error);
      }
    };

    loadRewards();
  }, []);

  const handleClaimReward = async (rewardId: number) => {
    setClaimingReward(rewardId);
    setBridgingStatus('bridging');
    
    try {
      // Mock bridging delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update reward status to claimed
      const updatedReward = RewardStorage.updateRewardStatus(
        rewardId, 
        'claimed', 
        `0x${Math.random().toString(16).substring(2, 18)}...${Math.random().toString(16).substring(2, 8)}`
      );
      
      if (updatedReward) {
        // Refresh rewards data
        const claimable = RewardStorage.getRewardsByStatus('claimable');
        const pending = RewardStorage.getRewardsByStatus('pending');
        const claimed = RewardStorage.getRewardsByStatus('claimed');
        
        setRewards({ claimable, pending, claimed });
        setBridgingStatus('success');
        
        setTimeout(() => {
          setBridgingStatus('idle');
          setSelectedReward(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      setBridgingStatus('error');
      setTimeout(() => setBridgingStatus('idle'), 3000);
    } finally {
      setClaimingReward(null);
    }
  };

  const handleBridgeReward = async (rewardId: number, targetChain: string) => {
    setBridgingStatus('bridging');
    
    try {
      // Mock bridging delay
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Update reward status to pending
      const updatedReward = RewardStorage.updateRewardStatus(rewardId, 'pending');
      
      if (updatedReward) {
        // Refresh rewards data
        const claimable = RewardStorage.getRewardsByStatus('claimable');
        const pending = RewardStorage.getRewardsByStatus('pending');
        const claimed = RewardStorage.getRewardsByStatus('claimed');
        
        setRewards({ claimable, pending, claimed });
        setBridgingStatus('success');
        
        setTimeout(() => {
          setBridgingStatus('idle');
          setSelectedReward(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error bridging reward:', error);
      setBridgingStatus('error');
      setTimeout(() => setBridgingStatus('idle'), 3000);
    }
  };

  const chains: Record<string, { name: string; color: string; icon: string }> = {
    ethereum: { name: "Ethereum", color: "bg-blue-500", icon: "" },
    polygon: { name: "Polygon", color: "bg-purple-500", icon: "" },
    arbitrum: { name: "Arbitrum", color: "bg-cyan-500", icon: "" },
    optimism: { name: "Optimism", color: "bg-red-500", icon: "" },
    base: { name: "Base", color: "bg-blue-600", icon: "" },
    stellar: { name: "Stellar", color: "bg-black", icon: "" }
  };

  const legacyHandleClaimReward = async (reward: CrossChainReward) => {
    await handleClaimReward(reward.id);
  };

  const getRarityColor = (rarity: string) => {
    switch(rarity) {
      case 'Common': return 'text-gray-400 border-gray-400';
      case 'Rare': return 'text-blue-400 border-blue-400';
      case 'Epic': return 'text-purple-400 border-purple-400';
      case 'Legendary': return 'text-orange-400 border-orange-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-black text-white p-6">
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
          50% { box-shadow: 0 0 30px rgba(249, 115, 22, 0.6); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        .shimmer-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.3), transparent);
          animation: shimmer 2s infinite;
        }
        .float-animation {
          animation: float 4s ease-in-out infinite;
        }
        .gradient-text {
          background: linear-gradient(-45deg, #f97316, #f59e0b, #fb923c, #f97316);
          background-size: 400% 400%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
<MyCustomComponent/>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        
        <div className="mb-8">
          <div className="flex  items-center justify-between mb-6">

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-4 py-2 border border-orange-500/20">
                <Wallet className="w-5 h-5 text-orange-400" />
                <span className="text-sm">Connected to</span>
                <div className={`w-3 h-3 rounded-full ${chains[userChain]?.color || 'bg-gray-500'}`}></div>
                <span className="text-orange-400 font-semibold">{chains[userChain]?.name || 'Unknown Chain'}</span>
              </div>
            </div>
          </div>

          {/* Chain Selector */}
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-gray-400">Switch Chain:</span>
            <div className="flex space-x-2">
              {Object.entries(chains).map(([chainId, chain]) => (
                <button
                  key={chainId}
                  onClick={() => setUserChain(chainId)}
                  className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                    userChain === chainId 
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400' 
                      : 'bg-gray-800/50 border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <span className="font-bold mr-2">{chain.icon}</span>
                  {chain.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 mb-8 border-b border-gray-700">
          {[
            { id: 'claimable' as const, label: 'Claimable', count: rewards.claimable.length, icon: Gift },
            { id: 'pending' as const, label: 'Pending', count: rewards.pending.length, icon: Clock },
            { id: 'claimed' as const, label: 'Claimed', count: rewards.claimed.length, icon: Check }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-all duration-200 ${
                selectedTab === tab.id
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-semibold">{tab.label}</span>
              <span className="bg-gray-700 text-xs px-2 py-1 rounded-full">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards[selectedTab].map((reward) => (
            <div
              key={reward.id}
              className={`relative bg-gray-900/50 rounded-2xl border border-gray-700 overflow-hidden transition-all duration-300 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 ${
                selectedTab === 'claimable' ? 'hover:scale-105 float-animation' : ''
              }`}
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{reward.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{reward.name}</h3>
                      <p className="text-sm text-gray-400">{reward.description}</p>
                    </div>
                  </div>
                  {reward.rarity && (
                    <div className={`px-2 py-1 rounded-lg border text-xs font-semibold ${getRarityColor(reward.rarity)}`}>
                      {reward.rarity}
                    </div>
                  )}
                </div>

                {/* Value and Chain */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-orange-400">{reward.value}</div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${chains[reward.chain]?.color}`}></div>
                    <span className="text-sm text-gray-400">{reward.chainName}</span>
                  </div>
                </div>

                {/* Partner and Requirements */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Partner:</span>
                    <span className="text-orange-400">{reward.partner}</span>
                  </div>
                  {reward.requirements && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Requirements:</span>
                      <span className="text-green-400">{reward.requirements}</span>
                    </div>
                  )}
                </div>

                {/* Expiry or Claim Date */}
                {reward.expiresIn && (
                  <div className="flex items-center space-x-2 text-yellow-400 text-sm mb-4">
                    <Clock className="w-4 h-4" />
                    <span>Expires in {reward.expiresIn}</span>
                  </div>
                )}
                
                {reward.claimedAt && (
                  <div className="flex items-center space-x-2 text-green-400 text-sm mb-4">
                    <Check className="w-4 h-4" />
                    <span>Claimed on {reward.claimedAt}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                {selectedTab === 'claimable' && (
                  <button
                    onClick={() => handleClaimReward(reward.id)}
                    disabled={claimingReward === reward.id}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      claimingReward === reward.id
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : reward.chain === userChain
                          ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:from-orange-700 hover:to-amber-700 shimmer-effect'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shimmer-effect'
                    }`}
                  >
                    {claimingReward === reward.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>
                          {bridgingStatus === 'claiming' ? 'Claiming...' : 
                           bridgingStatus === 'bridging' ? 'Bridging...' : 
                           'Completing...'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        {reward.chain === userChain ? (
                          <>
                            <Gift className="w-4 h-4" />
                            <span>Claim Reward</span>
                          </>
                        ) : (
                          <>
                            <ArrowLeftRight className="w-4 h-4" />
                            <span>Claim & Bridge</span>
                          </>
                        )}
                      </div>
                    )}
                  </button>
                )}

                {selectedTab === 'claimed' && reward.bridgingTx && (
                  <button className="w-full py-3 px-4 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all duration-200 flex items-center justify-center space-x-2">
                    <ExternalLink className="w-4 h-4" />
                    <span>View Transaction</span>
                  </button>
                )}
              </div>

              {/* Cross-chain indicator */}
              {selectedTab === 'claimable' && reward.chain !== userChain && (
                <div className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1">
                  <ArrowLeftRight className="w-3 h-3" />
                  <span>Cross-chain</span>
                </div>
              )}

              {/* USDC CCTP indicator */}
              {reward.type === 'USDC' && (
                <div className="absolute bottom-4 right-4 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>CCTP</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bridge Status Modal */}
        {bridgingStatus !== 'idle' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 border border-orange-500/20">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  {bridgingStatus === 'completed' ? (
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold mb-2">
                  {bridgingStatus === 'claiming' ? 'Claiming Reward...' :
                   bridgingStatus === 'bridging' ? 'Bridging Assets...' :
                   'Transaction Complete!'}
                </h3>
                
                <p className="text-gray-400 mb-4">
                  {bridgingStatus === 'claiming' ? 'Processing your reward claim on the source chain' :
                   bridgingStatus === 'bridging' ? `Moving your reward from ${selectedReward?.chain ? chains[selectedReward.chain]?.name : 'source'} to ${chains[userChain]?.name}` :
                   'Your reward has been successfully claimed and bridged!'}
                </p>

                {bridgingStatus === 'bridging' && (
                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Powered by</span>
                      <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 font-semibold">LI.FI Protocol</span>
                      </div>
                    </div>
                  </div>
                )}

                {bridgingStatus === 'completed' && (
                  <button
                    onClick={() => setBridgingStatus('idle')}
                    className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 transition-all duration-200"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-400">
          <p className="mb-2">Powered by LI.FI Protocol for seamless cross-chain bridging</p>
          <p className="text-sm">USDC rewards use Circle CCTP for native, trustless transfers</p>
        </div>
      </div>
    </div>
  );
}