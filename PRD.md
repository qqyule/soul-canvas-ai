# 产品需求文档 (PRD) - 神笔马良 MVP

> 这份文档是为您量身定制的 **《神笔马良 (AI Sketch-to-Image) MVP 产品需求文档 (PRD)》**。它结合了 Next.js 16+ 的最新特性、Supabase 的后端能力以及 OpenRouter 的 AI 聚合接口，旨在打造一个专业、流畅且具有现代感的企业级应用。

| 字段     | 内容                                              |
| -------- | ------------------------------------------------- |
| 文档版本 | V1.1                                              |
| 文档状态 | 草稿                                              |
| 撰写日期 | 2025-12-25                                        |
| 项目代号 | 神笔马良                                          |
| 应用名称 | 神笔马良                                          |
| Slogan   | 一笔成画，AI 帮你实现                             |
| 技术栈   | Next.js 16 (App Router), Supabase, OpenRouter API |

---

## 1. 项目背景与目标 (Background & Objectives)

### 1.1 项目背景

当前的 AI 图片生成工具（如 Midjourney）通常依赖复杂的文本提示词（Prompt），对于普通用户存在门槛。用户往往脑海中有画面，但难以用文字精准描述。通过"简笔画 + AI 识别 + 风格化生成"的模式，可以将用户的视觉直觉直接转化为高质量图像。

### 1.2 核心目标 (MVP)

- **低门槛创作**：用户无需输入任何文字，仅需简单的涂鸦即可生成专业图像。
- **极致交互**：提供丝滑的画板体验和现代化的视觉反馈。
- **快速验证**：基于 Next.js 16 和 Supabase 快速构建 MVP，验证"草图生图"的市场需求。

---

## 2. 用户角色与流程 (User Personas & Flow)

### 2.1 目标用户

- **创意工作者**：寻找灵感的设计师、插画师。
- **普通大众**：想要体验 AI 绘画但不懂提示词的用户。
- **儿童/学生**：进行绘画教育或娱乐。

### 2.2 核心用户路径

1. **进入首页**：无需登录，直接看到全屏画板和应用名称「神笔马良」。
2. **选择风格**：在侧边栏/悬浮窗选择目标风格（如：3D 渲染、Logo 设计）。
3. **绘制草图**：在画板上勾勒线条（如画一个圆圈和几条线代表太阳）。
4. **点击生成**：触发 AI 识别与生成流程（每日限制 20 次）。
5. **结果展示**：AI 识别出"太阳"，并结合所选风格生成高清图。
6. **下载/查看历史**：直接下载生成的图片，或在本地历史记录中查看。

---

## 3. 功能需求说明 (Functional Requirements)

### 3.1 智能画板模块 (The Canvas)

#### 基础绘图工具

- 画笔（支持压感模拟，默认黑色）
- 橡皮擦
- 撤销 (Undo) / 重做 (Redo)
- 清空画板 (Clear)

#### 交互要求

- 使用 HTML5 Canvas（推荐 `react-sketch-canvas` 或 `fabric.js`）
- 响应式设计，支持 PC 端鼠标绘制和移动端手指触控
- 防误触：移动端需处理手势冲突

### 3.2 风格选择器 (Style Selector)

#### 预设风格库

提供 4-6 个 MVP 核心风格：

- Logo 设计
- 超写实摄影
- 扁平化 SVG 图标
- 吉卜力动漫风格
- 赛博朋克

#### UI 表现

- 使用带缩略图的卡片或药丸状 (Pill) 按钮
- 选中时具有微动效（缩放或光晕）

### 3.3 AI 核心处理流 (The Brain - OpenRouter Integration)

这是系统的核心逻辑，分为两步（或使用支持图生图的模型）：

#### 阶段一：视觉识别 (Vision Analysis)

- **输入**：画板内容的 Base64 图片
- **模型调用**：通过 OpenRouter 调用具备视觉能力的模型（如 GPT-4o, Claude 3.5 Sonnet, 或 Gemini 1.5 Pro）
- **System Prompt**：

  > "分析这张简笔画，用简短的英文描述画面主体和构图。不要通过'这是一张画'来描述，直接描述内容，例如：'A simple sketch of a horse running in a field'. 仅输出描述词。"

#### 阶段二：图像生成 (Image Generation)

- **输入**：阶段一生成的描述词 + 用户选择的风格 Prompt 后缀
- **模型调用**：通过 OpenRouter 调用生图模型（如 Flux.1, Stable Diffusion XL, 或 DALL-E 3）
- **输出**：生成图片的 URL

### 3.4 结果展示与历史记录

#### 生成对比

采用"滑块对比" (Before/After Slider) 效果，左边是用户的草图，右边是 AI 生成图，增强视觉冲击力。

#### 图片下载

- 生成完成后提供「下载」按钮，支持直接下载 PNG/JPG 格式图片
- 无需登录即可下载

#### 本地历史记录 (Gallery)

