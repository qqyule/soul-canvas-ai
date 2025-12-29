/**
 * AI 业务逻辑层
 * 图生图风格转换流程
 */

import { generateImageFromSketch } from './openrouter'
import type { StylePreset, GenerationResult } from '@/types/canvas'

// ==================== 类型定义 ====================

/** AI 服务错误 */
export class AIServiceError extends Error {
	constructor(message: string, public readonly originalError?: Error) {
		super(message)
		this.name = 'AIServiceError'
	}
}

// ==================== 核心函数 ====================

/**
 * 从草图生成艺术图像
 * 直接使用图生图模式进行风格转换
 *
 * @param sketchDataUrl - Base64 编码的草图（含 data:image 前缀）
 * @param style - 用户选择的风格预设
 * @param signal - 可选的 AbortSignal，用于取消请求
 * @returns 生成结果对象
 */
export async function generateFromSketch(
	sketchDataUrl: string,
	style: StylePreset,
	userPrompt?: string,
	signal?: AbortSignal
): Promise<GenerationResult> {
	let generatedImageUrl: string
	try {
		generatedImageUrl = await generateImageFromSketch(
			sketchDataUrl,
			style.prompt,
			userPrompt,
			signal
		)
	} catch (error) {
		// 如果是取消请求，直接抛出不包装
		if (error instanceof DOMException && error.name === 'AbortError') {
			throw error
		}
		throw new AIServiceError(
			'图像生成失败，请稍后重试',
			error instanceof Error ? error : undefined
		)
	}

	// 构建返回结果
	const result: GenerationResult = {
		id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		sketchDataUrl,
		generatedImageUrl,
		prompt: userPrompt ? `${userPrompt} (风格: ${style.nameZh})` : style.prompt,
		style,
		createdAt: new Date(),
	}

	return result
}
