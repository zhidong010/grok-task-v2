'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Clock,
  Mail,
  Zap,
  Target,
  Bell,
  Plus,
  Play,
  ChevronDown,
  Check,
  Sparkles,
  Calendar,
  History,
  Settings,
} from 'lucide-react';
import { createTask, getTasks, type Task } from '@/lib/clientStorage';
import { executeTask } from '@/lib/clientGrokClient';

// 执行频率选项
const FREQUENCY_OPTIONS = [
  { id: 'once', label: '单次执行', icon: Play, description: '立即执行一次' },
  { id: 'daily', label: '每天执行', icon: Calendar, description: '每日自动运行' },
  { id: 'weekly', label: '每周执行', icon: Calendar, description: '每周自动运行' },
  { id: 'cron', label: '自定义', icon: Settings, description: 'Cron 表达式' },
];

// 定价方案
const PRICING_PLANS = [
  {
    id: 'free',
    name: '免费版',
    price: '¥0',
    period: '永久免费',
    badge: '',
    originalPrice: '',
    features: [
      '每天 3 次任务执行',
      '每天 3 次 AI 问答',
      '所有任务模板',
      '自定义提示词',
      'AI 提示词优化',
      '任务执行历史',
      '浏览器通知',
      '社区支持',
    ],
    recommended: false,
  },
  {
    id: 'pro-monthly',
    name: 'Pro 专业版',
    price: '¥29',
    period: '/月',
    badge: '🔥 推荐',
    originalPrice: '¥58',
    features: [
      '✨ 无限次任务执行',
      '✨ 无限次 AI 问答',
      '定时任务（Cron）',
      '邮件通知',
      '批量任务执行',
      '任务分享功能',
      '优先处理队列',
      '邮件客服支持',
    ],
    recommended: true,
  },
  {
    id: 'pro-quarterly',
    name: 'Pro 专业版',
    price: '¥78',
    period: '/季',
    badge: '💎 季付优惠',
    originalPrice: '¥174',
    features: [
      '✨ 无限次任务执行',
      '✨ 无限次 AI 问答',
      '定时任务（Cron）',
      '邮件通知',
      '批量任务执行',
      '任务分享功能',
      '优先处理队列',
      '邮件客服支持',
    ],
    recommended: false,
  },
];

// 核心功能展示
const CORE_FEATURES = [
  {
    icon: Clock,
    title: '灵活的时间调度',
    description: '单次、每日、每周、每月执行，支持 Cron 表达式自定义。每天早上 8 点收到热门话题分析，每周一获取行业动态汇总，每月底自动整理技术趋势报告',
  },
  {
    icon: Mail,
    title: '外部通知机制',
    description: '区别于竞品的最大亮点！结果直接发送到邮箱，无需打开应用查看。支持邮件推送、应用内通知、双渠道同时推送，真正实现「设置后就忘掉」的自动化体验',
  },
  {
    icon: Sparkles,
    title: 'X 平台深度整合',
    description: '天然具有 X（原 Twitter）平台的实时数据优势。追踪特定话题标签、监控关键用户发言、分析舆情走向、识别新兴趋势和热点事件',
  },
  {
    icon: Target,
    title: '智能任务模板',
    description: '提供丰富的任务模板，涵盖内容创作、市场营销、研究分析、投资追踪等场景。一键创建，立即使用，快速上手',
  },
  {
    icon: History,
    title: '完整执行历史',
    description: '所有任务执行记录和 AI 生成内容永久保存。支持按时间筛选、关键词搜索、数据导出，方便回顾和分析',
  },
  {
    icon: Zap,
    title: '高级分析能力',
    description: '支持资源密集型的深度分析任务。单任务最长运行 3 分钟，提供更详细的数据洞察和趋势判断',
  },
];

