# 神笔马良 (Soul Canvas) - AI 灵感画板

> **本项目由阿里云 ESA 提供加速、计算和保护**

<div align="center">
  <img src="https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png" alt="Logo" width="600" />
</div>

---

## 🔥 2.0 版本更新 (What's New in v2.0)

神笔马良 2.0 是一次**全面升级**，从简单的 AI 草图工具蜕变为功能丰富的 AI 创意平台。

### 🌟 核心技术亮点

| 技术领域     | 技术方案                           | 实现效果                               |
| :----------- | :--------------------------------- | :------------------------------------- |
| **数据库**   | Neon PostgreSQL + Drizzle ORM      | 云端持久化存储，类型安全的数据访问     |
| **用户认证** | Clerk                              | 一键登录，个人作品集管理               |
| **AI 服务**  | Kie.ai (主) + OpenRouter (备)      | 多节点故障转移，自动测速选择低延迟节点 |
| **3D 效果**  | React Three Fiber + Custom Shaders | 动态粒子生肖背景，高性能 GPU 加速      |
| **动画系统** | Framer Motion                      | Hero 区动物流变剪影，跨状态平滑过渡    |
| **UI 框架**  | Shadcn/UI + Radix Primitives       | 无障碍支持，键盘导航友好               |

### ✨ 新增功能一览

- **🔐 用户系统**: 集成 Clerk 认证，支持登录、作品集管理，登录用户享 50 次/天生成额度。
- **🤖 AI 高可用**: 多 API 节点智能切换，自动测速、故障转移，确保生成体验稳定流畅。
- **🎲 一键灵感**: 随机灵感生成器，一键填充艺术线条与 Prompt，告别空白画布恐惧。
- **🖼️ 批量生成**: 支持 1-4 张变体同时生成，快速探索多种创意可能。
- **🌐 社区画廊**: 作品公开发布、点赞、分享，支持"同款 Remix"一键复刻。
- **🐉 动态背景**: 粒子自动汇聚成龙凤牛马猪等生肖图案，科技感拉满。
- **✨ 流变动画**: Hero 区动物剪影流体变形，视觉隐喻 AI 无限创意。
- **🎨 科技 Logo**: 悬停粒子辉光效果，品牌标识焕然一新。

---

## 📖 项目简介 (Project Overview)

**神笔马良 (Soul Canvas)** 是一款智能 AI 绘图应用，旨在打破艺术创作的门槛。通过"简笔画 + AI 识别 + 风格化生成"的模式，用户只需简单勾勒线条，AI 就能实时理解意图并生成高质量的精美图像。

本项目是 **阿里云 ESA Pages 边缘开发大赛** 的参赛作品，基于边缘计算平台构建，探索前端技术与 AI 结合的无限可能。

## ✨ 核心功能 (Key Features)

- **🎨 智能流光画板**: 丝滑的绘图体验，支持压感模拟、撤销/重做与防误触设计。
- **👁️ AI 视觉感知**: 深度集成 Vision 模型，不仅仅是生图，更能精准理解你的草图语义。
- **🎭 多重风格引擎**: 内置 Logo 设计、3D 渲染、赛博朋克、吉卜力动漫等多种核心风格。
- **⚡ 极速生成体验**: 优化的生成链路，即画即得。
- **📱 全端适配**: 完美支持 PC 与移动端触控交互。
- **🔐 用户认证**: 登录管理个人作品集，同步云端存储。
- **🌐 社区画廊**: 发布作品到社区，点赞分享，一键 Remix。
- **🐉 动态粒子背景**: 3D 粒子汇聚成生肖动物，科技感十足。

## 📸 应用截图 (Screenshots)

<div align="center">
  <img src="public/CleanShot%202025-12-25%20at%2021.39.18@2x.png" alt="应用截图1" width="48%" />
  </div>
  <div align="center">
  <img src="public/CleanShot%202025-12-25%20at%2021.40.24@2x.png" alt="应用截图2" width="48%" />
  </div>

## 🛠 技术栈 (Tech Stack)

本项目采用现代化的 SPA 架构开发：

### 前端核心

- **Build Tool**: [Vite](https://vitejs.dev/) - 极速的前端构建工具
- **Framework**: [React 18](https://react.dev/) - 构建用户界面的库
- **Language**: [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router](https://reactrouter.com/)

### 后端与数据 (2.0 新增)

- **Database**: [Neon PostgreSQL](https://neon.tech/) - 无服务器云数据库
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - 类型安全的数据库操作
- **Authentication**: [Clerk](https://clerk.com/) - 用户认证与管理

### AI 服务 (2.0 升级)

- **Primary**: [Kie.ai](https://kie.ai/) - Nano Banana Edit 模型，异步任务模式
- **Fallback**: [OpenRouter](https://openrouter.ai/) - 多模型聚合，确保高可用

### 动画与 3D (2.0 新增)

- **3D Engine**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) - 3D 粒子背景渲染
- **Animation**: [Framer Motion](https://www.framer.com/motion/) - 流畅的状态动画

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
