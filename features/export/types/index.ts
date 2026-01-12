/**
 * Export Types
 * 数据导出功能的类型定义
 */

export type ExportFormat = 'json' | 'csv' | 'pdf' | 'markdown';

export interface ExportOptions {
  format: ExportFormat;
  /** 是否包含执行历史 */
  includeHistory: boolean;
  /** 是否包含 API 配置 */
  includeApiConfig: boolean;
  /** 日期范围 */
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ExportData {
  version: string;
  exportedAt: string;
  tasks: any[];
  executions?: any[];
  apiConfig?: any;
  metadata: {
    totalTasks: number;
    totalExecutions: number;
    dateRange?: string;
  };
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}
