/**
 * OpenRouter API 服务层
 * 封装图生图（img2img）的 API 调用
 * 使用 /chat/completions 端点 + modalities 参数生成图像
 *
 * 注意：API 请求通过 Cloudflare Worker 代理，保护 API Key 不暴露在前端
 */

// ==================== 配置 ====================

/**
 * 获取 API 代理 URL
 * 使用 Cloudflare Worker 代理来保护 API Key
 */
const getApiProxyUrl = (): string => {
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

// ==================== API 调用 ====================

/**
 * 图生图：基于草图生成艺术图像
 * 使用 Chat Completions API + modalities 参数进行图像生成
 *
 * @param sketchBase64 - Base64 编码的草图图片（含 data:image 前缀）
 * @param stylePrompt - 风格描述提示词
 * @returns 生成图像的 URL 或 Base64
 */
export async function generateImageFromSketch(
	sketchBase64: string,
	stylePrompt: string
): Promise<string> {
	const apiProxyUrl = getApiProxyUrl()
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
		stream: false, // 确保返回完整响应
	}

	// 通过 Cloudflare Worker 代理发送请求（不需要在前端传递 API Key）
	const response = await fetch(`${apiProxyUrl}/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(request),
	})

	if (!response.ok) {
		const errorText = await response.text()

		throw new Error(`图像生成失败: ${response.status} - ${errorText}`)
	}

	const data: ChatCompletionsResponse = await response.json()

	if (data.error) {
		throw new Error(`图像生成错误: ${data.error.message}`)
	}

	// 解析响应，提取生成的图像
	const message = data.choices?.[0]?.message

	// ====== 优先检查 images 字段（OpenRouter 官方文档指定的格式）======
	if (message?.images && message.images.length > 0) {
		const firstImage = message.images[0]
		if (firstImage.image_url?.url) {
			return firstImage.image_url.url
		}
	}

	// ====== 备用：检查 content 字段 ======
	const content = message?.content

	// 检查是否有图像数据
	if (!content || (typeof content === 'string' && content.trim() === '')) {
		// 尝试从其他字段提取信息
		const reasoning = (message as Record<string, unknown>)?.reasoning
		if (reasoning) {
			throw new Error(
				'当前模型未能生成图像。请检查 VITE_OPENROUTER_IMAGE_MODEL 配置，建议使用支持图像生成的模型如 google/gemini-2.5-flash-image-preview'
			)
		}
		throw new Error('图像生成返回空结果。请确认模型支持图像生成功能。')
	}

	// 如果响应是字符串
	if (typeof content === 'string') {
		// 检查是否是 base64 数据 URL
		if (content.startsWith('data:image')) {
			return content
		}
		// 检查是否是 URL
		if (content.startsWith('http')) {
			return content
		}
		// 尝试检测内嵌的 base64 数据
		const base64Match = content.match(
			/data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+/
		)
		if (base64Match) {
			return base64Match[0]
		}
		// 尝试检测 URL
		const urlMatch = content.match(
			/https?:\/\/[^\s"']+\.(png|jpg|jpeg|webp|gif)/i
		)
		if (urlMatch) {
			return urlMatch[0]
		}

		throw new Error(
			`图像生成返回格式不正确。模型返回了文本但不是图像。请确认使用的模型 (${getImageModel()}) 支持图像生成输出。`
		)
	}

	// 如果是内容数组，查找图像部分
	for (const part of content) {
		if (part.type === 'image_url' && part.image_url?.url) {
			return part.image_url.url
		}
	}

	throw new Error(
		`图像生成返回格式不正确：未找到图像数据。请确认模型 (${getImageModel()}) 支持图像生成。`
	)
}