export default function Home() {
  const [taskName, setTaskName] = useState('');
  const [taskPrompt, setTaskPrompt] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('once');
  const [isCreating, setIsCreating] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState(3);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);

  // 模拟配额数据
  useEffect(() => {
    const savedQuota = localStorage.getItem('grok_user_quota');
    if (savedQuota) {
      const quota = JSON.parse(savedQuota);
      setRemainingQuota(quota.limits.dailyTaskExecutions - quota.todayExecutions);
    }
  }, []);

  const handleCreateTask = useCallback(async () => {
    if (!taskName.trim() || !taskPrompt.trim()) {
      alert('请填写任务名称和提示词');
      return;
    }

    setIsCreating(true);
    try {
      // 创建任务
      const newTask = createTask({
        name: taskName,
        description: '自定义任务',
        prompt: taskPrompt,
        schedule: selectedFrequency === 'once' ? '0 * * * *' : '0 8 * * *',
        status: 'active',
      });

      // 如果是单次执行，立即执行
      if (selectedFrequency === 'once') {
        const apiConfig = {
          apiKey: localStorage.getItem('grok_api_key') || '',
          apiBase: localStorage.getItem('grok_api_base') || 'https://apipro.maynor1024.live/v1',
          model: localStorage.getItem('grok_model') || 'grok-4.1-fast',
        };

        if (!apiConfig.apiKey) {
          alert('请先配置 API 设置');
        } else {
          await executeTask(taskPrompt, apiConfig);
        }
      }

      // 重置表单
      setTaskName('');
      setTaskPrompt('');
      setSelectedFrequency('once');

      alert('任务创建成功！');
    } catch (error) {
      console.error('创建任务失败:', error);
      alert('创建任务失败，请重试');
    } finally {
      setIsCreating(false);
    }
  }, [taskName, taskPrompt, selectedFrequency]);

  const handleOptimizePrompt = useCallback(async () => {
    if (!taskPrompt.trim()) {
      alert('请先输入提示词');
      return;
    }

    // 模拟 AI 优化
    const optimizedPrompt = `【优化后的提示词】

${taskPrompt}

---
✨ 优化建议：
1. 添加了明确的输出格式要求
2. 增加了时间范围限制
3. 强化了数据筛选条件
4. 补充了结果呈现方式`;

    setTaskPrompt(optimizedPrompt);
  }, [taskPrompt]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            让 AI 自动帮你追踪热点
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            一觉醒来，所有资讯已整理完毕
          </p>
          <p className="text-lg text-gray-400 mb-8">
            从「你问我答」到「主动汇报」，让信息主动找到你
          </p>

          {/* 核心卖点 */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>每日、每周、每月自动运行</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Mail className="w-5 h-5 text-green-400" />
              <span>邮件通知 + 应用内提醒</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>深度整合 X 平台</span>
            </div>
          </div>
        </div>
      </section>

      {/* 快速创建任务 */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              快速创建任务
            </h2>
            <p className="text-gray-400 text-center mb-6">
              直接在首页创建您的 AI 任务，无需跳转
            </p>

            {/* 配额显示 */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">剩余配额</span>
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  {remainingQuota === Infinity ? '∞' : remainingQuota} 免费次数 + 0 积分
                </span>
              </div>
            </div>

            {/* 任务名称 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                任务名称 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="例如：每日科技新闻汇总"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 执行频率 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                执行频率
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowFrequencyDropdown(!showFrequencyDropdown)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span>{FREQUENCY_OPTIONS.find(f => f.id === selectedFrequency)?.label}</span>
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </button>

                {showFrequencyDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden">
                    {FREQUENCY_OPTIONS.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSelectedFrequency(option.id);
                            setShowFrequencyDropdown(false);
                          }}
                          className="w-full px-4 py-3 hover:bg-gray-700 flex items-center gap-3 text-left transition-colors"
                        >
                          <Icon className="w-5 h-5 text-blue-400" />
                          <div>
                            <div className="text-white font-medium">{option.label}</div>
                            <div className="text-xs text-gray-400">{option.description}</div>
                          </div>
                          {selectedFrequency === option.id && (
                            <Check className="w-5 h-5 text-green-400 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 任务提示词 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                任务提示词 (Prompt) <span className="text-red-400">*</span>
              </label>
              <textarea
                value={taskPrompt}
                onChange={(e) => setTaskPrompt(e.target.value)}
                placeholder="详细描述你想要 AI 执行的任务..."
                rows={6}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="mt-2 text-xs text-gray-400 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span>
                  💡 提示：写得越详细，AI 的输出质量越高。点击「AI 优化」让 Grok 帮你改进提示词。
                </span>
              </p>
            </div>

            {/* AI 优化按钮 */}
            <div className="mb-4">
              <button
                onClick={handleOptimizePrompt}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                AI 优化提示词
              </button>
            </div>

            {/* 创建按钮 */}
            <button
              onClick={handleCreateTask}
              disabled={isCreating || !taskName.trim() || !taskPrompt.trim()}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>创建中...</span>
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>创建任务</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 核心功能展示 */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Grok TaskPro 核心功能
          </h2>
          <p className="text-xl text-gray-400">
            从「对话工具」到「自动化代理」，让 AI 主动为你工作
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {CORE_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-blue-500 transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 定价方案 */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            🎯 简单透明的定价
          </h2>
          <p className="text-xl text-gray-400">
            选择适合您的套餐，随时可以取消
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-gray-800 rounded-2xl p-8 border-2 transition-all relative ${
                plan.recommended
                  ? 'border-purple-500 shadow-2xl shadow-purple-500/20 scale-105'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  {plan.badge}
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {plan.price}
                  </span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                {plan.originalPrice && (
                  <p className="text-sm text-green-400">
                    🎉 早鸟价 5 折
                    {plan.id === 'pro-quarterly' && '，季付再省 10%'}
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full px-6 py-3 rounded-xl font-bold transition-all ${
                  plan.recommended
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {plan.id === 'free' ? '免费开始' : '立即订阅'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-12 border border-blue-500/30">
          <h2 className="text-3xl font-bold text-white mb-4">
            为什么选择 Grok TaskPro？
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div>
              <div className="text-4xl mb-2">🎯</div>
              <h3 className="text-xl font-bold text-white mb-2">主动汇报</h3>
              <p className="text-gray-400">信息找人，而非人找信息</p>
            </div>
            <div>
              <div className="text-4xl mb-2">📧</div>
              <h3 className="text-xl font-bold text-white mb-2">邮件推送</h3>
              <p className="text-gray-400">结果直达邮箱，随时随地查看</p>
            </div>
            <div>
              <div className="text-4xl mb-2">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">效率革命</h3>
              <p className="text-gray-400">让 AI 在你睡觉时工作</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p>© 2025 Grok TaskPro. All rights reserved.</p>
      </footer>
    </div>
  );
}
