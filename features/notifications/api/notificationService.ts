/**
 * Notification Service
 * 通知服务的实现层
 */

import type {
  NotificationConfig,
  EmailConfig,
  BrowserNotificationConfig,
  NotificationQueue,
} from '../types';

const NOTIFICATION_CONFIG_KEY = 'grok_notification_config';
const NOTIFICATION_QUEUE_KEY = 'grok_notification_queue';

/**
 * 默认通知配置
 */
const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  channels: 'browser',
  email: {
    enabled: false,
    recipient: '',
    frequency: 'immediate',
    dailyTime: '08:00',
    weeklyTime: '1:08:00',
  },
  browser: {
    enabled: false,
    permission: 'default',
  },
};

/**
 * 获取通知配置
 */
export function getNotificationConfig(): NotificationConfig {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_CONFIG;

  try {
    const stored = localStorage.getItem(NOTIFICATION_CONFIG_KEY);
    return stored ? { ...DEFAULT_NOTIFICATION_CONFIG, ...JSON.parse(stored) } : DEFAULT_NOTIFICATION_CONFIG;
  } catch (error) {
    console.error('Failed to load notification config:', error);
    return DEFAULT_NOTIFICATION_CONFIG;
  }
}

/**
 * 保存通知配置
 */
export function saveNotificationConfig(config: NotificationConfig): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(NOTIFICATION_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save notification config:', error);
  }
}

/**
 * 请求浏览器通知权限
 */
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';

    // 更新配置
    const config = getNotificationConfig();
    config.browser.permission = permission;
    config.browser.enabled = granted;
    saveNotificationConfig(config);

    return granted;
  }

  return false;
}

/**
 * 发送浏览器通知
 */
export function sendBrowserNotification(
  title: string,
  body: string,
  options?: NotificationOptions
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  const config = getNotificationConfig();
  if (!config.browser.enabled || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `grok-task-${Date.now()}`,
      requireInteraction: false,
      ...options,
    });

    // 自动关闭（5秒后）
    setTimeout(() => notification.close(), 5000);

    return true;
  } catch (error) {
    console.error('Failed to send browser notification:', error);
    return false;
  }
}

/**
 * 发送任务完成通知
 */
export function sendTaskCompletionNotification(
  taskName: string,
  success: boolean,
  result?: string,
  error?: string
): void {
  const config = getNotificationConfig();

  // 浏览器通知
  if (config.channels === 'browser' || config.channels === 'both') {
    const title = success ? `✅ 任务完成: ${taskName}` : `❌ 任务失败: ${taskName}`;
    const body = success
      ? result?.slice(0, 100) + (result && result.length > 100 ? '...' : '')
      : error || '未知错误';

    sendBrowserNotification(title, body);
  }

  // 邮件通知（添加到队列）
  if (config.channels === 'email' || config.channels === 'both') {
    if (config.email.enabled && config.email.recipient) {
      addNotificationToQueue({
        taskId: '',
        taskName,
        result: success ? result || '成功' : error || '失败',
        timestamp: new Date().toISOString(),
        sent: false,
      });
    }
  }
}

/**
 * 添加通知到队列
 */
function addNotificationToQueue(notification: NotificationQueue): void {
  if (typeof window === 'undefined') return;

  try {
    const queue = getNotificationQueue();
    queue.push(notification);
    localStorage.setItem(NOTIFICATION_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to add notification to queue:', error);
  }
}

/**
 * 获取通知队列
 */
function getNotificationQueue(): NotificationQueue[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(NOTIFICATION_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load notification queue:', error);
    return [];
  }
}

/**
 * 发送邮件通知（使用 EmailJS 或 Resend）
 */
export async function sendEmailNotification(
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  // 注意：这里需要集成邮件服务（EmailJS、Resend 等）
  // 以下是示例代码，实际使用时需要替换为真实的服务

  try {
    // 示例：使用 EmailJS
    // const response = await emailjs.send(
    //   'YOUR_SERVICE_ID',
    //   'YOUR_TEMPLATE_ID',
    //   { to, subject, body },
    //   'YOUR_PUBLIC_KEY'
    // );
    // return response.status === 200;

    // 示例：使用 Resend API
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${RESEND_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'noreply@groktask.app',
    //     to,
    //     subject,
    //     html: body,
    //   }),
    // });
    // return response.ok;

    // 临时实现：仅在控制台输出
    console.log('[Email Notification]', { to, subject, body });
    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}

/**
 * 处理待发送的邮件通知
 */
export async function processPendingEmailNotifications(): Promise<void> {
  const config = getNotificationConfig();
  if (!config.email.enabled || !config.email.recipient) {
    return;
  }

  const queue = getNotificationQueue();
  const pending = queue.filter((n) => !n.sent);

  if (pending.length === 0) {
    return;
  }

  // 根据频率决定如何发送
  switch (config.email.frequency) {
    case 'immediate':
      // 立即发送所有待处理通知
      for (const notification of pending) {
        const success = await sendEmailNotification(
          config.email.recipient,
          `任务完成: ${notification.taskName}`,
          notification.result
        );

        if (success) {
          notification.sent = true;
        }
      }
      break;

    case 'daily':
    case 'weekly':
      // 汇总发送（每日/每周）
      const shouldSend = shouldSendSummary(config.email);
      if (shouldSend) {
        const summary = generateNotificationSummary(pending);
        await sendEmailNotification(
          config.email.recipient,
          `任务执行汇总 (${config.email.frequency})`,
          summary
        );

        // 标记为已发送
        pending.forEach((n) => (n.sent = true));
      }
      break;
  }

  // 更新队列
  const updatedQueue = getNotificationQueue().map((item) => {
    const updated = pending.find((p) => p.taskId === item.taskId && p.timestamp === item.timestamp);
    return updated || item;
  });

  localStorage.setItem(NOTIFICATION_QUEUE_KEY, JSON.stringify(updatedQueue));
}

// ============ 辅助函数 ============

function shouldSendSummary(emailConfig: EmailConfig): boolean {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const day = now.getDay(); // 0 = Sunday, 1 = Monday, ...

  if (emailConfig.frequency === 'daily' && emailConfig.dailyTime) {
    const [h, m] = emailConfig.dailyTime.split(':').map(Number);
    return hour === h && minute === m;
  }

  if (emailConfig.frequency === 'weekly' && emailConfig.weeklyTime) {
    const [d, h, m] = emailConfig.weeklyTime.split(':').map(Number);
    return day === d && hour === h && minute === m;
  }

  return false;
}

function generateNotificationSummary(notifications: NotificationQueue[]): string {
  const success = notifications.filter((n) => n.result.includes('成功') || !n.result.includes('失败')).length;
  const failed = notifications.length - success;

  let html = `
    <h2>Grok Task 任务执行汇总</h2>
    <p><strong>时间</strong>: ${new Date().toLocaleString('zh-CN')}</p>
    <hr>
    <p><strong>总计</strong>: ${notifications.length} 个任务</p>
    <p><strong>成功</strong>: ${success} 个</p>
    <p><strong>失败</strong>: ${failed} 个</p>
    <hr>
    <h3>任务详情</h3>
    <ul>
  `;

  for (const notification of notifications) {
    html += `
      <li>
        <strong>${notification.taskName}</strong>
        <p>${notification.result.slice(0, 200)}...</p>
        <small>${new Date(notification.timestamp).toLocaleString('zh-CN')}</small>
      </li>
    `;
  }

  html += '</ul>';

  return html;
}
