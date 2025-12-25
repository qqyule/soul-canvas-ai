/**
 * 本地存储工具模块
 * 用于管理每日使用次数和历史记录的 localStorage 操作
 */

import type { StylePreset } from '@/types/canvas'

// ==================== 类型定义 ====================

/**
 * 历史记录项
 */
export interface HistoryItem {
	/** 唯一标识符 */
	id: string
	/** Base64 草图缩略图 */
	sketchDataUrl: string
	/** 生成结果图片 URL */
	resultUrl: string
	/** 使用的风格 ID */
	styleId: string
	/** 使用的风格名称（中文） */
	styleName: string
	/** ISO 时间戳 */
	createdAt: string
}

/**
 * 每日使用统计
 */
export interface DailyUsage {
	/** 日期，YYYY-MM-DD 格式 */
	date: string
	/** 当日已使用次数 */
	count: number
}

// ==================== 常量 ====================

/** 每日最大生成次数 */
export const DAILY_LIMIT = 20

/** 历史记录最大保存数量 */
export const MAX_HISTORY_SIZE = 50

/** localStorage 键名 */
const STORAGE_KEYS = {
	DAILY_USAGE: 'shenbimaliang_daily_usage',
	HISTORY: 'shenbimaliang_history',
} as const

// ==================== 工具函数 ====================

/**
 * 获取当前日期字符串 (YYYY-MM-DD)
 */
const getTodayString = (): string => {
	const now = new Date()
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
		2,
		'0'
	)}-${String(now.getDate()).padStart(2, '0')}`
}

/**
 * 安全解析 JSON
 */
const safeJsonParse = <T>(json: string | null, fallback: T): T => {
	if (!json) return fallback
	try {
		return JSON.parse(json) as T
	} catch {
		return fallback
	}
}

// ==================== 每日使用次数 ====================

/**
 * 获取每日使用统计
 */
export const getDailyUsage = (): DailyUsage => {
	const stored = localStorage.getItem(STORAGE_KEYS.DAILY_USAGE)
	const usage = safeJsonParse<DailyUsage>(stored, { date: '', count: 0 })

	// 如果日期不是今天，重置计数
	const today = getTodayString()
	if (usage.date !== today) {
		return { date: today, count: 0 }
	}

	return usage
}

/**
 * 增加使用次数
 * @returns 更新后的剩余次数，如果已达限制返回 -1
 */
export const incrementDailyUsage = (): number => {
	const usage = getDailyUsage()

	if (usage.count >= DAILY_LIMIT) {
		return -1
	}

	const newUsage: DailyUsage = {
		date: getTodayString(),
		count: usage.count + 1,
	}

	localStorage.setItem(STORAGE_KEYS.DAILY_USAGE, JSON.stringify(newUsage))

	return DAILY_LIMIT - newUsage.count
}

/**
 * 获取剩余次数
 */
export const getRemainingCount = (): number => {
	const usage = getDailyUsage()
	return Math.max(0, DAILY_LIMIT - usage.count)
}

/**
 * 检查是否达到限制
 */
export const isLimitReached = (): boolean => {
	return getRemainingCount() <= 0
}

// ==================== 历史记录 ====================

/**
 * 获取所有历史记录
 */
export const getHistory = (): HistoryItem[] => {
	const stored = localStorage.getItem(STORAGE_KEYS.HISTORY)
	return safeJsonParse<HistoryItem[]>(stored, [])
}

/**
 * 添加历史记录
 */
export const addHistory = (
	sketchDataUrl: string,
	resultUrl: string,
	style: StylePreset
): HistoryItem => {
	const history = getHistory()

	const newItem: HistoryItem = {
		id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		sketchDataUrl,
		resultUrl,
		styleId: style.id,
		styleName: style.nameZh,
		createdAt: new Date().toISOString(),
	}

	// 添加到开头
	const updatedHistory = [newItem, ...history]

	// 限制数量
	if (updatedHistory.length > MAX_HISTORY_SIZE) {
		updatedHistory.splice(MAX_HISTORY_SIZE)
	}

	localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory))

	return newItem
}

/**
 * 删除历史记录
 */
export const deleteHistory = (id: string): void => {
	const history = getHistory()
	const updatedHistory = history.filter((item) => item.id !== id)
	localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updatedHistory))
}

/**
 * 清空所有历史记录
 */
export const clearHistory = (): void => {
	localStorage.removeItem(STORAGE_KEYS.HISTORY)
}
