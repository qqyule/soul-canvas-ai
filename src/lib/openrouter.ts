/**
 * OpenRouter API 服务层
 * 封装图生图（img2img）的 API 调用
 * 使用 /chat/completions 端点 + modalities 参数生成图像
 *
 * 当前模式：前端直接请求 OpenRouter API
 */

// ==================== 配置 ====================

/** OpenRouter API 基础 URL */
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

/** 最大重试次数 */
const MAX_RETRIES = 1

/** 重试延迟时间（毫秒） */
const RETRY_DELAY_MS = 1000

/**
 * 获取 OpenRouter API Key
 * 从环境变量 VITE_OPENROUTER_API_KEY 读取
 */
const getApiKey = (): string => {
	const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
	if (!apiKey) {
		throw new Error(
			'VITE_OPENROUTER_API_KEY 环境变量未配置。请在 .env.local 文件中配置 OpenRouter API Key。'
		)
	}
	return apiKey
}

/**
 * @deprecated 当前使用前端直接请求模式，此函数已弃用
 * 如需恢复 Workers 代理模式，可重新启用此函数
 *
 * 获取 API 代理 URL
 * 使用 Cloudflare Worker 代理来保护 API Key
 */
const _getApiProxyUrl = (): string => {
	const url = import.meta.env.VITE_API_PROXY_URL
	if (!url) {
		throw new Error(
			'VITE_API_PROXY_URL 环境变量未配置。请参考 workers/README.md 部署 Cloudflare Worker 并配置环境变量。'
		)
	}
	return url
}

/** 获取图像生成模型 */
const getImageModel = (): string => {
	return (
		import.meta.env.VITE_OPENROUTER_IMAGE_MODEL ||
		'google/gemini-2.5-flash-image' // 使用支持图像输出的模型
	)
}

// ==================== 类型定义 ====================

/** 消息内容（文本） */
interface TextContent {
	type: 'text'
	text: string
}

/** 消息内容（图像） */
interface ImageContent {
	type: 'image_url'
	image_url: {
		url: string // URL 或 Base64 编码的图像
		detail?: 'auto' | 'low' | 'high'
	}
}

type ContentPart = TextContent | ImageContent

/** 聊天消息 */
interface ChatMessage {
	role: 'user' | 'assistant' | 'system'
	content: string | ContentPart[]
}

/** 图像配置选项（Gemini 模型支持） */
interface ImageConfig {
	aspect_ratio?:
		| '1:1'
		| '2:3'
		| '3:2'
		| '3:4'
		| '4:3'
		| '4:5'
		| '5:4'
		| '9:16'
		| '16:9'
		| '21:9'
	image_size?: '1K' | '2K' | '4K'
}

/** OpenRouter Chat Completions 请求 */
interface ChatCompletionsRequest {
	model: string
	messages: ChatMessage[]
	modalities?: string[] // 包含 "image" 以启用图像生成
	max_tokens?: number
	temperature?: number // 温度参数，控制随机性，0-2，默认 1
	image_config?: ImageConfig // 图像生成配置
	stream?: boolean
}

/** 响应中的图像项 */
interface ResponseImageItem {
	type: 'image_url'
	image_url: {
		url: string // Base64 data URL
	}
}

/** OpenRouter Chat Completions 响应 */
interface ChatCompletionsResponse {
	choices?: Array<{
		message?: {
			role?: string
			content?: string | ContentPart[]
			images?: ResponseImageItem[] // 生成的图像数组
		}
	}>
	error?: {
		message: string
		code?: string
	}
}

// ==================== 错误类型 ====================

/**
 * 网络错误类
 * 用于标识可重试的网络错误
 */
export class NetworkError extends Error {
	constructor(message: string, public readonly originalError?: Error) {
		super(message)
		this.name = 'NetworkError'
	}
}

/**
 * API 错误类
 * 用于标识不可重试的 API 错误
 */
export class APIError extends Error {
	constructor(message: string, public readonly statusCode?: number) {
		super(message)
		this.name = 'APIError'
	}
}

// ==================== 工具函数 ====================

/**
 * 延迟函数
 */
const delay = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 判断错误是否可重试
 */
const isRetryableError = (error: unknown): boolean => {
	// 网络错误可重试
	if (error instanceof NetworkError) return true
	// TypeError 通常是网络问题
	if (error instanceof TypeError) return true
	return false
}

// ==================== API 调用 ====================

/**
 * 图生图：基于草图生成艺术图像
 * 使用 Chat Completions API + modalities 参数进行图像生成
 *
 * @param sketchBase64 - Base64 编码的草图图片（含 data:image 前缀）
 * @param stylePrompt - 风格描述提示词
 * @param signal - 可选的 AbortSignal，用于取消请求
 * @returns 生成图像的 URL 或 Base64
 */
