/**
 * Scheduler Service
 * 定时任务调度服务
 */

import type { ScheduleConfig, ScheduledTask, ScheduleExecution } from '../types';

const SCHEDULED_TASKS_KEY = 'grok_scheduled_tasks';
const SCHEDULE_EXECUTIONS_KEY = 'grok_schedule_executions';

/**
 * 获取所有定时任务
 */
export function getScheduledTasks(): ScheduledTask[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(SCHEDULED_TASKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load scheduled tasks:', error);
    return [];
  }
}

/**
 * 保存定时任务
 */
export function saveScheduledTask(task: ScheduledTask): void {
  if (typeof window === 'undefined') return;

  try {
    const tasks = getScheduledTasks();
    const index = tasks.findIndex((t) => t.id === task.id);

    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }

    localStorage.setItem(SCHEDULED_TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save scheduled task:', error);
  }
}

/**
 * 删除定时任务
 */
export function deleteScheduledTask(taskId: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const tasks = getScheduledTasks();
    const filtered = tasks.filter((t) => t.id !== taskId);

    if (filtered.length === tasks.length) return false;

    localStorage.setItem(SCHEDULED_TASKS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete scheduled task:', error);
    return false;
  }
}

/**
 * 为任务创建定时配置
 */
export function scheduleTask(
  taskId: string,
  config: Omit<ScheduleConfig, 'nextRun' | 'lastRun' | 'runCount'>
): ScheduledTask {
  const scheduledTask: ScheduledTask = {
    id: `schedule-${taskId}`,
    taskId,
    enabled: true,
    ...config,
    nextRun: calculateNextRun(config.cron),
    runCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveScheduledTask(scheduledTask);

  // 如果浏览器支持 Service Worker，注册定时任务
  if ('serviceWorker' in navigator) {
    registerTaskWithServiceWorker(scheduledTask);
  }

  return scheduledTask;
}

/**
 * 更新定时任务
 */
export function updateScheduledTask(
  scheduleId: string,
  updates: Partial<ScheduleConfig>
): ScheduledTask | undefined {
  const tasks = getScheduledTasks();
  const index = tasks.findIndex((t) => t.id === scheduleId);

  if (index === -1) return undefined;

  const updated = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // 如果更新了 cron，重新计算下次执行时间
  if (updates.cron) {
    updated.nextRun = calculateNextRun(updates.cron);
  }

  tasks[index] = updated;
  localStorage.setItem(SCHEDULED_TASKS_KEY, JSON.stringify(tasks));

  return updated;
}

/**
 * 启用/禁用定时任务
 */
export function toggleScheduledTask(scheduleId: string, enabled: boolean): boolean {
  const task = getScheduledTasks().find((t) => t.id === scheduleId);
  if (!task) return false;

  task.enabled = enabled;
  task.updatedAt = new Date().toISOString();

  saveScheduledTask(task);

  if (enabled) {
    registerTaskWithServiceWorker(task);
  } else {
    unregisterTaskWithServiceWorker(task);
  }

  return true;
}

/**
 * 检查并执行到期的定时任务
 */
export async function checkAndExecuteDueTasks(
  executeCallback: (taskId: string) => Promise<{ success: boolean; result?: string; error?: string }>
): Promise<ScheduleExecution[]> {
  const executions: ScheduleExecution[] = [];
  const now = new Date();
  const tasks = getScheduledTasks().filter((t) => t.enabled && t.nextRun && new Date(t.nextRun) <= now);

  for (const task of tasks) {
    try {
      // 检查执行次数限制
      if (task.maxRuns && task.runCount >= task.maxRuns) {
        task.enabled = false;
        saveScheduledTask(task);
        continue;
      }

      // 执行任务
      const result = await executeCallback(task.taskId);

      // 记录执行
      const execution: ScheduleExecution = {
        id: `exec-${Date.now()}-${task.id}`,
        scheduleId: task.id,
        taskId: task.taskId,
        executedAt: new Date().toISOString(),
        status: result.success ? 'success' : 'failed',
        result: result.result,
        error: result.error,
      };

      executions.push(execution);
      saveScheduleExecution(execution);

      // 更新定时任务
      task.lastRun = execution.executedAt;
      task.runCount = (task.runCount || 0) + 1;
      task.nextRun = calculateNextRun(task.cron);
      task.updatedAt = new Date().toISOString();

      saveScheduledTask(task);
    } catch (error: any) {
      console.error(`Failed to execute scheduled task ${task.id}:`, error);
    }
  }

  return executions;
}

/**
 * 保存执行记录
 */
function saveScheduleExecution(execution: ScheduleExecution): void {
  if (typeof window === 'undefined') return;

  try {
    const executions = getScheduleExecutions();
    executions.push(execution);

    // 只保留最近 100 条
    if (executions.length > 100) {
      executions.sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime());
      executions.splice(100);
    }

    localStorage.setItem(SCHEDULE_EXECUTIONS_KEY, JSON.stringify(executions));
  } catch (error) {
    console.error('Failed to save schedule execution:', error);
  }
}

