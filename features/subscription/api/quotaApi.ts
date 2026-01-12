/**
 * Quota Management API
 * 配额管理系统的 API 层
 */

import type { UserQuota, QuotaLimits, SubscriptionTier, UsageRecord } from '../types';

const QUOTA_STORAGE_KEY = 'grok_user_quota';
const USAGE_RECORDS_KEY = 'grok_usage_records';

/** 各等级的配额限制 */
const TIER_LIMITS: Record<SubscriptionTier, QuotaLimits> = {
  free: {
    dailyTaskExecutions: 3,
    dailyAIQueries: 3,
    scheduledTasks: false,
    emailNotifications: false,
    batchExecution: false,
    taskSharing: false,
    priorityQueue: false,
    advancedAnalytics: false,
  },
  pro: {
    dailyTaskExecutions: Infinity,
    dailyAIQueries: Infinity,
    scheduledTasks: true,
    emailNotifications: true,
    batchExecution: true,
    taskSharing: true,
    priorityQueue: true,
    advancedAnalytics: true,
  },
  enterprise: {
    dailyTaskExecutions: Infinity,
    dailyAIQueries: Infinity,
    scheduledTasks: true,
    emailNotifications: true,
    batchExecution: true,
    taskSharing: true,
    priorityQueue: true,
    advancedAnalytics: true,
  },
};

/**
 * 获取用户配额信息
 */
export function getUserQuota(): UserQuota {
  if (typeof window === 'undefined') {
    return getDefaultQuota();
  }

  try {
    const stored = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (!stored) {
      const quota = getDefaultQuota();
      saveUserQuota(quota);
      return quota;
    }

    const quota = JSON.parse(stored) as UserQuota;

    // 检查是否需要重置（新的一天）
    if (shouldResetQuota(quota.lastResetDate)) {
      return resetDailyQuota(quota);
    }

    return quota;
  } catch (error) {
    console.error('Failed to load user quota:', error);
    return getDefaultQuota();
  }
}

/**
 * 保存用户配额信息
 */
export function saveUserQuota(quota: UserQuota): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(quota));
  } catch (error) {
    console.error('Failed to save user quota:', error);
  }
}

/**
 * 检查是否可以执行任务
 */
export function canExecuteTask(quota?: UserQuota): { can: boolean; reason?: string } {
  const userQuota = quota || getUserQuota();

  if (userQuota.todayExecutions >= userQuota.limits.dailyTaskExecutions) {
    return {
      can: false,
      reason: `今日执行次数已达上限 (${userQuota.limits.dailyTaskExecutions}次)`,
    };
  }

  return { can: true };
}

/**
 * 记录任务执行
 */
export function recordTaskExecution(): UserQuota {
  const quota = getUserQuota();
  quota.todayExecutions += 1;
  saveUserQuota(quota);
  return quota;
}

/**
 * 记录 AI 查询
 */
export function recordAIQuery(): UserQuota {
  const quota = getUserQuota();
  quota.todayAIQueries += 1;
  saveUserQuota(quota);
  return quota;
}

/**
 * 获取使用记录
 */
export function getUsageRecords(): UsageRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(USAGE_RECORDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load usage records:', error);
    return [];
  }
}

/**
 * 保存使用记录
 */
export function saveUsageRecord(record: UsageRecord): void {
  if (typeof window === 'undefined') return;

  try {
    const records = getUsageRecords();
    const existingIndex = records.findIndex((r) => r.date === record.date);

    if (existingIndex >= 0) {
      // 更新已有记录
      records[existingIndex] = record;
    } else {
      // 添加新记录
      records.push(record);
    }

    // 只保留最近 30 天的记录
    const sortedRecords = records
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30);

    localStorage.setItem(USAGE_RECORDS_KEY, JSON.stringify(sortedRecords));
  } catch (error) {
    console.error('Failed to save usage record:', error);
  }
}

/**
 * 升级到 Pro 版本
 */
export function upgradeToPro(startDate?: string, endDate?: string): void {
  const quota = getUserQuota();
  quota.limits = TIER_LIMITS.pro;
  quota.lastResetDate = new Date().toISOString().split('T')[0];

  if (startDate) quota.startDate = startDate;
  if (endDate) quota.endDate = endDate;

  saveUserQuota(quota);
}

/**
 * 降级到免费版
 */
export function downgradeToFree(): void {
  const quota = getUserQuota();
  quota.limits = TIER_LIMITS.free;
  quota.startDate = undefined;
  quota.endDate = undefined;
  saveUserQuota(quota);
}

// ============ 辅助函数 ============

function getDefaultQuota(): UserQuota {
  return {
    todayExecutions: 0,
    todayAIQueries: 0,
    lastResetDate: new Date().toISOString().split('T')[0],
    limits: TIER_LIMITS.free,
  };
}

function shouldResetQuota(lastResetDate: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return today !== lastResetDate;
}

function resetDailyQuota(quota: UserQuota): UserQuota {
  // 保存昨天的使用记录
  const yesterdayRecord: UsageRecord = {
    date: quota.lastResetDate,
    taskExecutions: quota.todayExecutions,
    aiQueries: quota.todayAIQueries,
    tier: 'free',
  };
  saveUsageRecord(yesterdayRecord);

  // 重置配额
  quota.todayExecutions = 0;
  quota.todayAIQueries = 0;
  quota.lastResetDate = new Date().toISOString().split('T')[0];
  saveUserQuota(quota);

  return quota;
}
