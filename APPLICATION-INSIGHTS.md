# Application Insights 监控说明

## ✅ 已集成的监控功能

### 1. **自动追踪的数据**

Application Insights SDK 会自动追踪：
- ✅ **页面浏览量** - 每个页面的访问次数
- ✅ **页面加载时间** - 首次内容绘制、DOM加载时间
- ✅ **AJAX/Fetch 请求** - 所有 API 调用的性能
- ✅ **异常和错误** - JavaScript 运行时错误
- ✅ **用户会话** - 用户访问时长、跳出率
- ✅ **浏览器信息** - 操作系统、浏览器类型、设备类型

### 2. **自定义事件追踪**

我们添加了以下自定义事件：

| 事件名称 | 触发时机 | 追踪数据 |
|---------|---------|---------|
| `UserRegistered` | 用户注册成功 | username |
| `UserLoggedIn` | 用户登录成功 | username, userId |
| `DishUploaded` | 上传美食成功 | cuisine, tags, userId |
| `FilterApplied` | 应用筛选条件 | hasSearch, hasTags |
| `GalleryFiltered` | 筛选结果显示 | search, tags, resultCount |

### 3. **性能指标追踪**

| 指标名称 | 说明 | 单位 |
|---------|------|------|
| `GalleryLoadTime` | 美食列表加载时间 | 毫秒 |
| `DishUploadByCuisine` | 按菜系统计上传次数 | 次数 |

---

## 📊 在 Azure Portal 查看数据

### 步骤 1：进入 Application Insights

