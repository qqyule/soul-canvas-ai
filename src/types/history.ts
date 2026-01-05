/**
 * 历史记录模块类型定义
 * @description P1-1 历史记录优化相关类型
 */

/**
 * 历史记录过滤配置
 */
export interface HistoryFilter {
	/** 风格 ID 筛选 */
	styleId?: string
	/** 开始日期时间戳 */
	startDate?: number
	/** 结束日期时间戳 */
	endDate?: number
	/** 搜索关键词 */
	searchQuery?: string
	/** 排序方式 */
	sortBy: 'latest' | 'oldest'
}

/**
 * 默认过滤配置
 */
export const DEFAULT_HISTORY_FILTER: HistoryFilter = {
	sortBy: 'latest',
}

/**
 * 选择状态
 */
export interface SelectionState {
	/** 已选中的 ID 集合 */
	selectedIds: Set<string>
	/** 是否全选 */
	isAllSelected: boolean
}

/**
 * 默认选择状态
 */
export const DEFAULT_SELECTION_STATE: SelectionState = {
	selectedIds: new Set(),
	isAllSelected: false,
}
