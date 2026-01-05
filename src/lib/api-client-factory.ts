/**
 * API 客户端工厂
 * 根据节点类型返回对应的客户端实例
 */

import type {
	APIClient,
	APINode,
	ImageGenerationParams,
} from '@/types/api-node'
import { createKieClient } from './kie-client'
import { generateImageFromSketch } from './openrouter'
import { getNodeManager, getNodeConfigs } from './api-node-manager'

// ==================== OpenRouter 客户端适配器 ====================

/**
 * 创建 OpenRouter API 客户端
 * 将现有的 openrouter.ts 包装为统一接口
 */
function createOpenRouterClient(): APIClient {
	return {
		id: 'openrouter',

		async generateImage(params: ImageGenerationParams): Promise<string> {
			const { sketchDataUrl, stylePrompt, userPrompt, signal } = params
			return generateImageFromSketch(
				sketchDataUrl,
				stylePrompt,
				userPrompt,
				signal
			)
		},

		async ping(): Promise<number> {
			const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
			if (!apiKey) {
				throw new Error('VITE_OPENROUTER_API_KEY 未配置')
			}

			const startTime = performance.now()
			const response = await fetch('https://openrouter.ai/api/v1/credits', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${apiKey}`,
				},
				signal: AbortSignal.timeout(5000),
			})

			if (!response.ok) {
				throw new Error(`测速失败: ${response.status}`)
			}

			return performance.now() - startTime
		},
	}
}

// ==================== 客户端工厂 ====================

/** 客户端实例缓存 */
const clientCache = new Map<string, APIClient>()

/**
 * 根据节点 ID 获取客户端
 */
export function getClientById(nodeId: string): APIClient {
	// 检查缓存
	let client = clientCache.get(nodeId)
	if (client) {
		return client
	}

	// 创建新客户端
	switch (nodeId) {
		case 'kie':
			client = createKieClient()
			break
		case 'openrouter':
			client = createOpenRouterClient()
			break
		default:
			throw new Error(`未知的节点 ID: ${nodeId}`)
	}

	// 缓存并返回
	clientCache.set(nodeId, client)
	return client
}

/**
 * 根据节点配置获取客户端
 */
export function getClientByNode(node: APINode): APIClient {
	return getClientById(node.id)
}

/**
 * 获取当前最优节点的客户端
 */
export async function getBestClient(): Promise<{
	client: APIClient
	node: APINode
}> {
	const manager = getNodeManager()
	const node = await manager.selectBestNode()
	const client = getClientById(node.id)
	return { client, node }
}

/**
 * 带故障转移的图像生成
 * 顺序尝试：先使用主节点，失败后切换到备用节点
 */
export async function generateImageWithFallback(
	params: ImageGenerationParams
): Promise<{ imageUrl: string; usedNode: APINode }> {
	const manager = getNodeManager()

	// 获取所有启用的节点，按优先级排序（只调用一次）
	const nodes = getEnabledNodesSorted()

	if (nodes.length === 0) {
		throw new Error('没有可用的 API 节点')
	}

	let lastError: Error | null = null

	// 顺序尝试每个节点（不是同时执行）
	for (const node of nodes) {
		try {
			const client = getClientById(node.id)
			const imageUrl = await client.generateImage(params)

			return { imageUrl, usedNode: node }
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error))
			console.warn(`[ClientFactory] 节点 ${node.name} 失败:`, lastError.message)

			// 标记节点失败
			manager.markNodeFailed(node.id)

			// 如果是用户取消，直接抛出不继续尝试
			if (error instanceof DOMException && error.name === 'AbortError') {
				throw error
			}

			// 继续尝试下一个节点
		}
	}

	// 所有节点都失败
	throw lastError || new Error('所有 API 节点均不可用')
}

/**
 * 获取启用的节点列表（按优先级排序）
 * 同步函数，不触发额外的网络请求
 */
function getEnabledNodesSorted(): APINode[] {
	const nodeConfigs = getNodeConfigs()

	// 筛选启用的节点并按优先级排序
	return nodeConfigs
		.filter((config) => config.enabled)
		.sort((a, b) => a.priority - b.priority)
}

// ==================== 导出 ====================

export { createKieClient, createOpenRouterClient }
