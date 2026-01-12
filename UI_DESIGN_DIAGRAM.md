# Grok Task 网站UI设计图（Mermaid）

## 1. 页面整体布局流程图

```mermaid
graph TB
    A[Navigation 导航栏] --> B[Hero Section 英雄区域]
    B --> C[Task Form 任务表单]
    C --> D[Core Features 核心功能]
    D --> E[Pricing Plans 定价方案]
    E --> F[FAQ 常见问题]
    F --> G[Task Showcase 任务展示]
    G --> H[CTA 行动号召]
    H --> I[Footer 页脚]

    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style E fill:#fce4ec
    style F fill:#fff9c4
    style G fill:#e0f2f1
    style H fill:#f1f8e9
    style I fill:#eceff1
```

## 2. Hero Section 详细设计

```mermaid
graph LR
    subgraph Hero["Hero Section (1200px max-width)"]
        direction TB
        H1[主标题<br/>让 AI 自动帮你追踪热点<br/>font-size: 48-64px<br/>font-weight: bold]
        H2[副标题<br/>一觉醒来，所有资讯已整理完毕<br/>font-size: 24px]
        H3[描述<br/>从「你问我答」到「主动汇报」<br/>font-size: 18px]

        subgraph Features["核心卖点 (3列)"]
            F1[⏰<br/>灵活的时间调度<br/>每日/每周/每月自动运行]
            F2[📧<br/>邮件通知<br/>结果直接找到你]
            F3[🔥<br/>X平台深度整合<br/>追踪热点话题]
        end
    end

    style H1 fill:#ff6b6b,font-size:20px
    style H2 fill:#4ecdc4,font-size:16px
    style H3 fill:#95e1d3,font-size:14px
    style F1 fill:#feca57
    style F2 fill:#ff9ff3
    style F3 fill:#54a0ff
```

## 3. 任务表单设计

```mermaid
graph TB
    subgraph TaskForm["任务表单区域 (max-width: 800px)"]
        direction TB
        Title[快速创建任务<br/>直接在首页创建您的 AI 任务]

        Quota[配额显示<br/>剩余 X 免费次数 + Y 积分]

        Field1[任务名称 *<br/>input type=text<br/>placeholder: 例如：每日科技新闻汇总]

        Field2[执行频率<br/>select dropdown<br/>options: 单次/每天/每周/自定义]

        Field3[任务描述<br/>textarea<br/>可选字段]

        Field4[任务提示词 Prompt *<br/>textarea rows=6<br/>placeholder: 详细描述任务...]

        Hint[💡 提示<br/>写得越详细，AI 的输出质量越高]

        Buttons[按钮组<br/>AI 优化提示词 | 创建任务]

        Status[加载任务中...]
    end

    style Title fill:#a29bfe
    style Quota fill:#74b9ff
    style Field1 fill:#81ecec
    style Field2 fill:#81ecec
    style Field3 fill:#81ecec
    style Field4 fill:#81ecec
    style Hint fill:#ffeaa7
    style Buttons fill:#fab1a0
    style Status fill:#dfe6e9
```

## 4. 核心功能网格布局

```mermaid
graph TB
    subgraph CoreFeatures["核心功能展示 (3列 x 2行网格)"]
        direction LR
        row1[第1行]
        row2[第2行]

        subgraph Row1[""]
            CF1[⏰<br/>灵活的时间调度<br/>Cron表达式自定义<br/>每天8点/每周一/每月底]
            CF2[📧<br/>外部通知机制<br/>邮箱推送<br/>设置后就忘掉]
            CF3[🔥<br/>X平台深度整合<br/>话题标签/用户监控<br/>舆情分析]
        end

        subgraph Row2[""]
            CF4[🎯<br/>智能任务模板<br/>内容创作/市场营销<br/>一键创建]
            CF5[📊<br/>完整执行历史<br/>永久保存<br/>筛选/搜索/导出]
            CF6[⚡<br/>高级分析能力<br/>资源密集型任务<br/>最长3分钟]
        end
    end

    style CF1 fill:#48dbfb
    style CF2 fill:#0abde3
    style CF3 fill:#5f27cd
    style CF4 fill:#ff6b6b
    style CF5 fill:#ee5a6f
    style CF6 fill:#f368e0
```

## 5. 定价方案对比

```mermaid
graph LR
    subgraph Pricing["定价方案 (3列等宽)"]
        P1[免费版<br/>━━━━━━━━<br/>¥0<br/>永久免费<br/><br/>• 3次/天任务<br/>• 3次/天AI问答<br/>• 所有模板<br/>• 社区支持<br/><br/>[免费开始]]
        P2[Pro专业版 月付<br/>🔥 推荐<br/>━━━━━━━━<br/>¥29/月<br/>原价 ¥58<br/><br/>• ✨ 无限次任务<br/>• ✨ 无限次问答<br/>• 邮件通知<br/>• 优先队列<br/><br/>[立即订阅]]
        P3[Pro专业版 季付<br/>💎 季付优惠<br/>━━━━━━━━<br/>¥78/季<br/>原价 ¥174<br/><br/>• ✨ 无限次任务<br/>• ✨ 无限次问答<br/>• 邮件通知<br/>• 优先队列<br/><br/>[立即订阅]]
    end

    style P1 fill:#dfe6e9
    style P2 fill:#a29bfe,color:#fff
    style P3 fill:#74b9ff
```

