/**
 * Service Worker for Scheduled Tasks
 * 用于后台定时任务的 Service Worker
 */

const SCHEDULED_TASKS = new Map();

/**
 * 安装 Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

/**
 * 激活 Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating');
  event.waitUntil(self.clients.claim());
});

/**
 * 处理消息
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SCHEDULE_REGISTER':
      registerScheduledTask(payload);
      break;
    case 'SCHEDULE_UNREGISTER':
      unregisterScheduledTask(payload);
      break;
    case 'SCHEDULE_EXECUTE':
      executeScheduledTask(payload);
      break;
    default:
      console.warn('[Service Worker] Unknown message type:', type);
  }
});

/**
 * 注册定时任务
 */
function registerScheduledTask(payload) {
  const { taskId, scheduleId, cron, nextRun } = payload;

  SCHEDULED_TASKS.set(scheduleId, {
    taskId,
    scheduleId,
    cron,
    nextRun,
  });

  console.log('[Service Worker] Registered scheduled task:', scheduleId);

  // 设置定时器
  scheduleNextRun(scheduleId, nextRun);
}

/**
 * 注销定时任务
 */
function unregisterScheduledTask(payload) {
  const { scheduleId } = payload;

  if (SCHEDULED_TASKS.has(scheduleId)) {
    SCHEDULED_TASKS.delete(scheduleId);
    console.log('[Service Worker] Unregistered scheduled task:', scheduleId);
  }
}

/**
 * 安排下次执行
 */
function scheduleNextRun(scheduleId, nextRun) {
  const task = SCHEDULED_TASKS.get(scheduleId);
  if (!task) return;

  const nextRunTime = new Date(nextRun).getTime();
  const now = Date.now();
  const delay = Math.max(0, nextRunTime - now);

  // 清除之前的定时器
  if (task.timerId) {
    clearTimeout(task.timerId);
  }

  // 设置新的定时器
  task.timerId = setTimeout(() => {
    executeScheduledTask({ scheduleId });
  }, delay);

  console.log('[Service Worker] Scheduled task', scheduleId, 'will run in', Math.round(delay / 1000 / 60), 'minutes');
}

/**
 * 执行定时任务
 */
function executeScheduledTask(payload) {
  const { scheduleId } = payload;
  const task = SCHEDULED_TASKS.get(scheduleId);

  if (!task) {
    console.warn('[Service Worker] Task not found:', scheduleId);
    return;
  }

  console.log('[Service Worker] Executing scheduled task:', scheduleId);

  // 通知所有客户端执行任务
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'SCHEDULE_EXECUTE',
        payload: {
          scheduleId,
          taskId: task.taskId,
        },
      });
    });
  });

  // 计算下次执行时间
  const nextRun = calculateNextRun(task.cron);
  task.nextRun = nextRun;

  // 重新安排下次执行
  scheduleNextRun(scheduleId, nextRun);
}

/**
 * 计算下次执行时间（简化版）
 */
function calculateNextRun(cron) {
  const parts = cron.split(' ');
  const [minute, hour] = parts;

  const now = new Date();
  const next = new Date(now);

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
 * 定期检查到期任务（每分钟检查一次）
 */
setInterval(() => {
  const now = Date.now();

  SCHEDULED_TASKS.forEach((task, scheduleId) => {
    if (task.nextRun && new Date(task.nextRun).getTime() <= now) {
      executeScheduledTask({ scheduleId });
    }
  });
}, 60 * 1000); // 每分钟检查一次