- 使用浏览器 `localStorage` 存储用户的生成历史
- 支持查看历史记录列表（缩略图 + 生成时间 + 风格）
- 支持从历史记录中重新下载或删除
- 存储上限：最多保留最近 50 条记录

### 3.5 每日生成限制

#### 限制规则

- 每位用户每日最多生成 **20 次**
- 使用浏览器指纹 + `localStorage` 记录当日使用次数
- 次数在每日 00:00 (本地时间) 自动重置

#### UI 反馈

- 在生成按钮附近显示剩余次数（如：「今日剩余 15/20 次」）
- 达到限制时弹出提示弹窗，告知用户「今日生成次数已用完，请明天再来」
- 弹窗可包含分享引导或其他互动内容

---

## 4. UI/UX 交互设计要求 (Design Requirements)

### 4.1 视觉风格

#### 配色

- **主色调**：深邃黑/灰背景 (Dark Mode default) 以突出画板内容的白色/霓虹色
- **强调色**：使用渐变紫或电光蓝 (Electric Blue) 作为"生成"按钮的主色

#### 组件库

推荐使用 **Shadcn/UI + Tailwind CSS**，保证企业级的一致性。

### 4.2 动效 (Animation)

#### 技术栈

Framer Motion

#### 关键动效

- **生成中**：点击生成后，画板线条出现"流光"效果，或显示 AI 正在"思考"的进度条（识别中 → 构思中 → 渲染中）
- **结果出现**：图片生成后，不要生硬弹出，而是从中心淡入，或使用 LayoutId 进行平滑过渡

---

## 5. 技术架构 (Technical Architecture)

### 5.1 前端 (Next.js 16)

- **App Router**：全面采用 App Router 架构
- **Server Actions**：所有的 API Key (OpenRouter, Supabase Service Role) 必须在服务端调用，严禁暴露在前端。使用 Server Actions 处理 `submitSketch()` 请求
- **Streaming**：如果 OpenRouter 支持流式返回进度，前端需实时展示

### 5.2 后端 (Supabase)

> **注意**：MVP 阶段暂不需要用户登录功能，历史记录存储在浏览器本地。

#### Database (PostgreSQL)

- `generations`: 存储生成记录（用于统计和分析）
  - 字段：`input_sketch_url`, `output_image_url`, `prompt`, `style`, `created_at`, `client_fingerprint`

#### Storage

- **Bucket `sketches`**: 存储用户上传的 Base64 草图（转换为 PNG）
- **Bucket `results`**: 存储 AI 生成的图片（持久化）

### 5.3 前端本地存储 (localStorage)

使用浏览器 `localStorage` 存储以下数据：

```typescript
interface LocalStorageSchema {
	// 历史生成记录
	generations: Array<{
		id: string
		sketchDataUrl: string // Base64 草图缩略图
		resultUrl: string // 生成结果图片 URL
		style: string // 使用的风格
		createdAt: string // ISO 时间戳
	}>

	// 每日使用次数
	dailyUsage: {
		date: string // YYYY-MM-DD 格式
		count: number // 当日已使用次数
	}
}
```

### 5.4 接口定义 (Server Action 伪代码)

```typescript
// actions/generate.ts
'use server'

export async function generateImageFromSketch(formData: FormData) {
	// 1. 验证每日使用限制（通过客户端指纹）
	// 2. 上传草图到 Supabase Storage
	// 3. 调用 OpenRouter Vision API (识别草图内容)
	// 4. 构建最终 Prompt (识别内容 + 风格预设)
	// 5. 调用 OpenRouter Image API (Flux/SDXL)
	// 6. 将结果存入 Supabase Database (用于统计)
	// 7. 返回图片 URL 给前端
}
```

---

## 6. 非功能性需求 (Non-Functional Requirements)

### 性能

- 首页加载速度 (FCP) < 1.0s
- 图片生成等待时间需有良好的 Loading 占位，避免用户焦虑

### 安全性

- **Rate Limiting**：限制单 IP 的每分钟生成次数，防止 API 额度被刷爆（利用 Upstash Redis 或 Supabase Edge Functions）
- **每日限制**：每位用户每日最多生成 20 次，使用浏览器指纹 + localStorage 进行限制
- **防刷机制**：结合 IP 限制和浏览器指纹，防止恶意刷取 API 额度

### 兼容性

- 必须完美适配 Mobile Web
- Canvas 需支持 Touch 事件

---

## 7. 实施路线图 (Roadmap)

| 阶段                   | 目标                                                            |
| ---------------------- | --------------------------------------------------------------- |
| **Phase 1 (原型)**     | 搭建 Next.js + Canvas，调通 OpenRouter 接口，仅在控制台输出结果 |
| **Phase 2 (MVP 核心)** | 完成 UI 开发，集成 Supabase 存储，实现"画图 → 生成 → 展示"闭环  |
| **Phase 3 (优化)**     | 增加动画效果 (Framer Motion)，优化 Prompt 工程以提高识别准确率  |
| **Phase 4 (发布)**     | 部署到 Vercel，配置域名，开启正式数据库                         |
