/**
 * API 节点管理器
 * 负责节点测速、选择、故障转移
 */

import type { APINode, NodeHealth, NodeSelectionStrategy } from '@/types/api-node'

// ==================== 默认配置 ====================

/** 测速结果缓存时间（5 分钟） */
const DEFAULT_CACHE_TIMEOUT = 5 * 60 * 1000

/** 故障转移阈值 */
const FAILOVER_THRESHOLD = 3

/** 缓存 key */
const CACHE_KEY = 'api-node-health-cache'

// ==================== 节点配置 ====================

/**
 * 获取节点配置
 */
export function getNodeConfigs(): APINode[] {
	return [
		{
			id: 'kie',
			name: 'kie.ai',
			baseUrl: import.meta.env.VITE_KIE_BASE_URL || 'https://api.kie.ai/api/v1',
			healthEndpoint: '/chat/credit',
			priority: 1, // 主节点，优先级最高
			enabled: !!import.meta.env.VITE_KIE_API_KEY,
			mode: 'async',
			model: 'google/nano-banana-edit',
		},
		{
			id: 'openrouter',
			name: 'OpenRouter',
			baseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
			healthEndpoint: '/credits',
			priority: 2, // 备用节点
			enabled: !!import.meta.env.VITE_OPENROUTER_API_KEY,
			mode: 'sync',
			model: import.meta.env.VITE_OPENROUTER_IMAGE_MODEL || 'google/gemini-2.5-flash-image',
		},
	]
}

/**
 * 获取节点选择策略
 */
export function getSelectionStrategy(): NodeSelectionStrategy {
	const strategy = import.meta.env.VITE_NODE_SELECTION_STRATEGY
	if (strategy === 'latency' || strategy === 'priority' || strategy === 'round-robin') {
		return strategy
	}
	return 'priority' // 默认按优先级
}

// ==================== 缓存管理 ====================

/**
 * 从 sessionStorage 读取缓存的健康状态
 */
function loadHealthCache(): Map<string, NodeHealth> {
	try {
		const cached = sessionStorage.getItem(CACHE_KEY)
		if (!cached) return new Map()

		const data = JSON.parse(cached) as Record<string, NodeHealth & { lastChecked: string }>
		const now = Date.now()
		const result = new Map<string, NodeHealth>()

		for (const [nodeId, health] of Object.entries(data)) {
			const lastChecked = new Date(health.lastChecked)
			// 检查缓存是否过期
			if (now - lastChecked.getTime() < DEFAULT_CACHE_TIMEOUT) {
				result.set(nodeId, {
					...health,
					lastChecked,
				})
			}
		}

		return result
	} catch {
		return new Map()
	}
}

/**
 * 保存健康状态到 sessionStorage
 */
function saveHealthCache(health: Map<string, NodeHealth>): void {
	try {
		const data: Record<string, NodeHealth> = {}
		for (const [nodeId, h] of health) {
			data[nodeId] = h
		}
		sessionStorage.setItem(CACHE_KEY, JSON.stringify(data))
	} catch {
		// 忽略存储错误
	}
}

// ==================== 节点管理器类 ====================

/**
 * API 节点管理器
 */
class APINodeManager {
	private nodes: Map<string, APINode>
	private health: Map<string, NodeHealth>
	private strategy: NodeSelectionStrategy
	private roundRobinIndex = 0

	constructor() {
		this.nodes = new Map()
		this.health = loadHealthCache()
		this.strategy = getSelectionStrategy()

		// 初始化节点配置
		for (const node of getNodeConfigs()) {
			this.nodes.set(node.id, node)
		}
	}

	/**
	 * 获取 API Key
	 */
	private getApiKey(nodeId: string): string {
		switch (nodeId) {
			case 'kie':
				return import.meta.env.VITE_KIE_API_KEY || ''
			case 'openrouter':
				return import.meta.env.VITE_OPENROUTER_API_KEY || ''
			default:
				return ''
		}
	}

	/**
	 * 测速单个节点
	 */
	async pingNode(nodeId: string): Promise<NodeHealth> {
		const node = this.nodes.get(nodeId)
		if (!node) {
			return {
				nodeId,
				latency: Infinity,
				isAvailable: false,
				lastChecked: new Date(),
				consecutiveFailures: 1,
			}
		}

		const startTime = performance.now()
		const apiKey = this.getApiKey(nodeId)

		try {
			const response = await fetch(`${node.baseUrl}${node.healthEndpoint}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${apiKey}`,
				},
				signal: AbortSignal.timeout(5000),
			})

