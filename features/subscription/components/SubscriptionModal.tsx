/**
 * Subscription Modal Component
 * 订阅升级模态框组件
 */

import React, { useState, useCallback } from 'react';
import { X, Crown, Check, Zap } from 'lucide-react';
import { getUserQuota, upgradeToPro } from '../api/quotaApi';
import type { SubscriptionTier } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const FEATURES = {
  free: [
    { text: '每天 3 次任务执行', included: true },
    { text: '每天 3 次 AI 问答', included: true },
    { text: '所有任务模板', included: true },
    { text: '自定义提示词', included: true },
    { text: '任务执行历史', included: true },
    { text: '浏览器通知', included: true },
    { text: '定时任务 (Cron)', included: false },
    { text: '邮件通知', included: false },
    { text: '批量任务执行', included: false },
    { text: '任务分享功能', included: false },
    { text: '优先处理队列', included: false },
    { text: '邮件客服支持', included: false },
  ],
  pro: [
    { text: '无限次任务执行', included: true },
    { text: '无限次 AI 问答', included: true },
    { text: '定时任务 (Cron)', included: true },
    { text: '邮件通知', included: true },
    { text: '批量任务执行', included: true },
    { text: '任务分享功能', included: true },
    { text: '优先处理队列', included: true },
    { text: '邮件客服支持', included: true },
  ],
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('free');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const quota = getUserQuota();

  const handleUpgrade = useCallback(async () => {
    if (selectedTier === 'pro') {
      setIsUpgrading(true);
      try {
        upgradeToPro();
        onUpgrade();
        onClose();
      } catch (error) {
        console.error('Upgrade failed:', error);
      } finally {
        setIsUpgrading(false);
      }
    }
  }, [selectedTier, onUpgrade, onClose]);

  if (!isOpen) return null;

  const isFreeSelected = selectedTier === 'free';
  const isProSelected = selectedTier === 'pro';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">升级到 Pro 版</h2>
                <p className="text-sm text-gray-400">解锁所有高级功能</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div
              className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${
                isFreeSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedTier('free')}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">免费版</h3>
                {isFreeSelected && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <span className="text-4xl font-bold text-white">¥0</span>
                <span className="text-gray-400">/永久免费</span>
              </div>

              <ul className="space-y-3">
                {FEATURES.free.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-gray-300' : 'text-gray-600'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Plan */}
            <div
              className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
                isProSelected
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedTier('pro')}
            >
              {/* Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                推荐
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">Pro 专业版</h3>
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                {isProSelected && (
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    ¥58
                  </span>
                  <span className="text-gray-400">/月</span>
                </div>
                <p className="text-xs text-green-400 mt-1">🎉 早鸟价 5 折</p>
              </div>

              <ul className="space-y-3">
                {FEATURES.pro.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">今日使用情况</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">任务执行</span>
                  <span className="text-xs font-semibold text-white">
                    {quota.todayExecutions} / {quota.limits.dailyTaskExecutions === Infinity ? '∞' : quota.limits.dailyTaskExecutions}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all"
                    style={{
                      width: `${Math.min((quota.todayExecutions / (quota.limits.dailyTaskExecutions || 3)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">AI 问答</span>
                  <span className="text-xs font-semibold text-white">
                    {quota.todayAIQueries} / {quota.limits.dailyAIQueries === Infinity ? '∞' : quota.limits.dailyAIQueries}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all"
                    style={{
                      width: `${Math.min((quota.todayAIQueries / (quota.limits.dailyAIQueries || 3)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleUpgrade}
              disabled={selectedTier === 'free' || isUpgrading}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedTier === 'pro'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isUpgrading ? '升级中...' : selectedTier === 'pro' ? '立即升级' : '选择计划'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