## 6. FAQ 区域设计

```mermaid
graph TB
    subgraph FAQ["常见问题区域"]
        direction TB
        FAQTitle[关于 Grok TaskPro 的常见问题]
        FAQSub[还有其他问题？请随时联系我们]

        subgraph Questions["问题列表"]
            Q1[❓ 如何创建任务？]
            Q2[❓ 如何配置API？]
            Q3[❓ 支持哪些平台？]
            Q4[❓ 如何取消订阅？]
        end

        FAQContact[联系我们按钮]
    end

    style FAQTitle fill:#ffeaa7
    style FAQSub fill:#fdcb6e
    style Q1 fill:#81ecec
    style Q2 fill:#81ecec
    style Q3 fill:#81ecec
    style Q4 fill:#81ecec
    style FAQContact fill:#00b894,color:#fff
```

## 7. 任务展示区域

```mermaid
graph TB
    subgraph Showcase["任务执行展示"]
        direction TB
        ShowTitle[探索任务执行展示]
        ShowDesc[查看 AI 自动生成的内容和执行历史]

        subgraph Examples["示例卡片"]
            Ex1[📋 示例任务1<br/>每日科技新闻汇总<br/>状态: ✅ 已完成<br/>时间: 2025-01-13 08:00]
            Ex2[📋 示例任务2<br/>行业动态分析<br/>状态: 🔄 执行中<br/>时间: 2025-01-13 09:00]
            Ex3[📋 示例任务3<br/>技术趋势报告<br/>状态: ⏳ 等待中<br/>时间: 2025-01-13 10:00]
        end

        ShowButton[查看完整历史 →]
    end

    style ShowTitle fill:#a29bfe
    style ShowDesc fill:#74b9ff
    style Ex1 fill:#55efc4
    style Ex2 fill:#ffeaa7
    style Ex3 fill:#dfe6e9
    style ShowButton fill:#00b894,color:#fff
```

## 8. CTA 行动号召

```mermaid
graph LR
    subgraph CTA["为什么选择 Grok TaskPro？"]
        C1[🎯 主动汇报<br/>━━━━━━━━<br/>信息找人<br/>而非人找信息]
        C2[📧 邮件推送<br/>━━━━━━━━<br/>结果直达邮箱<br/>随时随地查看]
        C3[⚡ 效率革命<br/>━━━━━━━━<br/>让 AI 在你睡觉时<br/>工作]
    end

    style C1 fill:#ff6b6b,color:#fff
    style C2 fill:#4ecdc4,color:#fff
    style C3 fill:#ffe66d,color:#2d3436
```

## 9. 响应式断点设计

```mermaid
graph LR
    subgraph Responsive["响应式设计"]
        Mobile[移动端<br/>&lt;768px<br/>━━━━━━<br/>单列布局<br/>12px 边距]
        Tablet[平板<br/>768-1024px<br/>━━━━━━<br/>2列布局<br/>24px 边距]
        Desktop[桌面<br/>&gt;1024px<br/>━━━━━━<br/>3列布局<br/>40px 边距]
    end

    Mobile --> Tablet
    Tablet --> Desktop

    style Mobile fill:#ff7675
    style Tablet fill:#74b9ff
    style Desktop fill:#55efc4
```

## 10. 组件层次结构

```mermaid
graph TB
    subgraph Page["HomePage Component"]
        Container[Container max-w-7xl mx-auto]

        subgraph Sections["页面区块"]
            Hero[HeroSection]
            Form[TaskFormSection]
            Features[CoreFeaturesSection]
            Pricing[PricingSection]
            FAQ[FAQSection]
            Showcase[TaskShowcaseSection]
            CTA[CTASection]
            Footer[Footer]
        end

        subgraph Components["可复用组件"]
            Button[Button Component]
            Input[Input Component]
            Select[Select Component]
            Card[Card Component]
            Badge[Badge Component]
        end
    end

    Container --> Sections
    Sections --> Components

    style Page fill:#2d3436,color:#fff
    style Container fill:#636e72,color:#fff
    style Hero fill:#e17055
    style Form fill:#00b894
    style Features fill:#0984e3
    style Pricing fill:#6c5ce7
    style FAQ fill:#fdcb6e
    style Showcase fill:#e84393
    style CTA fill:#00cec9
    style Footer fill:#636e72
    style Button fill:#d63031
    style Input fill:#fd79a8
    style Select fill:#fdcb6e
    style Card fill:#ffeaa7
    style Badge fill:#55a3ff
```

