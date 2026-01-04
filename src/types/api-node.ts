/**
 * 多 API 节点相关类型定义
 */

// ==================== 节点配置 ====================

/**
 * API 节点配置
 */
export interface APINode {
	/** 节点唯一标识 */
	id: string
	/** 显示名称 */
	name: string
	/** API 基础 URL */
	baseUrl: string
	/** 测速/健康检查端点 */
	healthEndpoint: string
	/** 优先级（越小越优先） */
	priority: number
	/** 是否启用 */
	enabled: boolean
	/** 同步/异步模式 */
	mode: 'sync' | 'async'
	/** 使用的模型 */
	model?: string
}

/**
 * 节点健康状态
 */
export interface NodeHealth {
	/** 节点 ID */
	nodeId: string
	/** 延迟（ms） */
	latency: number
	/** 是否可用 */
	isAvailable: boolean
	/** 最后检测时间 */
	lastChecked: Date
	/** 连续失败次数 */
	consecutiveFailures: number
}

/**
 * 节点选择策略
 */
export type NodeSelectionStrategy = 'latency' | 'priority' | 'round-robin'

/**
 * 节点管理器配置
 */
export interface NodeManagerConfig {
	/** 节点列表 */
	nodes: APINode[]
	/** 选择策略 */
	strategy: NodeSelectionStrategy
	/** 健康检查间隔（ms） */
	healthCheckInterval: number
	/** 故障转移阈值（连续失败次数） */
	failoverThreshold: number
	/** 测速结果缓存时间（ms） */
	cacheTimeout: number
}

// ==================== kie.ai 相关类型 ====================

/**
 * kie.ai 异步任务创建请求
 */
export interface KieCreateTaskRequest {
	/** 模型名称 */
	model: string
	/** 可选回调 URL */
	callBackUrl?: string
	/** 输入参数 */
	input: {
		/** 提示词 */
		prompt: string
		/** 输入图像 URL 列表 */
		image_urls: string[]
		/** 输出格式 */
		output_format?: 'png' | 'jpeg' | 'webp'
		/** 图像尺寸比例 */
		image_size?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
	}
}

/**
 * kie.ai 任务创建响应
 */
export interface KieCreateTaskResponse {
	/** 响应码 */
	code: number
	/** 响应消息 */
	msg: string
	/** 响应数据 */
	data: {
		/** 任务 ID */
		taskId: string
	}
}

/**
 * kie.ai 任务状态
 */
export type KieTaskState = 'pending' | 'processing' | 'success' | 'failed'

/**
 * kie.ai 任务结果响应
 */
export interface KieTaskResultResponse {
	/** 响应码 */
	code: number
	/** 响应消息 */
	msg: string
	/** 响应数据 */
	data: {
		/** 任务 ID */
		taskId: string
		/** 模型名称 */
		model?: string
		/** 任务状态（注意：API 返回的是 state 不是 status） */
		state: KieTaskState
		/** 参数 JSON 字符串 */
		param?: string
		/** 结果 JSON 字符串（包含 resultUrls） */
		resultJson?: string
		/** 失败码 */
		failCode?: string | null
		/** 失败信息 */
		failMsg?: string | null
		/** 耗时（秒） */
		costTime?: number
		/** 完成时间戳 */
		completeTime?: number
		/** 创建时间戳 */
		createTime?: number
	}
}

// ==================== 通用 API 客户端接口 ====================

/**
 * 统一的图像生成参数
 */
export interface ImageGenerationParams {
	/** Base64 编码的草图（含 data:image 前缀） */
	sketchDataUrl: string
	/** 风格提示词 */
	stylePrompt: string
	/** 用户自定义提示词 */
	userPrompt?: string
	/** 取消信号 */
	signal?: AbortSignal
}

/**
 * 统一的 API 客户端接口
 */
export interface APIClient {
	/** 客户端标识 */
	id: string
	/** 生成图像 */
	generateImage(params: ImageGenerationParams): Promise<string>
	/** 测试连通性 */
	ping(): Promise<number>
}
