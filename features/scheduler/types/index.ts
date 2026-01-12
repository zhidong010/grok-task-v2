/**
 * Scheduler Types
 * 定时任务调度系统的类型定义
 */

export interface ScheduleConfig {
  /** Cron 表达式 */
  cron: string;
  /** 时区 */
  timezone?: string;
  /** 执行次数限制 */
  maxRuns?: number;
  /** 已执行次数 */
  runCount?: number;
  /** 下次执行时间 */
  nextRun?: string;
  /** 上次执行时间 */
  lastRun?: string;
}

export interface ScheduledTask extends ScheduleConfig {
  id: string;
  taskId: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleExecution {
  id: string;
  scheduleId: string;
  taskId: string;
  executedAt: string;
  status: 'success' | 'failed' | 'skipped';
  result?: string;
  error?: string;
}

export interface ServiceWorkerMessage {
  type: 'SCHEDULE_EXECUTE' | 'SCHEDULE_REGISTER' | 'SCHEDULE_UNREGISTER';
  payload: any;
}
