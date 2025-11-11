# FoodShare CI/CD 快速设置指南

## 🚀 最简单的方法：使用 Azure Static Web Apps

### 步骤 1️⃣：创建 GitHub 仓库

1. 在 GitHub 创建新仓库（如果还没有）
2. 将项目推送到 GitHub：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/foodshare.git
   git push -u origin main
   ```

### 步骤 2️⃣：创建 Azure Static Web App

1. 打开 [Azure Portal](https://portal.azure.com)
2. 搜索 "Static Web Apps" → 点击 "创建"
3. 填写信息：
   - **订阅**：你的订阅
   - **资源组**：`foodshare-france-rg`
   - **名称**：`foodshare-web`
   - **计划类型**：免费
   - **区域**：France Central
   
4. 部署详细信息：
   - **源**：GitHub
   - **组织**：你的 GitHub 用户名
   - **存储库**：选择你的仓库
   - **分支**：main

5. 构建详细信息：
   - **构建预设**：Custom
   - **应用位置**：`/11.20`
   - **API 位置**：（留空）
   - **输出位置**：（留空）

6. 点击 "查看 + 创建" → "创建"

### 步骤 3️⃣：等待部署完成

Azure 会自动：
- ✅ 在你的 GitHub 仓库创建 `.github/workflows/azure-static-web-apps-xxx.yml`
- ✅ 配置部署流程
- ✅ 自动部署你的网站

大约 2-3 分钟后：
1. 进入 Static Web App 资源
2. 复制 **URL**（类似：`https://foodshare-web.azurestaticapps.net`）
3. 访问 URL 查看你的网站！

### 步骤 4️⃣：测试自动部署

1. 修改代码（例如修改 `index.html` 的标题）
2. 提交并推送：
   ```bash
   git add .
   git commit -m "Update title"
   git push
   ```
3. 进入 GitHub → Actions 标签，查看自动部署
4. 等待部署完成后，刷新网站查看更新

---

## 📊 监控部署状态

### GitHub Actions：
- **地址**：`https://github.com/你的用户名/你的仓库/actions`
- 查看每次部署的详细日志

### Azure Portal：
- Static Web App → 环境 → 生产环境
- 查看部署历史和状态

---

## ⚙️ 配置环境变量

如果需要在生产环境使用不同的 API URLs：

1. Azure Static Web App → 配置 → 应用程序设置
2. 添加环境变量：
   ```
   API_BASE_URL=https://你的logic-apps域名
   ```
3. 在代码中使用：
   ```javascript
   const API_URL = process.env.API_BASE_URL || 'https://默认地址';
   ```

---

## 🔧 故障排查

### 问题 1：部署失败 - 找不到文件

**原因**：`app_location` 路径不正确

**解决**：
1. 检查 workflow 文件中的 `app_location: "/11.20"`
2. 确认项目文件在 `11.20/` 目录下

### 问题 2：网站显示空白

**原因**：入口文件名不对

**解决**：
1. 确认根目录有 `index.html`
2. 文件名大小写正确

### 问题 3：API 调用失败（CORS）

**原因**：Logic Apps 的 CORS 设置

**解决**：
1. 在每个 Logic App 的 Response 中添加：
   ```json
   "Access-Control-Allow-Origin": "*"
   ```

---

## 📈 性能优化建议

### 1. 配置 CDN（自动启用）
Azure Static Web Apps 自动使用 CDN 加速全球访问

### 2. 自定义域名
1. Static Web App → 自定义域
2. 添加你的域名
3. 配置 DNS CNAME 记录

### 3. HTTPS（自动启用）
Azure Static Web Apps 自动提供免费 SSL 证书

---

## 🎯 完成检查清单

- [ ] GitHub 仓库已创建
- [ ] 代码已推送到 GitHub
- [ ] Azure Static Web App 已创建
- [ ] GitHub Actions workflow 已自动生成
- [ ] 网站可以通过 Azure URL 访问
- [ ] 修改代码后自动部署成功
- [ ] Logic Apps APIs 配置正确（CORS）
- [ ] Application Insights 已集成（可选）

---

## 📚 相关资源

- [Azure Static Web Apps 文档](https://learn.microsoft.com/zh-cn/azure/static-web-apps/)
- [GitHub Actions 文档](https://docs.github.com/zh/actions)
- [自定义域名配置](https://learn.microsoft.com/zh-cn/azure/static-web-apps/custom-domain)

---

**恭喜！🎉 你的 FoodShare 平台已经实现了 CI/CD 自动部署！**

