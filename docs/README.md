# 开发文档索引

这里收集 Soul Canvas AI 的开发说明、历史规划和工程记录。新贡献者建议先读根目录 [README](../README.md) 和 [CONTRIBUTING](../CONTRIBUTING.md)。

## 📁 文档目录

| 文档                                 | 描述                                               | 更新日期   |
| ------------------------------------ | -------------------------------------------------- | ---------- |
| [开发指南](./DEV-GUIDE.md)           | 项目技术栈、开发流程和功能模块说明                 | 2026-01-05 |
| [分支管理](./BRANCH-MANAGEMENT.md)   | 开发分支与功能的对应关系，分支命名规范             | 2026-01-03 |
| [Neon 数据库 walkthrough](./WALKTHROUGH-NEON-DB.md) | Neon 与 Drizzle 相关配置说明        | -          |
| [Code Review 记录](./CODE-REVIEW-2.0.md) | 2.0 阶段代码审查记录                         | -          |

---

## 🔗 快速链接

### GitHub

- [Issues](https://github.com/qqyule/soul-canvas-ai/issues)
- [Pull Requests](https://github.com/qqyule/soul-canvas-ai/pulls)
- [贡献指南](../CONTRIBUTING.md)
- [安全披露](../SECURITY.md)

### 技术栈文档

- [React 18 文档](https://react.dev/)
- [Vite 5 文档](https://vite.dev/)
- [Tailwind CSS 3 文档](https://tailwindcss.com/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Neon 文档](https://neon.tech/docs)
- [Three.js 文档](https://threejs.org/docs/)

---

## 本地质量检查

```bash
pnpm lint:check
pnpm typecheck
pnpm test:run
pnpm build
```

---

## 📅 更新日志

| 日期       | 更新内容           |
| ---------- | ------------------ |
| 2026-05-14 | 更新开源贡献入口与文档索引 |
| 2026-01-03 | 初始化开发文档索引 |
