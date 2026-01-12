/**
 * Notification Types
 * 通知系统的类型定义
 */

export type NotificationChannel = 'email' | 'browser' | 'both';

export interface EmailConfig {
  enabled: boolean;
  recipient: string;
  /** 发送频率: immediate, daily, weekly */
  frequency: 'immediate' | 'daily' | 'weekly';
  /** 每日汇总时间 (HH:mm) */
  dailyTime?: string;
  /** 每周汇总时间 (day:HH:mm) */
  weeklyTime?: string;
}

export interface BrowserNotificationConfig {
  enabled: boolean;
  /** 通知权限状态 */
  permission: NotificationPermission;
}

export interface NotificationConfig {
  channels: NotificationChannel;
  email: EmailConfig;
  browser: BrowserNotificationConfig;
}

export interface NotificationQueue {
  taskId: string;
  taskName: string;
  result: string;
  timestamp: string;
  sent: boolean;
}

export interface EmailService {
  send: (to: string, subject: string, body: string) => Promise<boolean>;
}
