/**
 * ElevenLabs TTS 客户端
 * 通过 Kie.ai 代理调用 ElevenLabs 多语言 TTS API
 *
 * @description 支持中文、英文、日语、韩语等多语言配音
 * @see https://docs.kie.ai/market/elevenlabs/text-to-speech-multilingual-v2
 */

import type {
	KieCreateTaskResponse,
	KieTaskResultResponse,
} from '@/types/api-node'

// ==================== 配置 ====================

/** kie.ai API 基础 URL */
const KIE_BASE_URL =
	import.meta.env.VITE_KIE_BASE_URL || 'https://api.kie.ai/api/v1'

/** ElevenLabs TTS 模型 */
const TTS_MODEL = 'elevenlabs/text-to-speech-multilingual-v2'

/** 轮询配置 */
const POLL_CONFIG = {
	/** 首次延迟（ms） */
	initialDelay: 1000,
	/** 轮询间隔（ms） */
	interval: 2000,
	/** 最大轮询时间（ms） */
	maxTimeout: 60000,
}

// ==================== 类型定义 ====================

/**
 * TTS 声音选项
 */
export type TTSVoice =
	| 'Rachel' // 英文女声
	| 'Adam' // 英文男声
	| 'Antoni' // 英文男声
	| 'Bella' // 英文女声
	| 'Domi' // 英文女声
	| 'Elli' // 英文女声
	| 'Josh' // 英文男声
	| 'Arnold' // 英文男声
	| 'Sam' // 英文男声
	| 'Charlotte' // 英文女声（温柔）
	| 'Daniel' // 英文男声（深沉）

/**
 * TTS 请求参数
 */
export interface TTSRequest {
	/** 要转换的文本 */
	text: string
	/** 声音选择 */
	voice?: TTSVoice
	/** 语言代码（如 zh、en、ja、ko） */
	languageCode?: string
	/** 语音稳定性（0-1，默认 0.5） */
	stability?: number
	/** 相似度增强（0-1，默认 0.75） */
	similarityBoost?: number
	/** 语速（0.5-2，默认 1） */
	speed?: number
}

/**
 * TTS 结果
 */
export interface TTSResult {
	/** 音频 URL */
	audioUrl: string
	/** 任务 ID */
	taskId: string
}

// ==================== 工具函数 ====================

/**
 * 获取 kie.ai API Key
 */
const getKieApiKey = (): string => {
	const apiKey = import.meta.env.VITE_KIE_API_KEY
	if (!apiKey) {
		throw new Error('VITE_KIE_API_KEY 环境变量未配置')
	}
	return apiKey
}

/**
 * 延迟函数
 */
const delay = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 根据语言代码获取推荐的声音
 */
export const getRecommendedVoice = (languageCode: string): TTSVoice => {
	// ElevenLabs 的中文支持较好的声音
	switch (languageCode) {
		case 'zh-CN':
		case 'zh-TW':
		case 'zh':
			return 'Charlotte' // Charlotte 对中文支持较好
		case 'ja-JP':
		case 'ja':
			return 'Bella' // Bella 对日语支持较好
		case 'ko-KR':
		case 'ko':
			return 'Elli' // Elli 对韩语支持较好
		default:
			return 'Rachel' // 默认英文女声
	}
}

/**
 * 将语言代码转换为 ISO639-1 格式
 * ElevenLabs 需要 ISO639-1 格式（如 "zh" 而不是 "zh-CN"）
 */
const toISO639LanguageCode = (code: string): string => {
	const mapping: Record<string, string> = {
		'zh-CN': 'zh',
		'zh-TW': 'zh',
		'ja-JP': 'ja',
		'ko-KR': 'ko',
		'en-US': 'en',
		'en-GB': 'en',
	}
	return mapping[code] || code.split('-')[0] || code
}

// ==================== API 调用 ====================

/**
 * 创建 TTS 任务
 */
async function createTTSTask(
	params: TTSRequest,
	signal?: AbortSignal
): Promise<string> {
	const apiKey = getKieApiKey()

	const request = {
		model: TTS_MODEL,
		input: {
			text: params.text,
			voice: params.voice || getRecommendedVoice(params.languageCode || 'en'),
			stability: params.stability ?? 0.5,
			similarity_boost: params.similarityBoost ?? 0.75,
			style: 0,
			speed: params.speed ?? 1,
			timestamps: false,
			previous_text: '',
			next_text: '',
			language_code: toISO639LanguageCode(params.languageCode || ''),
		},
	}

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
		throw new Error(`TTS 任务创建失败: ${response.status} - ${errorText}`)
	}

	const data: KieCreateTaskResponse = await response.json()

	if (data.code !== 200) {
		throw new Error(`TTS 任务创建失败: ${data.msg}`)
	}

	return data.data.taskId
}

/**
 * 查询 TTS 任务结果
 */
async function getTTSTaskResult(
	taskId: string,
	signal?: AbortSignal
): Promise<KieTaskResultResponse> {
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
		throw new Error(`查询 TTS 任务失败: ${response.status} - ${errorText}`)
	}

	return response.json()
}

/**
 * 轮询 TTS 任务结果直到完成
 */
async function pollTTSResult(
	taskId: string,
	signal?: AbortSignal
): Promise<string> {
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
			throw new Error(`TTS 任务超时，已等待 ${elapsed}ms`)
		}

		// 查询任务状态
		const result = await getTTSTaskResult(taskId, signal)

		if (result.data.state === 'success') {
			// 从 resultJson 中提取音频 URL
			if (result.data.resultJson) {
				try {
					const parsed = JSON.parse(result.data.resultJson) as {
						resultUrls?: string[]
						audioUrl?: string
					}
					// 尝试多种可能的返回格式
					const audioUrl = parsed.audioUrl || parsed.resultUrls?.[0]
					if (audioUrl) {
						return audioUrl
					}
				} catch (e) {
					console.warn('[TTS] 解析 resultJson 失败:', e)
				}
			}

			throw new Error('TTS 任务完成但未返回音频 URL')
		}

		if (result.data.state === 'failed') {
			throw new Error(`TTS 任务失败: ${result.data.failMsg || '未知错误'}`)
		}

		// 等待后继续轮询
		await delay(POLL_CONFIG.interval)
	}
}

// ==================== 公开 API ====================

/**
 * 生成语音
 * @param params TTS 请求参数
 * @param signal 取消信号
 * @returns 包含音频 URL 的结果
 */
export async function generateSpeech(
	params: TTSRequest,
	signal?: AbortSignal
): Promise<TTSResult> {
	// 创建任务
	const taskId = await createTTSTask(params, signal)

	// 轮询结果
	const audioUrl = await pollTTSResult(taskId, signal)

	return {
		audioUrl,
		taskId,
	}
}

/**
 * 批量生成语音（用于绘本多页配音）
 * @param pages 包含文本的页面数组
 * @param languageCode 语言代码
 * @param voice 声音选择
 * @param signal 取消信号
 * @returns 音频 URL 数组
 */
export async function generateSpeechBatch(
	pages: Array<{ text: string }>,
	languageCode: string,
	voice?: TTSVoice,
	signal?: AbortSignal
): Promise<string[]> {
	const results: string[] = []

	for (const page of pages) {
		if (signal?.aborted) {
			throw new DOMException('请求已取消', 'AbortError')
		}

		const result = await generateSpeech(
			{
				text: page.text,
				voice: voice || getRecommendedVoice(languageCode),
				languageCode,
			},
			signal
		)

		results.push(result.audioUrl)
	}

	return results
}
