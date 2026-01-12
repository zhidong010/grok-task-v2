# Grok Task v2.0 重大升级指南

## 🎉 升级概述

本次升级将 grok-task 从 v1.1.0 全面升级到 v2.0，参考 https://trygrokai.asia/zh 的设计，新增了以下核心功能：

### ✨ 新增功能

1. **⏰ 定时任务自动化** - 真正的 Cron 定时执行 + Service Worker 后台运行
2. **📧 邮件通知系统** - 支持 EmailJS/Resend，多种发送频率
3. **💎 Pro 订阅系统** - 配额管理、免费版/Pro版区分
4. **📊 数据导出/导入** - JSON/CSV/Markdown 多格式支持
5. **🔔 浏览器通知** - Native Notifications API 集成
6. **📚 增强模板系统** - 12个专业模板，分类管理
7. **🎨 现代化 UI** - 渐变设计、流畅动画、响应式布局

---

## 📁 新增文件结构

```
grok-task/
├── features/                          # 新增：功能模块化架构
│   ├── scheduler/                     # 定时任务调度
│   │   ├── types/index.ts            # 类型定义
│   │   └── api/schedulerService.ts   # 调度服务
│   ├── notifications/                 # 通知系统
│   │   ├── types/index.ts            # 类型定义
│   │   └── api/notificationService.ts
│   │   └── components/NotificationSettingsModal.tsx
│   ├── subscription/                  # 订阅系统
│   │   ├── types/index.ts
│   │   ├── api/quotaApi.ts
│   │   └── components/SubscriptionModal.tsx
│   ├── export/                        # 数据导出
│   │   ├── types/index.ts
│   │   ├── api/exportApi.ts
│   │   └── components/DataManagementModal.tsx
│   └── analytics/                     # 分析功能（预留）
│       └── types/
├── lib/
│   ├── templates.enhanced.ts         # 增强的模板系统
│   └── utils/                         # 工具函数（预留）
├── public/
│   └── serviceworker.js              # Service Worker
└── UPGRADE_GUIDE.md                  # 本文档
```

---

## 🚀 核心功能详解

### 1. 定时任务调度系统

#### 功能特性
- ✅ 真正的 Cron 表达式支持
- ✅ Service Worker 后台执行
- ✅ 浏览器关闭后仍可运行
- ✅ 执行历史追踪
- ✅ 失败重试机制

#### 使用方式

```typescript
import { scheduleTask } from '@/features/scheduler/api/schedulerService';

// 为任务创建定时配置
const scheduledTask = scheduleTask(taskId, {
  cron: '0 8,20 * * *',  // 每天 8 点和 20 点
  maxRuns: 30,           // 最多执行 30 次
});

// 启用/禁用
toggleScheduledTask(scheduleId, true);
```

#### Cron 格式支持
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ 星期几 (0-6, 0=周日)
│ │ │ └─── 月份 (1-12)
│ │ └───── 日期 (1-31)
│ └─────── 小时 (0-23)
└───────── 分钟 (0-59)

示例：
0 8 * * *        每天 8:00
0 8,20 * * *     每天 8:00 和 20:00
0 */2 * * *      每 2 小时
0 9 * * 1        每周一 9:00
```

---

### 2. 通知系统

#### 功能特性
- ✅ 浏览器原生通知
- ✅ 邮件通知（支持 EmailJS/Resend）
- ✅ 多种发送频率（即时/每日/每周）
- ✅ 通知队列管理
- ✅ 失败重试

#### 配置方式

```typescript
import { sendBrowserNotification, sendEmailNotification } from '@/features/notifications/api/notificationService';

// 浏览器通知
sendBrowserNotification('任务完成', '任务 XXX 已成功执行');

