# 🚀 Neon 数据库集成 Walkthrough

本文档详细说明了神笔马良 2.0 中 Neon 数据库集成的实现细节。

## 🛠️ 技术栈

- **数据库**: Neon PostgreSQL (Serverless)
- **ORM**: Drizzle ORM
- **数据验证**: Zod (via `drizzle-zod`)
- **连接驱动**: `@neondatabase/serverless` (HTTP Driver)
- **测试框架**: Vitest

## 📁 目录结构

```bash
src/db/
├── index.ts              # 数据库连接入口 (单例 + 代理)
├── schema/               # 数据模型定义
│   ├── index.ts          # 统一导出
│   ├── users.ts          # 用户表
│   ├── artworks.ts       # 作品表
│   ├── custom-styles.ts  # 自定义风格表
│   ├── favorites.ts      # 收藏关联表
│   ├── generation-logs.ts # 生成日志表
│   └── validators.ts     # Zod 验证 Schema (兼容 Zod v4)
├── repositories/         # 数据访问层 (Repository Pattern)
│   ├── index.ts
│   ├── users.ts
│   ├── artworks.ts
│   └── generation-logs.ts
└── __tests__/            # 单元测试
    ├── validators.test.ts
    └── repositories.test.ts
```

## 🔐 环境变量配置

在 `.env.local` 中需要配置以下变量：

- `VITE_DATABASE_URL`: 用于前端和 Vite 插件的数据库 URL。
- `DATABASE_URL`: 用于 `drizzle-kit` 的数据库 URL（手动通过 `dotenv` 加载）。

## 🚀 常用命令

- `pnpm db:generate`: 生成迁移文件
- `pnpm db:push`: 将 Schema 推送到数据库
- `pnpm db:studio`: 启动 Drizzle Studio 可视化管理
- `pnpm test`: 运行单元测试

## ✨ 核心亮点

### 1. 完善的数据模型

定义了 5 张核心表，支持外键约束、自动更新时间戳和 UUID 主键。

### 2. 增强的数据验证

利用 `drizzle-zod` 自动生成 Zod Schema，并添加了中文错误提示、邮箱格式校验、长度限制等规则。特别修复了对 **Zod v4** 的兼容性问题。

### 3. Repository 模式

封装了常用的数据库操作，在执行数据库写入前强制执行 Zod 验证，确保数据一致性。

### 4. 自动化测试

建立了基于 Vitest 的测试环境，覆盖了所有的 Zod 验证逻辑和 Repository 的导出结构。

## ✅ 验证结果

- **类型检查**: `pnpm tsc --noEmit` 通过。
- **生产构建**: `pnpm build` 成功。
- **单元测试**: 28 个测试用例全部通过。