			const latency = performance.now() - startTime
			const health: NodeHealth = {
				nodeId,
				latency,
				isAvailable: response.ok,
				lastChecked: new Date(),
				consecutiveFailures: response.ok
					? 0
					: (this.health.get(nodeId)?.consecutiveFailures ?? 0) + 1,
			}

			return health
		} catch (error) {
			const health: NodeHealth = {
				nodeId,
				latency: Infinity,
				isAvailable: false,
				lastChecked: new Date(),
				consecutiveFailures: (this.health.get(nodeId)?.consecutiveFailures ?? 0) + 1,
			}

			console.warn(`[APINodeManager] 节点 ${node.name} 测速失败:`, error)
			return health
		}
	}

	/**
	 * 测速所有启用的节点
	 */
	async pingAllNodes(): Promise<void> {
		const enabledNodes = Array.from(this.nodes.values()).filter((n) => n.enabled)

		const results = await Promise.all(enabledNodes.map((n) => this.pingNode(n.id)))

		// 更新健康状态
		for (const health of results) {
			this.health.set(health.nodeId, health)
		}

		// 保存到缓存
		saveHealthCache(this.health)
	}

	/**
	 * 选择最优节点
	 */
	async selectBestNode(): Promise<APINode> {
		// 获取启用的节点
		const enabledNodes = Array.from(this.nodes.values()).filter((n) => n.enabled)

		if (enabledNodes.length === 0) {
			throw new Error('没有可用的 API 节点')
		}

		// 检查是否需要重新测速（缓存过期）
		const needsPing = enabledNodes.some((node) => {
			const health = this.health.get(node.id)
			if (!health) return true
			return Date.now() - health.lastChecked.getTime() > DEFAULT_CACHE_TIMEOUT
		})

		if (needsPing) {
			await this.pingAllNodes()
		}

		// 筛选可用节点
		const availableNodes = enabledNodes.filter((node) => {
			const health = this.health.get(node.id)
			if (!health) return true // 未测速的节点默认可用
			return health.isAvailable && health.consecutiveFailures < FAILOVER_THRESHOLD
		})

		if (availableNodes.length === 0) {
			// 所有节点都不可用，尝试使用优先级最高的
			console.warn('[APINodeManager] 所有节点均不可用，尝试使用主节点')
			const sorted = enabledNodes.sort((a, b) => a.priority - b.priority)
			return sorted[0]
		}

		// 根据策略选择
		let selected: APINode

		switch (this.strategy) {
			case 'latency':
				selected = availableNodes.sort((a, b) => {
					const latencyA = this.health.get(a.id)?.latency ?? Infinity
					const latencyB = this.health.get(b.id)?.latency ?? Infinity
					return latencyA - latencyB
				})[0]
				break

			case 'round-robin':
				selected = availableNodes[this.roundRobinIndex % availableNodes.length]
				this.roundRobinIndex++
				break
			default:
				selected = availableNodes.sort((a, b) => a.priority - b.priority)[0]
				break
		}

		return selected
	}

	/**
	 * 标记节点失败
	 */
	markNodeFailed(nodeId: string): void {
		const health = this.health.get(nodeId)
		if (health) {
			health.consecutiveFailures++
			health.isAvailable = false
			this.health.set(nodeId, health)
			saveHealthCache(this.health)
			console.warn(
				`[APINodeManager] 节点 ${nodeId} 标记为失败，连续失败次数: ${health.consecutiveFailures}`
			)
		}
	}

	/**
	 * 获取节点配置
	 */
	getNode(nodeId: string): APINode | undefined {
		return this.nodes.get(nodeId)
	}

	/**
	 * 获取所有节点健康状态
	 */
	getAllHealth(): Map<string, NodeHealth> {
		return new Map(this.health)
	}
}

// ==================== 单例导出 ====================

/** 全局节点管理器实例 */
let managerInstance: APINodeManager | null = null

/**
 * 获取节点管理器实例
 */
export function getNodeManager(): APINodeManager {
	if (!managerInstance) {
		managerInstance = new APINodeManager()
	}
	return managerInstance
}

/**
 * 重置节点管理器（用于测试）
 */
export function resetNodeManager(): void {
	managerInstance = null
	sessionStorage.removeItem(CACHE_KEY)
}