// 邮件通知
await sendEmailNotification('user@example.com', '任务执行报告', body);
```

#### 邮件服务集成

**Option 1: EmailJS**
```javascript
// 注册 EmailJS 账号：https://www.emailjs.com/
// 获取 Service ID, Template ID, Public Key
const response = await emailjs.send(
  'YOUR_SERVICE_ID',
  'YOUR_TEMPLATE_ID',
  { to, subject, body },
  'YOUR_PUBLIC_KEY'
);
```

**Option 2: Resend**
```javascript
// 注册 Resend 账号：https://resend.com/
// 获取 API Key
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'noreply@groktask.app',
    to,
    subject,
    html: body,
  }),
});
```

---

### 3. 订阅和配额系统

#### 功能特性
- ✅ 免费版 / Pro 版区分
- ✅ 每日配额限制
- ✅ 使用统计
- ✅ 升级/降级管理

#### 配额对比

| 功能 | 免费版 | Pro 版 |
|------|--------|--------|
| 每日任务执行 | 3次 | ∞ |
| 每日 AI 问答 | 3次 | ∞ |
| 定时任务 | ❌ | ✅ |
| 邮件通知 | ❌ | ✅ |
| 批量执行 | ❌ | ✅ |
| 任务分享 | ❌ | ✅ |
| 优先队列 | ❌ | ✅ |
| 高级分析 | ❌ | ✅ |

#### 使用方式

```typescript
import { getUserQuota, canExecuteTask, recordTaskExecution } from '@/features/subscription/api/quotaApi';

// 检查是否可以执行
const { can, reason } = canExecuteTask();
if (!can) {
  alert(reason);  // "今日执行次数已达上限 (3次)"
  return;
}

// 记录执行
const updatedQuota = recordTaskExecution();
```

---

### 4. 数据导出/导入

#### 功能特性
- ✅ 多格式导出（JSON/CSV/Markdown）
- ✅ 可选包含执行历史
- ✅ 可选包含 API 配置
- ✅ 数据导入验证
- ✅ 错误处理和报告

#### 使用方式

```typescript
import { exportData, exportAsFormat, downloadExportFile, importData } from '@/features/export/api/exportApi';

// 导出数据
const data = await exportData({
  format: 'json',
  includeHistory: true,
  includeApiConfig: false,
});

// 下载文件
const content = await exportAsFormat(data, 'json');
downloadExportFile(content, 'grok-tasks-export.json');

// 导入数据
const result = importData(jsonString);
console.log(`导入成功: ${result.imported} 个任务`);
```

#### 导出格式对比

| 格式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **JSON** | 完整数据，支持重新导入 | 需要工具查看 | 备份、迁移 |
| **CSV** | 表格格式，Excel 友好 | 不支持重新导入 | 数据分析 |
| **Markdown** | 可读性好，适合分享 | 格式复杂 | 文档、报告 |

---

### 5. 增强的模板系统

#### 新增模板（12个）

1. **Nano Banana Pro 监控** - 专属监控
2. **X 热帖监控** - 通用热点追踪
3. **AI 技术追踪** - 行业动态
4. **竞品动态监控** - 商业情报
5. **KOL 观点追踪** - 意见领袖
6. **提示词收集** - 优质提示词
7. **市场调研助手** - 深度分析 ⭐ 新增
8. **内容日历规划** - 社交媒体 ⭐ 新增
9. **投资顾问助手** - 投资分析 ⭐ 新增
10. **学习计划助手** - 教育学习 ⭐ 新增
11. **工作流优化师** - 效率提升 ⭐ 新增
12. **数据分析师** - 数据洞察 ⭐ 新增

#### 模板分类

```typescript
import { templates, filterByCategory, searchTemplates } from '@/lib/templates.enhanced';

// 按分类筛选
const businessTemplates = filterByCategory(templates, '商业分析');

// 按难度筛选
const beginnerTemplates = filterByDifficulty(templates, 'beginner');

// 搜索模板
const results = searchTemplates(templates, 'AI');
```

---

## 🎨 UI 组件使用

### 1. 订阅升级模态框

```typescript
import { SubscriptionModal } from '@/features/subscription/components/SubscriptionModal';

function App() {
  const [showSubscription, setShowSubscription] = useState(false);

  return (
    <>
      <button onClick={() => setShowSubscription(true)}>
        升级到 Pro 版
      </button>

      <SubscriptionModal
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
        onUpgrade={() => {
          // 升级成功回调
          alert('升级成功！');
        }}
      />
    </>
  );
}
```

### 2. 数据管理模态框

```typescript
import { DataManagementModal } from '@/features/export/components/DataManagementModal';

<DataManagementModal
  isOpen={showDataManagement}
  onClose={() => setShowDataManagement(false)}
/>
```

### 3. 通知设置模态框

```typescript
import { NotificationSettingsModal } from '@/features/notifications/components/NotificationSettingsModal';

<NotificationSettingsModal
  isOpen={showNotificationSettings}
  onClose={() => setShowNotificationSettings(false)}
