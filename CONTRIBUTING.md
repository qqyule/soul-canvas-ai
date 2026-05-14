# Contributing to Soul Canvas

感谢你愿意参与 Soul Canvas。这个项目欢迎问题反馈、文档改进、Bug 修复和体验优化。

## 开始之前

- 请先阅读 [README.md](./README.md) 了解项目定位、技术栈和本地启动方式。
- 如果你要处理一个较大的功能，请先创建 Issue 讨论方案，避免重复劳动。
- 涉及安全问题时，请不要公开提交复现细节，参考 [SECURITY.md](./SECURITY.md)。

## 本地开发

项目使用 pnpm 作为主要包管理器。

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

常用命令：

```bash
pnpm lint:check
pnpm typecheck
pnpm test:run
pnpm build
```

## 分支与提交

推荐从 `main` 创建短生命周期分支：

```bash
git checkout main
git pull origin main
git checkout -b feat/your-feature
```

提交信息建议使用 Conventional Commits：

- `feat: add storybook audio controls`
- `fix: handle empty gallery response`
- `docs: improve setup guide`
- `chore: update development scripts`

## Pull Request 清单

提交 PR 前请确认：

- 变更范围聚焦，没有混入无关格式化。
- 新增或修改的用户流程已考虑加载、空状态和错误状态。
- 涉及环境变量时同步更新 `.env.example` 和 README。
- 已运行必要检查，并在 PR 中说明未运行的原因。
- 没有提交真实密钥、Token、数据库连接串或本地配置文件。

## 代码风格

- TypeScript 优先使用明确类型，避免新增 `any`。
- 组件保持小而清晰，优先复用现有 UI 组件和工具函数。
- 前端改动需要兼顾桌面端与移动端。
- 请求逻辑需要处理失败、超时和空数据。
- 不要在客户端暴露服务端密钥；生产环境请优先使用 Worker/API 代理。

## Issue 反馈建议

Bug 反馈请尽量包含：

- 问题描述与期望结果。
- 复现步骤。
- 浏览器、设备和系统信息。
- 控制台错误、截图或录屏。

功能建议请尽量说明：

- 想解决的具体使用场景。
- 现有替代方案为什么不够好。
- 你期望的交互或 API 形态。
