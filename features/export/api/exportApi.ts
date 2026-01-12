/**
 * Data Export API
 * 数据导出功能的 API 层
 */

import { getTasks, getTaskExecutions, getApiConfig } from '@/lib/clientStorage';
import type { ExportData, ExportOptions, ExportFormat, ImportResult } from '../types';

/**
 * 导出数据
 */
export async function exportData(options: ExportOptions): Promise<ExportData> {
  const tasks = getTasks();
  const executions: any[] = [];
  const apiConfig = options.includeApiConfig ? getApiConfig() : undefined;

  // 收集执行历史
  if (options.includeHistory) {
    for (const task of tasks) {
      const taskExecs = getTaskExecutions(task.id);

      // 应用日期过滤
      let filteredExecs = taskExecs;
      if (options.dateRange) {
        const start = new Date(options.dateRange.start).getTime();
        const end = new Date(options.dateRange.end).getTime();
        filteredExecs = taskExecs.filter(
          (exec) => {
            const execTime = new Date(exec.executedAt).getTime();
            return execTime >= start && execTime <= end;
          }
        );
      }

      executions.push(...filteredExecs);
    }
  }

  // 构建导出数据
  const exportData: ExportData = {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    tasks,
    executions: options.includeHistory ? executions : undefined,
    apiConfig,
    metadata: {
      totalTasks: tasks.length,
      totalExecutions: executions.length,
      dateRange: options.dateRange
        ? `${options.dateRange.start} 至 ${options.dateRange.end}`
        : undefined,
    },
  };

  return exportData;
}

/**
 * 导出为指定格式
 */
export async function exportAsFormat(
  data: ExportData,
  format: ExportFormat
): Promise<string | Blob> {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);

    case 'csv':
      return exportToCSV(data);

    case 'markdown':
      return exportToMarkdown(data);

    case 'pdf':
      // PDF 导出需要额外的库支持（如 jsPDF）
      // 这里先返回提示信息
      return 'PDF export requires additional library (jsPDF). Please use JSON/CSV/Markdown format.';

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * 导出为 CSV
 */
function exportToCSV(data: ExportData): string {
  const lines: string[] = [];

  // 任务 CSV
  lines.push('# Tasks');
  lines.push('ID,Name,Description,Status,Created At,Updated At');

  for (const task of data.tasks) {
    lines.push(
      [
        task.id,
        `"${task.name}"`,
        `"${task.description || ''}"`,
        task.status,
        task.createdAt,
        task.updatedAt,
      ].join(',')
    );
  }

  lines.push('');

  // 执行历史 CSV
  if (data.executions && data.executions.length > 0) {
    lines.push('# Executions');
    lines.push('ID,Task ID,Status,Executed At,Result,Error');

    for (const exec of data.executions) {
      lines.push(
        [
          exec.id,
          exec.taskId,
          exec.status,
          exec.executedAt,
          `"${(exec.result || '').replace(/"/g, '""')}"`,
          `"${(exec.error || '').replace(/"/g, '""')}"`,
        ].join(',')
      );
    }
  }

  return lines.join('\n');
}

/**
 * 导出为 Markdown
 */
function exportToMarkdown(data: ExportData): string {
  const lines: string[] = [];

  lines.push('# Grok Tasks Export');
  lines.push('');
  lines.push(`**导出时间**: ${new Date(data.exportedAt).toLocaleString('zh-CN')}`);
  lines.push(`**版本**: ${data.version}`);
  lines.push('');

  // 任务列表
  lines.push('## 📋 任务列表');
  lines.push('');

  if (data.tasks.length === 0) {
    lines.push('*暂无任务*');
  } else {
    for (const task of data.tasks) {
      lines.push(`### ${task.name}`);
      lines.push('');
      lines.push(`- **ID**: ${task.id}`);
      lines.push(`- **描述**: ${task.description || '无'}`);
      lines.push(`- **状态**: ${getStatusEmoji(task.status)} ${task.status}`);
      lines.push(`- **创建时间**: ${new Date(task.createdAt).toLocaleString('zh-CN')}`);
      lines.push(`- **更新时间**: ${new Date(task.updatedAt).toLocaleString('zh-CN')}`);
      lines.push('');
      lines.push('**提示词**:');
      lines.push('```');
      lines.push(task.prompt);
      lines.push('```');
      lines.push('');
    }
  }

  // 执行历史
  if (data.executions && data.executions.length > 0) {
    lines.push('## 📜 执行历史');
    lines.push('');

    for (const exec of data.executions.slice(0, 10)) {
      // 只显示最近 10 条
      const task = data.tasks.find((t) => t.id === exec.taskId);
      lines.push(`### ${task?.name || '未知任务'} - ${new Date(exec.executedAt).toLocaleString('zh-CN')}`);
      lines.push('');
      lines.push(`- **状态**: ${exec.status === 'success' ? '✅ 成功' : '❌ 失败'}`);
      if (exec.result) {
        lines.push('');
        lines.push('**结果**:');
        lines.push('```');
        lines.push(exec.result.slice(0, 500)); // 限制长度
        if (exec.result.length > 500) {
          lines.push('...');
        }
        lines.push('```');
      }
      if (exec.error) {
        lines.push('');
        lines.push(`**错误**: ${exec.error}`);
      }
      lines.push('');
    }

    if (data.executions.length > 10) {
      lines.push(`*...还有 ${data.executions.length - 10} 条记录*`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * 导入数据
 */
export function importData(jsonData: string): ImportResult {
  const result: ImportResult = {
    success: false,
    imported: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const data = JSON.parse(jsonData) as ExportData;

    // 验证数据格式
    if (!data.version || !Array.isArray(data.tasks)) {
      result.errors.push('Invalid data format: missing version or tasks');
      return result;
    }

    // 导入任务
    const { createTask } = await import('@/lib/clientStorage');

    for (const task of data.tasks) {
      try {
        createTask({
          name: task.name,
          description: task.description,
          prompt: task.prompt,
          schedule: task.schedule,
          status: task.status,
          templateId: task.templateId,
        });
        result.imported++;
      } catch (error: any) {
        result.skipped++;
        result.errors.push(`Task "${task.name}": ${error.message}`);
      }
    }

    result.success = result.imported > 0;
  } catch (error: any) {
    result.errors.push(`Parse error: ${error.message}`);
  }

  return result;
}

/**
 * 下载导出文件
 */
export function downloadExportFile(content: string | Blob, filename: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============ 辅助函数 ============

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'active':
      return '🟢';
    case 'paused':
      return '⏸️';
    case 'completed':
      return '✅';
    default:
      return '⚪';
  }
}
