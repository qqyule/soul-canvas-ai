/**
 * AI 业务逻辑层
 * 图生图风格转换流程
 *
 * 支持多 API 节点切换：
 * - 主节点：kie.ai（异步任务模式）
 * - 备用节点：OpenRouter（同步模式）
 */

import { generateImageWithFallback } from './api-client-factory'
import { getNodeManager } from './api-node-manager'
import type { StylePreset, GenerationResult } from '@/types/canvas'

// ==================== 类型定义 ====================

/** AI 服务错误 */
export class AIServiceError extends Error {
	constructor(message: string, public readonly originalError?: Error) {
		super(message)
		this.name = 'AIServiceError'
	}
}

// ==================== 初始化 ====================

/**
 * 初始化节点管理器
 * 应在应用启动时调用，预先测速所有节点
 */
export async function initializeAIService(): Promise<void> {
	try {
		const manager = getNodeManager()
		await manager.pingAllNodes()
		console.log('[AIService] 节点管理器初始化完成')
	} catch (error) {
		console.warn('[AIService] 节点初始化失败，将在首次请求时重试:', error)
	}
}

// ==================== 核心函数 ====================

/**
 * 从草图生成艺术图像
 * 使用多节点策略，自动选择最优节点并支持故障转移
 *
 * @param sketchDataUrl - Base64 编码的草图（含 data:image 前缀）
 * @param style - 用户选择的风格预设
 * @param userPrompt - 用户自定义提示词（可选）
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
	let usedNodeName: string = 'unknown'

	try {
		// 使用带故障转移的多节点图像生成
		const result = await generateImageWithFallback({
			sketchDataUrl,
			stylePrompt: style.prompt,
			userPrompt,
			signal,
		})

		generatedImageUrl = result.imageUrl
		usedNodeName = result.usedNode.name

		console.log(`[AIService] 图像生成成功，使用节点: ${usedNodeName}`)
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