## 11. 颜色系统

```mermaid
graph LR
    subgraph Colors["色彩方案"]
        Primary[主色调<br/>━━━━━━<br/>蓝色: #3b82f6<br/>紫色: #8b5cf6]
        Accent[强调色<br/>━━━━━━<br/>绿色: #10b981<br/>橙色: #f59e0b]
        Background[背景色<br/>━━━━━━<br/>深灰: #1f2937<br/>浅灰: #f3f4f6]
        Text[文字色<br/>━━━━━━<br/>标题: #111827<br/>正文: #6b7280]
    end

    style Primary fill:#3b82f6,color:#fff
    style Accent fill:#f59e0b
    style Background fill:#1f2937,color:#fff
    style Text fill:#6b7280,color:#fff
```

## 12. 用户交互流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant Page as 页面
    participant Form as 表单
    participant API as Grok API
    participant Storage as localStorage

    User->>Page: 访问首页
    Page->>Storage: 读取配额
    Storage-->>Page: 返回配额数据
    Page->>User: 显示配额信息

    User->>Form: 填写任务名称
    User->>Form: 选择执行频率
    User->>Form: 输入任务描述
    User->>Form: 输入任务提示词

    alt 点击AI优化
        User->>Form: 点击"AI优化提示词"
        Form->>Form: 模拟AI优化
        Form-->>User: 显示优化后的提示词
    end

    User->>Form: 点击"创建任务"
    Form->>Form: 验证表单

    alt 验证失败
        Form-->>User: 显示错误提示
    else 验证成功
        Form->>Storage: 保存任务
        Form->>API: 执行任务（如果立即执行）
        API-->>Form: 返回执行结果
        Form-->>User: 显示成功提示
    end
```

## 13. 状态管理流程

```mermaid
graph TB
    subgraph State["状态管理"]
        FormState[表单状态<br/>━━━━━━<br/>taskName<br/>taskPrompt<br/>taskDescription<br/>frequency]
        UIState[UI状态<br/>━━━━━━<br/>showDropdown<br/>isCreating<br/>isOptimizing]
        DataState[数据状态<br/>━━━━━━<br/>remainingQuota<br/>tasks<br/>history]
    end

    FormState -->|用户输入| UIState
    UIState -->|更新显示| DataState
    DataState -->|读取| FormState

    style FormState fill:#a29bfe
    style UIState fill:#74b9ff
    style DataState fill:#55efc4
```

## 14. 数据流图

```mermaid
graph LR
    subgraph Flow["数据流"]
        Input[用户输入] --> Validate[表单验证]
        Validate -->|通过| Process[数据处理]
        Validate -->|失败| Error[错误提示]

        Process --> Save[保存到localStorage]
        Process --> Execute{立即执行?}

        Execute -->|是| API[调用Grok API]
        Execute -->|否| Save

        API --> Result[返回结果]
        Result --> Save
        Save --> Update[更新UI]
    end

    style Input fill:#ffeaa7
    style Validate fill:#81ecec
    style Process fill:#74b9ff
    style Save fill:#55efc4
    style Execute fill:#a29bfe
    style API fill:#ff6b6b
    style Result fill:#f368e0
    style Update fill:#00b894
    style Error fill:#d63031
```

## 15. 实现优先级

```mermaid
graph TB
    subgraph Priority["实现优先级"]
        P0[P0 - 必须实现<br/>━━━━━━━━<br/>1. Hero区域<br/>2. 任务表单<br/>3. 核心功能展示<br/>4. 定价方案]
        P1[P1 - 重要功能<br/>━━━━━━━━<br/>1. FAQ区域<br/>2. 任务展示<br/>3. CTA区域<br/>4. Footer]
        P2[P2 - 体验优化<br/>━━━━━━━━<br/>1. 动画效果<br/>2. 微交互<br/>3. 加载状态<br/>4. 错误处理]
    end

    style P0 fill:#d63031,color:#fff
    style P1 fill:#0984e3,color:#fff
    style P2 fill:#00b894,color:#fff
```

---

## 总结

以上15个设计图涵盖了：

1. ✅ 页面整体布局
2. ✅ Hero Section详细设计
3. ✅ 任务表单设计
4. ✅ 核心功能网格布局
5. ✅ 定价方案对比
6. ✅ FAQ区域设计
7. ✅ 任务展示区域
8. ✅ CTA行动号召
9. ✅ 响应式断点设计
10. ✅ 组件层次结构
11. ✅ 颜色系统
12. ✅ 用户交互流程
13. ✅ 状态管理流程
14. ✅ 数据流图
15. ✅ 实现优先级

**下一步**: 根据这些设计图重新实现代码
