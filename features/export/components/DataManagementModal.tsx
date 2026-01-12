/**
 * Data Management Modal Component
 * 数据管理模态框组件（导出/导入）
 */

import React, { useState, useCallback } from 'react';
import { X, Download, Upload, FileJson, FileSpreadsheet, FileText, Mail } from 'lucide-react';
import { exportData, exportAsFormat, downloadExportFile, importData } from '../api/exportApi';
import type { ExportFormat } from '../types';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FORMAT_OPTIONS = [
  { value: 'json' as ExportFormat, label: 'JSON', icon: FileJson, description: '完整数据格式，支持重新导入' },
  { value: 'csv' as ExportFormat, label: 'CSV', icon: FileSpreadsheet, description: '表格格式，适合 Excel 分析' },
  { value: 'markdown' as ExportFormat, label: 'Markdown', icon: FileText, description: '文档格式，适合阅读和分享' },
];

export const DataManagementModal: React.FC<DataManagementModalProps> = ({ isOpen, onClose }) => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [includeHistory, setIncludeHistory] = useState(true);
  const [includeApiConfig, setIncludeApiConfig] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; imported: number; errors: string[] } | null>(null);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const data = await exportData({
        format: exportFormat,
        includeHistory,
        includeApiConfig,
      });

      const content = await exportAsFormat(data, exportFormat);
      const filename = `grok-tasks-export-${new Date().toISOString().split('T')[0]}.${exportFormat}`;

      if (typeof content === 'string') {
        downloadExportFile(content, filename);
      } else {
        downloadExportFile(content, filename);
      }
    } catch (error: any) {
      console.error('Export failed:', error);
      alert('导出失败: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  }, [exportFormat, includeHistory, includeApiConfig]);

  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const content = await file.text();
      const result = importData(content);
      setImportResult(result);

      if (result.success) {
        setTimeout(() => {
          window.location.reload(); // 刷新页面以显示导入的数据
        }, 1500);
      }
    } catch (error: any) {
      console.error('Import failed:', error);
      setImportResult({
        success: false,
        imported: 0,
        errors: [error.message],
      });
    } finally {
      setIsImporting(false);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">数据管理</h2>
                <p className="text-sm text-gray-400">导出或导入你的任务数据</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors" aria-label="关闭">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Download className="w-5 h-5" />
              导出数据
            </h3>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">导出格式</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {FORMAT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = exportFormat === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setExportFormat(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-blue-500' : 'text-gray-500'}`} />
                      <div className="font-semibold text-white">{option.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{option.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900/70 transition-colors">
                <input
                  type="checkbox"
                  checked={includeHistory}
                  onChange={(e) => setIncludeHistory(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                />
                <span className="text-sm text-gray-300">包含执行历史</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900/70 transition-colors">
                <input
                  type="checkbox"
                  checked={includeApiConfig}
                  onChange={(e) => setIncludeApiConfig(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                />
                <span className="text-sm text-gray-300">包含 API 配置</span>
              </label>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>导出中...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>导出数据</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700" />

          {/* Import Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Upload className="w-5 h-5" />
              导入数据
            </h3>

            <p className="text-sm text-gray-400">
              选择之前导出的 JSON 文件以恢复任务数据。导入将会添加到现有任务中，不会覆盖。
            </p>

            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="hidden"
              />
              <button
                disabled={isImporting}
                className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>导入中...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>选择文件导入</span>
                  </>
                )}
              </button>
            </label>

            {/* Import Result */}
            {importResult && (
              <div
                className={`p-4 rounded-xl ${
                  importResult.success
                    ? 'bg-green-500/10 border border-green-500/30'
                    : 'bg-red-500/10 border border-red-500/30'
                }`}
              >
                {importResult.success ? (
                  <div className="text-green-400">
                    <p className="font-semibold">✅ 导入成功！</p>
                    <p className="text-sm mt-1">已导入 {importResult.imported} 个任务</p>
                  </div>
                ) : (
                  <div className="text-red-400">
                    <p className="font-semibold">❌ 导入失败</p>
                    {importResult.errors.length > 0 && (
                      <ul className="text-sm mt-1 space-y-1">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataManagementModal;
