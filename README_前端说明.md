# FoodShare 前端（英文界面）说明

本目录包含 FoodShare（美食分享平台）的静态前端，实现登录、注册、上传、画廊、详情等页面。页面内文案与按钮为英文，便于与 API/Logic Apps 对接；说明文档为中文，方便你阅读与提交。

## 目录结构
```
11.20/
├─ css/
│  └─ style.css
├─ js/
│  ├─ auth.js
│  ├─ app.js
│  ├─ gallery.js
│  └─ upload.js
├─ index.html
├─ login.html
├─ register.html
├─ gallery.html
├─ upload.html
└─ detail.html
```

## 本地预览
- 方式一：右键 `index.html` 使用 Live Server（VS Code 插件）
- 方式二：任意静态服务器（如 `npx serve`）指向本目录

## 与后端对接（示例）
- 登录：POST `/api/login-user`
- 注册：POST `/api/register-user`
- 获取列表：GET `/api/get-dishes`
- 获取详情：GET `/api/get-dish-by-id?id=...&userId=...`
- 上传：POST `/api/upload-dish`
- 获取评论：GET `/api/get-comments?dishId=...`
- 添加评论：POST `/api/add-comment`

如你的网关/逻辑应用触发器为完整 URL，请在 `js/app.js` 中修改 `API_BASE`.

## 注意
- 页面文案为英文；说明文档为中文
- 仅为课程演示的轻量版前端，可根据需要扩展组件与状态管理