/**
 * 获取执行记录
 */
export function getScheduleExecutions(): ScheduleExecution[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(SCHEDULE_EXECUTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load schedule executions:', error);
    return [];
  }
}

/**
 * 获取任务的定时执行历史
 */
export function getScheduleTaskHistory(scheduleId: string): ScheduleExecution[] {
  return getScheduleExecutions()
    .filter((exec) => exec.scheduleId === scheduleId)
    .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime());
}

// ============ Service Worker 集成 ============

/**
 * 向 Service Worker 注册定时任务
 */
function registerTaskWithServiceWorker(task: ScheduledTask): void {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage({
      type: 'SCHEDULE_REGISTER',
      payload: {
        taskId: task.taskId,
        scheduleId: task.id,
        cron: task.cron,
        nextRun: task.nextRun,
      },
    });
  }).catch((error) => {
    console.error('Failed to register task with Service Worker:', error);
  });
}

/**
 * 从 Service Worker 注销定时任务
 */
function unregisterTaskWithServiceWorker(task: ScheduledTask): void {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage({
      type: 'SCHEDULE_UNREGISTER',
      payload: {
        scheduleId: task.id,
      },
    });
  }).catch((error) => {
    console.error('Failed to unregister task with Service Worker:', error);
  });
}

// ============ Cron 表达式解析 ============

/**
 * 计算下次执行时间（简化版 Cron 解析）
 */
function calculateNextRun(cron: string): string {
  // 简化版 Cron 解析，支持基本格式：
  // - "* * * * *" (每分钟)
  // - "0 * * * *" (每小时)
  // - "0 8 * * *" (每天 8 点)
  // - "0 8,20 * * *" (每天 8 点和 20 点)
  // - "0 8 * * 1" (每周一 8 点)

  const parts = cron.split(' ');
  if (parts.length !== 5) {
    // 无效的 Cron 表达式，默认 1 小时后
    return new Date(Date.now() + 60 * 60 * 1000).toISOString();
  }

  const [minute, hour, day, month, weekday] = parts;

  const now = new Date();
  const next = new Date(now);

  // 分钟
  if (minute !== '*') {
    const minutes = minute.split(',').map(Number);
    const currentMinute = now.getMinutes();
    const nextMinute = minutes.find((m) => m > currentMinute) || minutes[0];

    if (nextMinute <= currentMinute) {
      next.setHours(next.getHours() + 1);
    }
    next.setMinutes(nextMinute);
  } else {
    next.setMinutes(next.getMinutes() + 1);
  }

  // 小时
  if (hour !== '*') {
    const hours = hour.split(',').map(Number);
    const currentHour = now.getHours();
    const nextHour = hours.find((h) => h > currentHour) || hours[0];

    if (nextHour <= currentHour) {
      next.setDate(next.getDate() + 1);
    }
    next.setHours(nextHour);
  }

  next.setSeconds(0);
  next.setMilliseconds(0);

  return next.toISOString();
}

/**
 * 验证 Cron 表达式
 */
export function isValidCron(cron: string): boolean {
  const parts = cron.split(' ');
  if (parts.length !== 5) return false;

  // 简单验证：每部分应该是 * 或数字/数字列表
  const validPart = (part: string) => part === '*' || /^\d+(,\d+)*$/.test(part);

  return parts.every(validPart);
}
