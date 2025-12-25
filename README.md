# 神笔马良 (Soul Canvas) - AI 灵感画板

> **本项目由阿里云 ESA 提供加速、计算和保护**

<div align="center">
  <img src="https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png" alt="Logo" width="600" />
</div>

## 📖 项目简介 (Project Overview)

**神笔马良 (Soul Canvas)** 是一款智能 AI 绘图应用，旨在打破艺术创作的门槛。通过"简笔画 + AI 识别 + 风格化生成"的模式，用户只需简单勾勒线条，AI 就能实时理解意图并生成高质量的精美图像。

本项目是 **阿里云 ESA Pages 边缘开发大赛** 的参赛作品，基于边缘计算平台构建，探索前端技术与 AI 结合的无限可能。

## ✨ 核心功能 (Key Features)

- **🎨 智能流光画板**: 丝滑的绘图体验，支持压感模拟、撤销/重做与防误触设计。
- **👁️ AI 视觉感知**: 深度集成 Vision 模型，不仅仅是生图，更能精准理解你的草图语义。
- **🎭 多重风格引擎**: 内置 Logo 设计、3D 渲染、赛博朋克、吉卜力动漫等多种核心风格。
- **⚡ 极速生成体验**: 优化的生成链路，即画即得。
- **📱 全端适配**: 完美支持 PC 与移动端触控交互。

## 📸 应用截图 (Screenshots)

<div align="center">
  <img src="public/CleanShot%202025-12-25%20at%2021.39.18@2x.png" alt="应用截图1" width="48%" />
  </div>
  <div align="center">
  <img src="public/CleanShot%202025-12-25%20at%2021.40.24@2x.png" alt="应用截图2" width="48%" />
  </div>

## 🛠 技术栈 (Tech Stack)

本项目采用现代化的 SPA 架构开发：

- **Build Tool**: [Vite](https://vitejs.dev/) - 极速的前端构建工具
- **Framework**: [React 18](https://react.dev/) - 构建用户界面的库
- **Language**: [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **AI & Backend**: Supabase (Storage/DB) + OpenRouter API

## 🚀 快速开始 (Getting Started)

### 1. 环境准备

确保您的环境已安装 Node.js (推荐 v18+) 和 pnpm。

### 2. 安装依赖

```bash
# 克隆项目
git clone <YOUR_GIT_URL>
cd soul-canvas-ai

# 安装依赖
pnpm install
```

### 3. 配置环境

复制环境变量文件并填入配置（如 OpenRouter API Key）：

```bash
cp .env.example .env.local
```

### 4. 启动开发

```bash
pnpm dev
```

现在访问 [http://localhost:5173](http://localhost:5173) 即可开始使用。

## 📦 部署 (Deployment)

本项目支持部署到 **阿里云 ESA Pages**。

1. **构建项目**:

   ```bash
   pnpm build
   ```

   构建产物将输出到 `dist` 目录。

2. **部署到 ESA Pages**:
   - 在阿里云 ESA 控制台创建项目。
   - 连接 GitHub 仓库。
   - 设置构建命令为 `npm run build` 或 `pnpm build`。
   - 设置输出目录为 `dist`。

## 📄 参赛声明

本项目承诺所用代码及设计均为原创，并未侵犯任何第三方权益。
本项目由阿里云 ESA 提供加速、计算和保护。

## 📜 许可证 (License)

MIT License
