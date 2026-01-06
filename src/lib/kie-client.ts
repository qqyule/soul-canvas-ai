/**
 * kie.ai API 客户端
 * 封装异步任务模式的图像生成 API
 *
 * 官方文档: https://docs.kie.ai/market/google/nano-banana-edit
 */

import { buildFinalPrompt } from '@/prompts'
import type {
	APIClient,
	ImageGenerationParams,
	KieCreateTaskRequest,
	KieCreateTaskResponse,
	KieTaskResultResponse,
} from '@/types/api-node'
import { isS3Configured, uploadImageToS3 } from './s3-upload'

// ==================== 配置 ====================

/** kie.ai API 基础 URL */
const KIE_BASE_URL = import.meta.env.VITE_KIE_BASE_URL || 'https://api.kie.ai/api/v1'

/** 默认模型 */
const KIE_MODEL = import.meta.env.VITE_KIE_IMAGE_MODEL || 'google/nano-banana-edit'

/** 轮询配置 */
const POLL_CONFIG = {
	/** 首次延迟（ms） */
	initialDelay: 2000,
	/** 轮询间隔（ms） */
	interval: 3000,
	/** 最大轮询时间（ms） */
	maxTimeout: 60000,
}

// ==================== 工具函数 ====================

/**
 * 获取 kie.ai API Key
 */
const getKieApiKey = (): string => {
	const apiKey = import.meta.env.VITE_KIE_API_KEY
	if (!apiKey) {
		throw new Error('VITE_KIE_API_KEY 环境变量未配置。请在 .env.local 文件中配置 kie.ai API Key。')
	}
	return apiKey
}

/**
 * 延迟函数
 */
const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 将 Base64 图像上传到 S3 并返回公开 URL
 * kie.ai API 需要图像 URL，不支持 Base64 直接传递
 */
const prepareImageUrl = async (base64DataUrl: string): Promise<string> => {
	// 检查 S3 是否已配置
	if (!isS3Configured()) {
		throw new Error('S3 未配置。kie.ai 需要图像 URL，请在 .env.local 中配置 S3 相关环境变量。')
	}

	// 上传到 S3 并返回 URL

	const imageUrl = await uploadImageToS3(base64DataUrl)

	return imageUrl
}

// ==================== 错误类型 ====================

/**
 * kie.ai API 错误
 */
export class KieAPIError extends Error {
	constructor(
		message: string,
		public readonly code?: number
	) {
		super(message)
		this.name = 'KieAPIError'
	}
}

/**
 * 任务超时错误
 */
export class TaskTimeoutError extends Error {
	constructor(
		public readonly taskId: string,
		public readonly elapsedMs: number
	) {
		super(`任务 ${taskId} 超时，已等待 ${elapsedMs}ms`)
		this.name = 'TaskTimeoutError'
	}
}

// ==================== API 调用 ====================

/**
 * 创建图像生成任务
 */
async function createTask(request: KieCreateTaskRequest, signal?: AbortSignal): Promise<string> {
	const apiKey = getKieApiKey()

	const response = await fetch(`${KIE_BASE_URL}/jobs/createTask`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify(request),
		signal,
	})

	if (!response.ok) {
		const errorText = await response.text()
		throw new KieAPIError(`创建任务失败: ${response.status} - ${errorText}`, response.status)
	}

	const data: KieCreateTaskResponse = await response.json()

	if (data.code !== 200) {
		throw new KieAPIError(`创建任务失败: ${data.msg}`, data.code)
	}

	return data.data.taskId
}

/**
 * 查询任务结果
 */
async function getTaskResult(taskId: string, signal?: AbortSignal): Promise<KieTaskResultResponse> {
	const apiKey = getKieApiKey()

	const response = await fetch(
		`${KIE_BASE_URL}/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`,
		{
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
			signal,
		}
	)

	if (!response.ok) {
		const errorText = await response.text()
		throw new KieAPIError(`查询任务失败: ${response.status} - ${errorText}`, response.status)
	}

	return response.json()
}

/**
 * 轮询任务结果直到完成
 */
async function pollTaskResult(taskId: string, signal?: AbortSignal): Promise<string> {
	const startTime = Date.now()

	// 首次延迟
	await delay(POLL_CONFIG.initialDelay)

	while (true) {
		// 检查是否已取消
		if (signal?.aborted) {
			throw new DOMException('请求已取消', 'AbortError')
		}

		// 检查是否超时
		const elapsed = Date.now() - startTime
		if (elapsed > POLL_CONFIG.maxTimeout) {
			throw new TaskTimeoutError(taskId, elapsed)
		}

		// 查询任务状态
		const result = await getTaskResult(taskId, signal)

		if (result.data.state === 'success') {
			// 从 resultJson 中提取图片 URL
			if (result.data.resultJson) {
				try {
					const parsed = JSON.parse(result.data.resultJson) as {
						resultUrls?: string[]
					}
					if (parsed.resultUrls && parsed.resultUrls.length > 0) {
						return parsed.resultUrls[0]
					}
				} catch (e) {
					console.warn('[kie.ai] 解析 resultJson 失败:', e)
				}
			}

			throw new KieAPIError('任务完成但未返回图像')
		}

		if (result.data.state === 'failed') {
			throw new KieAPIError(`任务失败: ${result.data.failMsg || '未知错误'}`)
		}

		// 等待后继续轮询
		await delay(POLL_CONFIG.interval)
	}
}

/**
 * 测试 kie.ai 连通性
 * 使用 credit 查询接口
 */
async function pingKie(): Promise<number> {
	const apiKey = getKieApiKey()
	const startTime = performance.now()

	const response = await fetch(`${KIE_BASE_URL}/chat/credit`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
		signal: AbortSignal.timeout(5000),
	})

	const latency = performance.now() - startTime

	if (!response.ok) {
		throw new KieAPIError(`测速失败: ${response.status}`, response.status)
	}

	return latency
}

// ==================== 统一客户端接口 ====================

/**
 * 创建 kie.ai API 客户端
 */
export function createKieClient(): APIClient {
	return {
		id: 'kie',

		async generateImage(params: ImageGenerationParams): Promise<string> {
			const { sketchDataUrl, stylePrompt, userPrompt, signal } = params

			// 准备图像 URL
			const imageUrl = await prepareImageUrl(sketchDataUrl)

			// 构建完整提示词
			const fullPrompt = buildFinalPrompt(stylePrompt, userPrompt)

			// 创建任务请求
			const request: KieCreateTaskRequest = {
				model: KIE_MODEL,
				input: {
					prompt: fullPrompt,
					image_urls: [imageUrl],
					output_format: 'png',
					image_size: '1:1',
				},
			}

			// 创建任务
			const taskId = await createTask(request, signal)

			// 轮询结果
			return pollTaskResult(taskId, signal)
		},

		async ping(): Promise<number> {
			return pingKie()
		},
	}
}

// ==================== 导出 ====================

export { pingKie, createTask, pollTaskResult, getTaskResult }
