/**
 * Notification Settings Modal Component
 * 通知设置模态框组件
 */

import React, { useState, useCallback, useEffect } from 'react';
import { X, Bell, Mail, Check, AlertCircle } from 'lucide-react';
import {
  getNotificationConfig,
  saveNotificationConfig,
  requestBrowserNotificationPermission,
} from '../api/notificationService';
import type { NotificationChannel } from '../types';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ isOpen, onClose }) => {
  const [channel, setChannel] = useState<NotificationChannel>('browser');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailFrequency, setEmailFrequency] = useState<'immediate' | 'daily' | 'weekly'>('immediate');
  const [browserEnabled, setBrowserEnabled] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // 加载配置
  useEffect(() => {
    if (isOpen) {
      const config = getNotificationConfig();
      setChannel(config.channels);
      setEmailRecipient(config.email.recipient);
      setEmailFrequency(config.email.frequency);
      setBrowserEnabled(config.browser.enabled);
      setBrowserPermission(config.browser.permission);
    }
  }, [isOpen]);

  const handleRequestPermission = useCallback(async () => {
    setIsRequestingPermission(true);
    try {
      const granted = await requestBrowserNotificationPermission();
      setBrowserPermission(granted ? 'granted' : 'denied');
      setBrowserEnabled(granted);
    } catch (error) {
      console.error('Failed to request permission:', error);
    } finally {
      setIsRequestingPermission(false);
    }
  }, []);

  const handleSave = useCallback(() => {
    try {
      const config = {
        channels: channel,
        email: {
          enabled: channel === 'email' || channel === 'both',
          recipient: emailRecipient,
          frequency: emailFrequency,
          dailyTime: '08:00',
          weeklyTime: '1:08:00',
        },
        browser: {
          enabled: browserEnabled,
          permission: browserPermission,
        },
      };

      saveNotificationConfig(config);
      setSaveStatus('success');

      setTimeout(() => {
        setSaveStatus('idle');
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to save notification config:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [channel, emailRecipient, emailFrequency, browserEnabled, browserPermission, onClose]);

  if (!isOpen) return null;

  const canRequestPermission = browserPermission === 'default' || browserPermission === 'prompt';
  const permissionGranted = browserPermission === 'granted';
  const permissionDenied = browserPermission === 'denied';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">通知设置</h2>
                <p className="text-sm text-gray-400">配置任务完成通知方式</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors" aria-label="关闭">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Channel Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">通知渠道</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Browser Only */}
              <button
                onClick={() => setChannel('browser')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  channel === 'browser' ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <Bell className={`w-6 h-6 mb-2 ${channel === 'browser' ? 'text-orange-500' : 'text-gray-500'}`} />
                <div className="font-semibold text-white">浏览器通知</div>
                <div className="text-xs text-gray-400 mt-1">在浏览器中接收通知</div>
              </button>

              {/* Email Only */}
              <button
                onClick={() => setChannel('email')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  channel === 'email' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <Mail className={`w-6 h-6 mb-2 ${channel === 'email' ? 'text-blue-500' : 'text-gray-500'}`} />
                <div className="font-semibold text-white">邮件通知</div>
                <div className="text-xs text-gray-400 mt-1">发送到邮箱</div>
              </button>

              {/* Both */}
              <button
                onClick={() => setChannel('both')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  channel === 'both' ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-1 mb-2">
                  <Bell className={`w-6 h-6 ${channel === 'both' ? 'text-purple-500' : 'text-gray-500'}`} />
                  <Mail className={`w-6 h-6 ${channel === 'both' ? 'text-purple-500' : 'text-gray-500'}`} />
                </div>
                <div className="font-semibold text-white">两者都</div>
                <div className="text-xs text-gray-400 mt-1">同时接收两种通知</div>
              </button>
            </div>
          </div>

          {/* Browser Notification Settings */}
          {(channel === 'browser' || channel === 'both') && (
            <div className="space-y-3 p-4 bg-gray-900/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">浏览器通知</h4>
                  <p className="text-xs text-gray-400">需要授权才能接收通知</p>
                </div>

                {permissionGranted ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                    <Check className="w-4 h-4" />
                    <span>已授权</span>
                  </div>
                ) : permissionDenied ? (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>已拒绝</span>
                  </div>
                ) : (
                  <button
                    onClick={handleRequestPermission}
                    disabled={isRequestingPermission}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRequestingPermission ? '请求中...' : '请求权限'}
                  </button>
                )}
              </div>

              {permissionGranted && (
                <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                  <span className="text-sm text-gray-300">启用浏览器通知</span>
                  <input
                    type="checkbox"
                    checked={browserEnabled}
                    onChange={(e) => setBrowserEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-800"
                  />
                </label>
              )}
            </div>
          )}

          {/* Email Notification Settings */}
          {(channel === 'email' || channel === 'both') && (
            <div className="space-y-3 p-4 bg-gray-900/50 rounded-xl">
              <h4 className="font-semibold text-white mb-3">邮件通知</h4>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">接收邮箱</label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">发送频率</label>
                <select
                  value={emailFrequency}
                  onChange={(e) => setEmailFrequency(e.target.value as any)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="immediate">立即发送（任务完成后）</option>
                  <option value="daily">每日汇总（每天 8:00）</option>
                  <option value="weekly">每周汇总（周一 8:00）</option>
                </select>
              </div>

              {/* Note */}
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-300">
                  邮件通知功能需要配置邮件服务（如 EmailJS 或 Resend）。当前为演示模式，通知将显示在控制台。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 rounded-b-2xl">
          {saveStatus === 'success' && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400">
              <Check className="w-5 h-5" />
              <span>设置已保存！</span>
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>保存失败，请重试</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
            >
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;
