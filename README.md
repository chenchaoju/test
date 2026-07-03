# VaultCipher · 密码保险库

一个纯前端的个人密码管理器，所有数据在浏览器本地 AES-256 加密存储，无需后端服务器。可部署到 GitHub Pages 免费托管。

## ✨ 功能特性

- **AES-256 加密** - 所有密码数据在浏览器本地加密存储，主密码不落盘
- **密码库管理** - 增删改查密码条目、分类管理、搜索过滤
- **密码生成器** - 自定义长度、字符类型、强度指示
- **数据导入导出** - 加密 JSON 备份、明文 CSV 导出
- **自动锁定** - 可设置自动锁定时间
- **赛博朋克 UI** - 深色霓虹风格，扫描线动效

## 🛠️ 技术栈

- React 18 + TypeScript
- Vite 构建工具
- TailwindCSS 样式
- Zustand 状态管理
- crypto-js 加密
- React Router 路由

## 🚀 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

## 📦 部署到 GitHub Pages

1. Fork 或克隆此仓库到你的 GitHub

2. 修改 `package.json` 中的 `homepage` 字段：
   ```json
   "homepage": "https://你的用户名.github.io/仓库名"
   ```

3. 推送代码到 GitHub：
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

4. 部署到 GitHub Pages：
   ```bash
   pnpm deploy
   ```

5. 在 GitHub 仓库设置中，进入 **Settings → Pages**，将 Source 设为 `gh-pages` 分支

## 🔐 安全说明

- 所有加密在浏览器本地完成，数据不经过任何服务器
- 主密码使用 SHA-256 哈希存储，用于验证
- 密码条目使用 AES-256-CBC 加密后存储在 localStorage
- 主密码仅保存在内存中，页面刷新后清除
- **请牢记主密码，无法找回**

## 📄 许可证

MIT