/>
```

---

## 📦 部署指南

### 1. 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 2. 构建生产版本

```bash
# 构建
npm run build

# 输出在 out/ 目录
```

### 3. Service Worker 注册

在 `app/layout.tsx` 中添加：

```typescript
useEffect(() => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('/serviceworker.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
}, []);
```

### 4. GitHub Pages 部署

```bash
# 自动部署已配置，推送代码即可
git push origin main

# 或手动部署
npm run build
npx gh-pages -d out
```

### 5. Vercel 部署

1. 访问 [vercel.com/new](https://vercel.com/new)
2. 导入 GitHub 仓库
3. 自动检测 Next.js 配置
4. 点击 Deploy

---

## 🔧 配置说明

### 环境变量

创建 `.env.local` 文件：

```bash
# Grok API 配置
NEXT_PUBLIC_GROK_API_KEY=your-api-key
NEXT_PUBLIC_GROK_API_BASE=https://apipro.maynor1024.live/v1
NEXT_PUBLIC_GROK_MODEL=grok-4.1-fast

# EmailJS（可选）
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your-service-id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your-template-id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your-public-key

# Resend（可选）
NEXT_PUBLIC_RESEND_API_KEY=your-api-key
```

---

## 📊 数据存储

### localStorage 结构

```javascript
// 原有键
grok_tasks              // 任务列表
grok_executions         // 执行历史
grok_api_config         // API 配置

// 新增键
grok_user_quota         // 用户配额
grok_usage_records      // 使用记录
grok_notification_config // 通知配置
grok_notification_queue // 通知队列
grok_scheduled_tasks    // 定时任务
grok_schedule_executions // 定时执行历史
```

---

## ⚠️ 注意事项

### 1. Service Worker 限制
- 需要在 HTTPS 或 localhost 环境下运行
- 浏览器可能限制后台运行时间
- 建议用户保持网站开启以获得最佳体验

### 2. 邮件通知
- 当前为演示模式，实际使用需要配置邮件服务
- 免费邮件服务有发送限制
- 建议使用专业邮件服务（Resend、SendGrid 等）

### 3. 配额系统
- 免费版配额每天 00:00 重置
- 升级到 Pro 版需要实际支付集成
- 当前为演示模式，升级直接生效

### 4. 数据迁移
- v1.x 数据兼容 v2.0
- 建议升级前导出数据备份
- 导入功能会合并而非覆盖

---

## 🐛 已知问题

1. **Service Worker 兼容性**
   - Safari 支持有限
   - 部分浏览器可能限制后台运行

2. **邮件通知**
   - 当前为演示模式，需要配置真实邮件服务
   - 邮件可能进入垃圾箱

3. **配额重置**
   - 依赖本地时间，修改系统时间可能影响

---

## 🔄 从 v1.x 升级

### 步骤 1: 备份数据

```typescript
// 在 v1.x 版本中，导出数据
const data = {
  tasks: getTasks(),
  executions: getExecutions(),
  apiConfig: getApiConfig(),
};
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'grok-tasks-backup-v1.json';
a.click();
```

### 步骤 2: 安装依赖

```bash
git pull origin main
npm install
```

### 步骤 3: 恢复数据

```typescript
// 在 v2.0 版本中，导入数据
const result = importData(jsonString);
console.log(`导入成功: ${result.imported} 个任务`);
```

---

## 📞 支持与反馈

- **GitHub Issues**: [https://github.com/xianyu110/grok-task/issues](https://github.com/xianyu110/grok-task/issues)
- **文档**: [README.md](./README.md)
- **示例**: [在线演示](https://xianyu110.github.io/grok-task/)

---

## 📝 更新日志

### v2.0.0 (2025-01-12)

#### ✨ 新增功能
- 定时任务自动化（Cron + Service Worker）
- 邮件通知系统（EmailJS/Resend）
- Pro 订阅和配额管理
- 数据导出/导入（JSON/CSV/Markdown）
- 浏览器原生通知
- 增强的模板系统（12个专业模板）
- 现代化 UI 组件

#### 🐛 修复问题
- 修复 localStorage 容量限制问题
- 优化任务执行超时处理
- 改进错误提示

#### ⚡ 性能优化
- React useCallback/useMemo 优化
- 组件懒加载
- 减少不必要的重渲染

#### 📚 文档更新
- 新增升级指南
- 新增 API 文档
- 新增使用示例

---

**享受全新的 Grok Task v2.0！🎉**
