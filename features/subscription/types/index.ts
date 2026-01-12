/**
 * Subscription Types
 * 订阅和配额系统的类型定义
 */

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface QuotaLimits {
  /** 每日任务执行次数 */
  dailyTaskExecutions: number;
  /** 每日 AI 问答次数 */
  dailyAIQueries: number;
  /** 定时任务 */
  scheduledTasks: boolean;
  /** 邮件通知 */
  emailNotifications: boolean;
  /** 批量任务执行 */
  batchExecution: boolean;
  /** 任务分享 */
  taskSharing: boolean;
  /** 优先处理 */
  priorityQueue: boolean;
  /** 高级分析 */
  advancedAnalytics: boolean;
}

export interface SubscriptionConfig {
  tier: SubscriptionTier;
  /** 订阅开始时间 */
  startDate?: string;
  /** 订阅结束时间 */
  endDate?: string;
  /** 是否为试用 */
  isTrial?: boolean;
}

export interface UserQuota {
  /** 今天的执行次数 */
  todayExecutions: number;
  /** 今天的 AI 问答次数 */
  todayAIQueries: number;
  /** 上次重置时间 */
  lastResetDate: string;
  /** 配额限制 */
  limits: QuotaLimits;
}

export interface UsageRecord {
  date: string;
  taskExecutions: number;
  aiQueries: number;
  tier: SubscriptionTier;
}
