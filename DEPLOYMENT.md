# FoodShare - CI/CD 部署指南

## 方案一：Azure Static Web Apps + GitHub Actions（推荐）

### 步骤 1：创建 Azure Static Web App

1. 打开 Azure Portal
2. 搜索 "Static Web Apps"
3. 点击 "创建"
4. 配置：
   - **资源组**：`foodshare-france-rg`
   - **名称**：`foodshare-web`
   - **区域**：France Central
   - **部署详细信息**：
     - 源：GitHub
     - 组织：你的 GitHub 用户名
     - 存储库：选择你的仓库
     - 分支：main
   - **构建详细信息**：
     - 预设：Custom
     - 应用位置：`/11.20`
     - API 位置：留空
     - 输出位置：留空
5. 点击 "查看 + 创建" → "创建"

**Azure 会自动**：
- 在你的 GitHub 仓库创建 `.github/workflows/azure-static-web-apps-xxx.yml`
- 配置自动部署
- 每次 push 到 main 分支时自动部署

---

### 步骤 2：验证部署

1. 等待 Azure 创建完成（约 2-3 分钟）
2. 进入 Static Web App 资源
3. 复制 **URL**（例如：`https://foodshare-web.azurestaticapps.net`）
4. 访问 URL，确认前端已部署

---

### 步骤 3：配置自定义域名（可选）

1. 在 Static Web App → 自定义域
2. 添加你的域名
3. 配置 DNS 记录

---

## 方案二：手动创建 GitHub Actions Workflow

如果你想手动控制 CI/CD 流程，可以创建以下文件：

### `.github/workflows/deploy.yml`

```yaml
name: Deploy FoodShare to Azure

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Deploy to Azure Static Web Apps
      uses: Azure/static-web-apps-deploy@v1
      with:
        azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
        repo_token: ${{ secrets.GITHUB_TOKEN }}
        action: "upload"
        app_location: "/11.20"
        api_location: ""
        output_location: ""
```

### 配置步骤：

1. 在 GitHub 仓库 → Settings → Secrets and variables → Actions
2. 添加 Secret：
   - **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Value**: 从 Azure Static Web App 复制的 API Token
3. 创建 `.github/workflows/deploy.yml` 文件
4. Push 到 GitHub

---

## 方案三：使用 Azure App Service（传统方式）

### 步骤 1：创建 App Service

1. Azure Portal → 搜索 "App Service"
2. 点击 "创建"
3. 配置：
   - **资源组**：`foodshare-france-rg`
   - **名称**：`foodshare-web-app`
   - **发布**：代码
   - **运行时堆栈**：Node.js 或静态 HTML
   - **操作系统**：Linux
   - **区域**：France Central
   - **定价计划**：免费 F1
4. 点击 "查看 + 创建" → "创建"

### 步骤 2：配置部署凭据

1. App Service → 部署中心
2. 选择 "GitHub"
3. 授权 GitHub 账户
4. 选择仓库和分支
5. Azure 会自动创建 GitHub Actions workflow

### 步骤 3：手动创建 Workflow（可选）

创建 `.github/workflows/azure-app-service.yml`：

```yaml
name: Deploy to Azure App Service

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  AZURE_WEBAPP_NAME: foodshare-web-app
  AZURE_WEBAPP_PACKAGE_PATH: '11.20'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ env.AZURE_WEBAPP_NAME }}
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ${{ env.AZURE_WEBAPP_PACKAGE_PATH }}
```

### 配置步骤：

1. 在 Azure App Service → 获取发布配置文件
2. 在 GitHub 仓库 → Settings → Secrets
3. 添加 Secret：
   - **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Value**: 粘贴发布配置文件内容

---

## 推荐方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| **Static Web Apps** | 简单、免费、自动 CI/CD | 功能较少 | ✅ 纯静态网站 |
| **App Service** | 功能丰富、支持后端 | 配置复杂、有成本 | 需要后端处理 |
| **手动 GitHub Actions** | 完全控制、灵活 | 需要手动配置 | 高级自定义需求 |

---

## 验证 CI/CD 是否工作

### 测试步骤：

1. **修改代码**：
   ```bash
   # 修改 index.html 的标题
   # 例如：<h1>Welcome to FoodShare</h1> → <h1>Welcome to FoodShare v2</h1>
   ```

2. **提交并推送**：
   ```bash
   git add .
   git commit -m "Test CI/CD deployment"
   git push origin main
   ```

3. **查看 GitHub Actions**：
   - 进入 GitHub 仓库 → Actions 标签
   - 查看最新的 workflow 运行
   - 确认状态为 ✅ Success

4. **验证部署**：
   - 访问 Azure Static Web App URL
   - 刷新页面，确认修改已生效

---

## 监控和日志

### GitHub Actions 日志：
- GitHub 仓库 → Actions → 选择 workflow run → 查看详细日志

### Azure 部署日志：
- Azure Static Web App → 部署历史
- 查看每次部署的状态和日志

---

## 故障排查

### 常见问题：

1. **部署失败 - 找不到文件**：
   - 检查 `app_location` 是否正确（应为 `/11.20`）
   - 确认文件路径大小写正确

2. **GitHub Actions 权限错误**：
   - 检查 GitHub Secrets 是否正确配置
   - 重新生成 Azure API Token

3. **网站显示 404**：
   - 确认 `index.html` 在根目录
   - 检查 Static Web App 配置

---

## 下一步

1. ✅ 创建 Azure Static Web App
2. ✅ 验证自动部署
3. ✅ 配置自定义域名（可选）
4. ✅ 添加 Application Insights 监控
5. ✅ 设置环境变量（API URLs）

---

## 相关链接

- [Azure Static Web Apps 文档](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Azure App Service 文档](https://learn.microsoft.com/en-us/azure/app-service/)