export async function generateImageFromSketch(
	sketchBase64: string,
	stylePrompt: string,
	signal?: AbortSignal
): Promise<string> {
	const apiKey = getApiKey()
	const model = getImageModel()

	// 构建完整的 prompt
	const fullPrompt = `Transform this sketch into: ${stylePrompt}, high quality, detailed, professional`

	// 构建多模态消息，包含草图图像和文本提示
	const messages: ChatMessage[] = [
		{
			role: 'user',
			content: [
				{
					type: 'image_url',
					image_url: {
						url: sketchBase64,
						detail: 'auto',
					},
				},
				{
					type: 'text',
					text: fullPrompt,
				},
			],
		},
	]

	const request: ChatCompletionsRequest = {
		model,
		messages,
		modalities: ['image', 'text'], // 启用图像生成
		max_tokens: 4096,
		temperature: 1.2, // 提高随机性和创意性
		stream: false, // 确保返回完整响应
	}

	// 带重试的 API 请求
	let lastError: Error | null = null
	let retryCount = 0

	while (retryCount <= MAX_RETRIES) {
		// 检查是否已取消
		if (signal?.aborted) {
			throw new DOMException('请求已取消', 'AbortError')
		}

		try {
			const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`,
					'HTTP-Referer': window.location.origin || 'https://soul-canvas.app',
					'X-Title': 'SoulCanvas AI',
				},
				body: JSON.stringify(request),
				signal, // 传递 AbortSignal
			})

			if (!response.ok) {
				const errorText = await response.text()
				// 5xx 错误可重试，4xx 错误不重试
				if (response.status >= 500) {
					throw new NetworkError(
						`服务器错误: ${response.status} - ${errorText}`
					)
				}
				throw new APIError(
					`图像生成失败: ${response.status} - ${errorText}`,
					response.status
				)
			}

			const data: ChatCompletionsResponse = await response.json()

			if (data.error) {
				throw new APIError(`图像生成错误: ${data.error.message}`)
			}

			// 成功，跳出循环继续处理响应
			return parseImageFromResponse(data)
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error))

			// 判断是否可重试
			if (isRetryableError(error) && retryCount < MAX_RETRIES) {
				retryCount++
				console.warn(
					`[OpenRouter] 请求失败，正在重试 (${retryCount}/${MAX_RETRIES})...`,
					error
				)
				await delay(RETRY_DELAY_MS)
				continue
			}

			// 不可重试或已达最大重试次数
			break
		}
	}

	// 重试失败，抛出最后的错误
	if (lastError) {
		throw lastError
	}

	throw new Error('未知错误')
}

/**
 * 从 API 响应中解析图像数据
 */
function parseImageFromResponse(data: ChatCompletionsResponse): string {
	// 解析响应，提取生成的图像
	const message = data.choices?.[0]?.message

	if (!message) {
		throw new Error('API 响应格式错误：未找到 message 字段')
	}

	// 1. 优先检查标准 images 字段 (OpenRouter/Gemini 视觉模型标准)

	if (
		message.images &&
		Array.isArray(message.images) &&
		message.images.length > 0
	) {
		const firstImage = message.images[0]
		if (firstImage.image_url?.url) {
			return firstImage.image_url.url
		}
	}

	const content = message.content

	// 2. 检查 content 是否为多模态数组 (部分模型返回格式)
	if (Array.isArray(content)) {
		for (const part of content) {
			if (part.type === 'image_url' && part.image_url?.url) {
				return part.image_url.url
			}
		}
		throw new Error('未在响应内容中找到图像数据')
	}

	// 3. 检查 content 是否为字符串 (需从文本中提取)
	if (typeof content === 'string') {
		const trimmedContent = content.trim()

		// 情况 A: 纯 URL 或 Base64
		if (
			trimmedContent.startsWith('http') ||
			trimmedContent.startsWith('data:image')
		) {
			return trimmedContent
		}

		// 情况 B: Markdown 图片语法 ![alt](url)
		const markdownMatch = trimmedContent.match(/!\[.*?\]\((.*?)\)/)
		if (markdownMatch && markdownMatch[1]) {
			return markdownMatch[1]
		}

		// 情况 C: 文本中包含 URL (http/https)
		// 排除结尾可能的标点符号
		const urlMatch = trimmedContent.match(
			/https?:\/\/[^\s"']+\.(png|jpg|jpeg|webp|gif)/i
		)
		if (urlMatch) {
			return urlMatch[0]
		}

		// 情况 D: 文本中包含 Base64 (较少见，但支持)
		const base64Match = trimmedContent.match(
			/data:image\/(?:png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+/i
		)
		if (base64Match) {
			return base64Match[0]
		}

		// 调试信息：如果模型拒绝生成或生成了纯文本
		const reasoning = (message as Record<string, unknown>)?.reasoning
		if (reasoning) {
			console.error('Model Reasoning:', reasoning)
		}

		throw new Error(
			`模型返回了文本但未检测到图像。响应内容预览: ${trimmedContent.substring(
				0,
				100
			)}...`
		)
	}

	throw new Error('无法解析 API 响应：未找到图像数据')
}
