# Soul Canvas AI

> 神笔马良：从简笔草图到 AI 创意作品的多模态画板。

[![CI](https://github.com/qqyule/soul-canvas-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/qqyule/soul-canvas-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646cff.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)

<div align="center">
  <img src="https://img.alicdn.com/imgextra/i3/O1CN01H1UU3i1Cti9lYtFrs_!!6000000000139-2-tps-7534-844.png" alt="Soul Canvas logo" width="600" />
</div>

Soul Canvas AI 是一款智能 AI 绘图应用。用户可以在画布上简单勾勒线条，应用会结合草图、提示词和风格预设生成高质量图像，并支持作品集、社区画廊、有声读物、PDF 导出和英雄卡片等创作流程。

本项目最初为阿里云 ESA Pages 边缘开发大赛作品，目前已开源，欢迎围绕 AI 创作体验、前端工程化、边缘代理和多模态交互继续共建。

## Highlights

- Sketch-to-image：简笔画、Prompt 和风格预设组合生成图像。
- 高可用 AI 链路：Kie.ai 主链路，OpenRouter fallback，多 API 节点策略。
- 创作工作流：批量变体、随机灵感、历史记录、作品集和社区 Remix。
- 多模态输出：有声读物、TTS 朗读、PDF 导出、英雄卡片 PNG 导出。
- 现代前端：React 18、Vite、TypeScript、Tailwind CSS、Radix UI、Framer Motion。
- 数据与认证：Neon PostgreSQL、Drizzle ORM、Clerk。
- 视觉体验：React Three Fiber 粒子背景、动态 Logo、沉浸式 Landing Page。

## Screenshots

<div align="center">
  <img src="public/CleanShot%202025-12-25%20at%2021.39.18@2x.png" alt="Soul Canvas canvas interface" width="48%" />
  <img src="public/CleanShot%202025-12-25%20at%2021.40.24@2x.png" alt="Soul Canvas generated result interface" width="48%" />
</div>

## Tech Stack

| Area | Stack |
| --- | --- |
| App | React 18, Vite 5, TypeScript |
| UI | Tailwind CSS, Radix UI, shadcn-style components, Lucide icons |
| State & data | TanStack Query, IndexedDB helpers, Drizzle ORM |
| Auth & database | Clerk, Neon PostgreSQL |
| AI services | Kie.ai, OpenRouter |
| 3D & motion | React Three Fiber, Three.js, Framer Motion |
| Testing & quality | Vitest, Testing Library, Biome |
| Edge proxy | Cloudflare Workers in `workers/` |

## Getting Started

### Prerequisites

- Node.js 18 or newer
- pnpm
- Optional service accounts: Kie.ai, OpenRouter, Clerk, Neon, S3-compatible storage

### Installation

```bash
git clone https://github.com/qqyule/soul-canvas-ai.git
cd soul-canvas-ai
pnpm install
cp .env.example .env.local
```

Fill in the variables you need in `.env.local`. For a minimal image-generation setup, start with:

```env
VITE_KIE_API_KEY=your_kie_api_key
VITE_KIE_IMAGE_API_VARIANT=edit
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
```

Then start the app:

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment Variables

See [.env.example](./.env.example) for the full list.

Important notes:

- `VITE_` variables are exposed to browser code by Vite.
- Do not put production-only secrets in frontend environment variables.
- For production API keys, use a Worker, serverless function, or backend proxy.
- The Cloudflare Worker proxy lives in [workers/](./workers).

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start local Vite dev server |
| `pnpm build` | Build production assets |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run Biome lint with auto-fix |
| `pnpm lint:check` | Run Biome lint without writing files |
| `pnpm format` | Format files with Biome |
| `pnpm format:check` | Check formatting without writing files |
| `pnpm typecheck` | Run TypeScript project references |
| `pnpm test:run` | Run Vitest once |
| `pnpm test:coverage` | Run Vitest with coverage |

## Project Structure

```text
.
├── src/                 # React application source
│   ├── components/      # UI and feature components
│   ├── hooks/           # React hooks
│   ├── lib/             # AI clients, storage, export, database helpers
│   ├── pages/           # Routed pages
│   ├── prompts/         # Prompt presets and style definitions
│   └── types/           # Shared TypeScript types
├── workers/             # Cloudflare Worker API proxy
├── docs/                # Development notes and project docs
├── public/              # Static assets
└── .github/             # Issue templates, PR template, CI
```

## Cloudflare Worker Proxy

The `workers/` package provides an optional API proxy for keeping provider secrets out of frontend code.

```bash
cd workers
pnpm install
pnpm dev
```

See [workers/README.md](./workers/README.md) for deployment and CORS configuration.

## Deployment

The frontend can be deployed to static hosting such as Aliyun ESA Pages, Cloudflare Pages, Vercel, Netlify, or any service that serves the `dist/` output.

```bash
pnpm build
```

Use:

- Build command: `pnpm build`
- Output directory: `dist`
- Node.js: 18+

## Contributing

Contributions are welcome. Start with [CONTRIBUTING.md](./CONTRIBUTING.md), and use the GitHub Issue templates for bugs or feature requests.

Before opening a PR, please run the relevant checks:

```bash
pnpm lint:check
pnpm typecheck
pnpm test:run
pnpm build
```

Security issues should be reported privately. See [SECURITY.md](./SECURITY.md).

## Roadmap

Current areas worth exploring:

- Safer production upload flow with server-side signed URLs.
- Better i18n support for Chinese and English interfaces.
- PWA offline support for sketch drafts and reading flows.
- More robust contributor docs around AI provider setup and deployment recipes.

## License

Released under the [MIT License](./LICENSE).

本项目由阿里云 ESA 提供加速、计算和保护。