1. 打开 [Azure Portal](https://portal.azure.com)
2. 搜索 "Application Insights"
3. 选择 `foodshare-insights`

### 步骤 2：查看实时数据

**实时指标流**：
- Application Insights → 实时指标
- 查看实时请求、失败率、响应时间

### 步骤 3：查看用户行为

**用户统计**：
- Application Insights → 用户
- 查看活跃用户数、新用户数

**会话统计**：
- Application Insights → 会话
- 查看会话时长、页面浏览量

**页面浏览量**：
- Application Insights → 浏览器
- 查看各页面的访问次数和加载时间

### 步骤 4：查看自定义事件

**事件查询**：
1. Application Insights → 日志
2. 运行以下 KQL 查询：

```kusto
// 查看所有自定义事件
customEvents
| where timestamp > ago(24h)
| project timestamp, name, customDimensions
| order by timestamp desc

// 查看用户注册事件
customEvents
| where name == "UserRegistered"
| project timestamp, username = tostring(customDimensions.username)

// 查看上传美食事件（按菜系分组）
customEvents
| where name == "DishUploaded"
| summarize count() by tostring(customDimensions.cuisine)
| order by count_ desc

// 查看筛选使用统计
customEvents
| where name == "FilterApplied"
| summarize count() by 
    hasSearch = tostring(customDimensions.hasSearch),
    hasTags = tostring(customDimensions.hasTags)
```

### 步骤 5：查看性能指标

**自定义指标**：
1. Application Insights → 指标
2. 指标命名空间选择 "自定义"
3. 选择 `GalleryLoadTime` 查看列表加载性能
4. 选择 `DishUploadByCuisine` 查看各菜系上传统计

### 步骤 6：查看 API 性能

**依赖项追踪**：
- Application Insights → 性能
- 查看各个 Logic Apps API 的响应时间和失败率

### 步骤 7：查看错误和异常

**失败分析**：
- Application Insights → 失败
- 查看 JavaScript 错误、API 调用失败

---

## 📈 实用的 KQL 查询示例

### 1. 用户活动概览

```kusto
// 过去24小时的用户活动统计
union pageViews, customEvents
| where timestamp > ago(24h)
| summarize 
    PageViews = countif(itemType == "pageView"),
    CustomEvents = countif(itemType == "customEvent"),
    UniqueUsers = dcount(user_Id)
| project PageViews, CustomEvents, UniqueUsers
```

### 2. 热门菜系排行

```kusto
// 最受欢迎的菜系（按上传次数）
customEvents
| where name == "DishUploaded"
| extend cuisine = tostring(customDimensions.cuisine)
| where isnotempty(cuisine)
| summarize UploadCount = count() by cuisine
| order by UploadCount desc
| take 10
```

### 3. 用户注册趋势

```kusto
// 每天的用户注册量
customEvents
| where name == "UserRegistered"
| summarize RegisterCount = count() by bin(timestamp, 1d)
| order by timestamp desc
| render timechart
```

### 4. 页面性能分析

```kusto
// 各页面加载时间分析
pageViews
| where timestamp > ago(7d)
| summarize 
    AvgLoadTime = avg(duration),
    P95LoadTime = percentile(duration, 95),
    Views = count()
    by name
| order by Views desc
```

### 5. API 调用统计

```kusto
// Logic Apps API 调用统计
dependencies
| where timestamp > ago(24h)
| where type == "Http"
| summarize 
    CallCount = count(),
    AvgDuration = avg(duration),
    FailureRate = countif(success == false) * 100.0 / count()
    by name
| order by CallCount desc
```

### 6. 异常监控

```kusto
// 最近的 JavaScript 错误
exceptions
| where timestamp > ago(24h)
| project 
    timestamp, 
    message = outerMessage,
    details = innermostMessage,
    page = operation_Name
| order by timestamp desc
| take 50
```

---

## 🔔 设置告警

### 创建告警规则

1. Application Insights → 警报 → 新建警报规则
2. 选择条件：
   - **高错误率**：`exceptions | where timestamp > ago(5m) | count > 10`
   - **慢响应时间**：`requests | where duration > 5000`
   - **低活跃度**：`pageViews | where timestamp > ago(1h) | count < 1`
3. 配置操作组（邮件、短信等）

---

## 📱 创建仪表板

### 自定义仪表板

1. Azure Portal → 仪表板 → 新建仪表板
2. 添加图表：
   - **用户活跃度**：过去 7 天的页面浏览量
   - **热门菜系**：按菜系统计的上传次数
   - **API 性能**：Logic Apps 响应时间
   - **错误率**：JavaScript 错误趋势

---

## 🎯 PPT 中可以展示的数据

### 幻灯片 10：高级功能概述

**Application Insights 截图建议**：

1. **实时指标流**：
   - 展示实时请求数、响应时间
   - 证明监控正常工作

2. **用户统计**：
   - 展示活跃用户数、新用户数
   - 用户会话时长

3. **自定义事件**：
   - 展示 `UserRegistered`、`DishUploaded` 事件
   - 按菜系分类的上传统计

4. **性能指标**：
   - 展示 `GalleryLoadTime` 图表
   - API 响应时间趋势

5. **热门菜系排行**：
   - 使用 KQL 查询结果
   - 柱状图或饼图展示

---

## 🔧 故障排查

### 问题 1：没有数据显示

**可能原因**：
- Instrumentation Key 不正确
- 网络被阻止（防火墙、广告拦截器）
- JavaScript 加载失败

**解决方法**：
1. 检查浏览器控制台是否有 `✅ Application Insights initialized` 日志
2. 验证 Instrumentation Key
3. 禁用广告拦截器

### 问题 2：自定义事件未追踪

**可能原因**：
- `window.trackEvent` 未定义
- 事件触发时机不对

**解决方法**：
1. 确认 `insights.js` 已加载
2. 检查事件是否真的被触发（添加 `console.log`）

### 问题 3：数据延迟

**说明**：Application Insights 有轻微延迟（通常 1-2 分钟），这是正常的。实时指标流可以看到即时数据。

---

## 📚 相关资源

- [Application Insights 文档](https://learn.microsoft.com/zh-cn/azure/azure-monitor/app/app-insights-overview)
- [JavaScript SDK 文档](https://learn.microsoft.com/zh-cn/azure/azure-monitor/app/javascript)
- [KQL 查询语言](https://learn.microsoft.com/zh-cn/azure/data-explorer/kusto/query/)

---

## ✅ 监控功能检查清单

- [x] Application Insights 资源已创建
- [x] Instrumentation Key 已配置
- [x] SDK 已集成到所有页面
- [x] 自动追踪（页面浏览、API、异常）已启用
- [x] 自定义事件已添加（注册、登录、上传等）
- [x] 性能指标已添加（加载时间、菜系统计）
- [x] 用户上下文已设置（userId）
- [ ] 告警规则已配置（可选）
- [ ] 自定义仪表板已创建（可选）

---

**恭喜！🎉 FoodShare 平台的 Application Insights 监控已完全集成！**

