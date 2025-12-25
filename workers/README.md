# Soul Canvas API Proxy

这是一个 Cloudflare Worker，用于代理 OpenRouter API 请求，保护 API Key 不暴露在前端代码中。

## 前置条件

1. 注册 [Cloudflare 账号](https://dash.cloudflare.com/sign-up)（免费）
2. 安装 Node.js 18+

## 快速开始

### 1. 安装依赖

```bash
cd workers
pnpm install
```

### 2. 登录 Cloudflare

```bash
pnpm wrangler login
```

这会打开浏览器让你授权 Wrangler CLI。

### 3. 配置 API Key

**重要**：不要将 API Key 写入代码或配置文件！

```bash
pnpm wrangler secret put OPENROUTER_API_KEY
```

输入你的 OpenRouter API Key，它会被安全地存储在 Cloudflare。

### 4. 本地开发

```bash
pnpm dev
```

Worker 会在 `http://localhost:8787` 启动。

### 5. 部署到 Cloudflare

```bash
pnpm deploy
```

部署成功后会显示 Worker URL，类似：

```
https://soul-canvas-api.your-subdomain.workers.dev
```

## 配置前端

部署后，在前端项目的 `.env` 文件中配置：

```env
VITE_API_PROXY_URL=https://soul-canvas-api.your-subdomain.workers.dev
```

## 配置 CORS（重要）

部署到 GitHub Pages 后，需要更新 `wrangler.toml` 中的 `ALLOWED_ORIGINS`：

```toml
[vars]
ALLOWED_ORIGINS = "https://your-username.github.io,http://localhost:5173"
```

然后重新部署：

```bash
pnpm deploy
```

## 常用命令

| 命令                        | 说明                 |
| --------------------------- | -------------------- |
| `pnpm dev`                  | 本地开发             |
| `pnpm deploy`               | 部署到 Cloudflare    |
| `pnpm tail`                 | 查看实时日志         |
| `pnpm wrangler secret list` | 查看已配置的 secrets |

## 故障排除

### 403 错误：不允许的来源

检查 `wrangler.toml` 中的 `ALLOWED_ORIGINS` 是否包含你的前端域名。

### 500 错误：API Key 未配置

运行 `pnpm wrangler secret put OPENROUTER_API_KEY` 配置 API Key。

### CORS 错误

确保前端请求的是正确的 Worker URL，且 `ALLOWED_ORIGINS` 配置正确。
