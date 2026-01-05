# 🚀 神笔马良 2.0 开发文档 (All-in-One)

> **关联 Issue**: [#16 - 神笔马良 2.0 版本规划 - 全面升级](https://github.com/qqyule/soul-canvas-ai/issues/16)
>
> **最后更新**: 2026-01-05

---

## 📋 项目概述

将神笔马良从一个简单的 AI 草图生成工具，升级为功能丰富、技术先进、体验一流的 AI 创意平台。

## 🛠️ 技术栈与资源

- **前端框架**: React 18 + Vite + TypeScript
- **样式方案**: Tailwind CSS + Shadcn UI
- **数据库**: Neon PostgreSQL + Drizzle ORM
- **用户认证**: Clerk
- **AI 服务**: OpenRouter (Fallback) + Kie.ai (Primary)
- **部署平台**: 阿里云 ESA Pages

---

## 🗓️ 开发路线图与状态

### ✅ 已完成功能 (P0-P2)

| 阶段   | 功能模块              | 分支                         | 状态      | 负责人 |
| :----- | :-------------------- | :--------------------------- | :-------- | :----- |
| **P0** | **Neon 数据库集成**   | `feature/neon-database`      | 🟢 已完成 | -      |
| **P0** | **用户认证系统**      | `feature/user-auth`          | 🟢 已完成 | -      |
| **P0** | **AI 执行容错性**     | `feature/ai-fault-tolerance` | 🟢 已完成 | -      |
| **P1** | **历史记录优化**      | `feature/history-optimize`   | 🟢 已完成 | -      |
| **P1** | **风格选取 UI 优化**  | `feature/style-ui-refine`    | 🟢 已完成 | -      |
| **P1** | **批量生成 & 变体**   | `feature/batch-generation`   | 🟢 已完成 | -      |
| **P2** | **随机灵感生成器**    | `feature/random-inspiration` | 🟢 已完成 | -      |
| **P2** | **Logo 科技化重设计** | `feature/logo-redesign`      | 🟢 已完成 | -      |
| **P2** | **作品集 & 社区画廊** | `feature/community-gallery`  | 🟢 已完成 | -      |
| **P2** | **多 API 节点切换**   | `feature/multi-api-node`     | 🟢 已完成 | -      |
| **P2** | **Hero 动物流变动画** | `feature/hero-morphing`      | 🟢 已完成 | -      |
| **P2** | **动态粒子生肖背景**  | `feature/particle-animals`   | 🟢 已完成 | -      |

### ⚪ 待开发 / 规划中

| 优先级 | 功能模块           | 分支                       | 备注                       |
| :----- | :----------------- | :------------------------- | :------------------------- |
| **P1** | 动效与交互增强系统 | `feature/interact-effects` | 提升点击、过渡等微交互体验 |
| **P1** | 自定义风格         | `feature/custom-styles`    | 用户上传图片创建风格       |
| **P2** | 国际化支持 (i18n)  | `feature/i18n`             | 中英多语言                 |
| **P2** | PWA 离线支持       | `feature/pwa`              | 离线访问与安装             |

---

## 📝 核心功能详细说明

### 1. 数据库与认证 (P0)

使用 **Neon PostgreSQL** 作为数据底座，**Drizzle ORM** 进行类型安全的操作。认证集成 **Clerk**，并通过 Webhook 或 hooks 同步用户数据到本地数据库。

- **核心表**: `users`, `artworks`, `favorites`, `generation_logs`
- **方案**: Drizzle Repository 模式 + Zod 验证

### 2. 历史记录与社区 (P1/P2)

- **历史记录**: 实现瀑布流虚拟列表 (`Virtual Grid`)，支持多维度筛选（风格、时间）和批量操作。
- **社区画廊**: 公开作品展示，支持点赞、浏览量统计和分享。
- **作品详情**: 弹窗查看高清大图，支持 Remix（同款生成）。

### 3. 多 API 节点切换 (P2)

为了提高可用性与降低成本，实现了多节点故障转移策略。

- **主节点**: Kie.ai (Nano Banana Edit 模型)，异步任务模式，高性价比。
- **备用节点**: OpenRouter，同步模式，确保高可用。
- **机制**: 客户端启动时自动测速，优先选择低延迟节点；请求失败自动切换。

### 4. 随机灵感与 Logo (P2)

- **灵感生成器**: 解决"空白画布"恐惧，一键生成艺术线条与提示词建议。
- **动态 Logo**: 结合 SVG 与 CSS 动画，实现鼠标悬停时的科技感粒子/辉光效果。

### 5. Hero 动物流变动画 (P2)

- **视觉效果**: 在 Hero 标题区展示流体变形的动物剪影（马、猪、鸟、象、蝶），增强 AI "无所不能" 的视觉隐喻。
- **技术实现**: 使用 `framer-motion` 的 `AnimatePresence` 实现高性能 Cross-Fade 动画，替代高开销的路径插值。
- **动态适配**: 支持动态 `viewBox` 调整，确保不同比例的 SVG 完美展示。

### 6. 动态粒子生肖背景 (P2)

- **视觉效果**: 这里的粒子会自动汇聚成中国传统生肖图案（龙、凤、牛、马、猪），形成一种宏大的科技叙事感。
- **交互细节**: 粒子具有"呼吸"效果，在汇聚成型时亮度增强；支持鼠标斥力交互和点击冲击波效果。
- **技术底层**: 基于 `React Three Fiber` 和 `THREE.Points` 实现，通过自定义着色器或缓冲区更新实现高性能的粒子位置插值。

---

## 📁 分支管理规范

```bash
feature/<功能名称>    # 新功能开发
fix/<问题描述>        # Bug 修复
refactor/<重构内容>   # 代码重构
docs/<文档内容>       # 文档更新
```

---

## 🔗 参考命令

```bash
# 启动开发服务器
pnpm dev

# 数据库生成迁移文件
npm run db:generate

# 推送数据库变更
npm run db:push

# 数据库 Studio
npm run db:studio
```
