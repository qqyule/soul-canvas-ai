/**
 * 历史记录 Hook（增强版）
 * @description 管理用户生成历史的异步存储，支持过滤与批量操作
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { StylePreset } from '@/types/canvas'
import {
	getHistory,
	addHistory as addHistoryToDB,
	deleteHistory as deleteHistoryFromDB,
	clearHistory as clearHistoryFromDB,
	revokeObjectUrls,
	type HistoryItem,
} from '@/lib/history-db'
import { type HistoryFilter, DEFAULT_HISTORY_FILTER } from '@/types/history'

interface UseHistoryReturn {
	/** 历史记录列表（原始） */
	history: HistoryItem[]
	/** 过滤后的历史记录 */
	filteredHistory: HistoryItem[]
	/** 是否正在加载 */
	isLoading: boolean
	/** 当前过滤配置 */
	filter: HistoryFilter
	/** 设置过滤配置 */
	setFilter: (filter: HistoryFilter) => void
	/** 可用风格列表 */
	availableStyles: Array<{ id: string; name: string }>
	/** 添加历史记录 */
	addToHistory: (
		sketchDataUrl: string,
		resultUrl: string,
		style: StylePreset
	) => Promise<HistoryItem>
	/** 删除历史记录 */
	deleteFromHistory: (id: string) => Promise<void>
	/** 批量删除历史记录 */
	deleteMultiple: (ids: string[]) => Promise<void>
	/** 清空所有历史记录 */
	clearAllHistory: () => Promise<void>
	/** 刷新历史记录 */
	refresh: () => Promise<void>
}

/**
 * 历史记录 Hook（增强版）
 */
export const useHistory = (): UseHistoryReturn => {
	const [history, setHistory] = useState<HistoryItem[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [filter, setFilter] = useState<HistoryFilter>(DEFAULT_HISTORY_FILTER)
	const prevHistoryRef = useRef<HistoryItem[]>([])

	/**
	 * 刷新历史记录
	 */
	const refresh = useCallback(async () => {
		setIsLoading(true)
		try {
			// 释放旧的 Object URLs
			revokeObjectUrls(prevHistoryRef.current)

			const items = await getHistory()
			setHistory(items)
			prevHistoryRef.current = items
		} catch (error) {
			// Ignore error
		} finally {
			setIsLoading(false)
		}
	}, [])

	/**
	 * 添加历史记录
	 */
	const addToHistory = useCallback(
		async (
			sketchDataUrl: string,
			resultUrl: string,
			style: StylePreset
		): Promise<HistoryItem> => {
			const newItem = await addHistoryToDB(sketchDataUrl, resultUrl, style)
			setHistory((prev) => {
				// 更新引用
				prevHistoryRef.current = [newItem, ...prev]
				return prevHistoryRef.current
			})
			return newItem
		},
		[]
	)

	/**
	 * 删除历史记录
	 */
	const deleteFromHistory = useCallback(async (id: string) => {
		await deleteHistoryFromDB(id)
		setHistory((prev) => {
			const itemToDelete = prev.find((item) => item.id === id)
			if (itemToDelete) {
				// 释放被删除项的 Object URLs
				revokeObjectUrls([itemToDelete])
			}
			const filtered = prev.filter((item) => item.id !== id)
			prevHistoryRef.current = filtered
			return filtered
		})
	}, [])

	/**
	 * 批量删除历史记录
	 */
	const deleteMultiple = useCallback(async (ids: string[]) => {
		// 并行删除
		await Promise.all(ids.map((id) => deleteHistoryFromDB(id)))
		setHistory((prev) => {
			const idsSet = new Set(ids)
			const itemsToDelete = prev.filter((item) => idsSet.has(item.id))
			// 释放被删除项的 Object URLs
			revokeObjectUrls(itemsToDelete)
			const filtered = prev.filter((item) => !idsSet.has(item.id))
			prevHistoryRef.current = filtered
			return filtered
		})
	}, [])

	/**
	 * 清空所有历史记录
	 */
	const clearAllHistory = useCallback(async () => {
		await clearHistoryFromDB()
		// 释放所有 Object URLs
		revokeObjectUrls(prevHistoryRef.current)
		setHistory([])
		prevHistoryRef.current = []
	}, [])

	/**
	 * 过滤后的历史记录
	 */
	const filteredHistory = useMemo(() => {
		let result = [...history]

		// 风格筛选
		if (filter.styleId) {
			result = result.filter((item) => item.styleId === filter.styleId)
		}

		// 日期范围筛选
		if (filter.startDate) {
			result = result.filter((item) => item.createdAt >= filter.startDate!)
		}
		if (filter.endDate) {
			// 结束日期设为当天 23:59:59
			const endOfDay = filter.endDate + 24 * 60 * 60 * 1000 - 1
			result = result.filter((item) => item.createdAt <= endOfDay)
		}

		// 关键词搜索（匹配风格名称）
		if (filter.searchQuery) {
			const query = filter.searchQuery.toLowerCase()
			result = result.filter((item) =>
				item.styleName.toLowerCase().includes(query)
			)
		}

		// 排序
		if (filter.sortBy === 'oldest') {
			result.sort((a, b) => a.createdAt - b.createdAt)
		} else {
			result.sort((a, b) => b.createdAt - a.createdAt)
		}

		return result
	}, [history, filter])

	/**
	 * 可用风格列表（从历史中提取）
	 */
	const availableStyles = useMemo(() => {
		const styleMap = new Map<string, string>()
		history.forEach((item) => {
			if (!styleMap.has(item.styleId)) {
				styleMap.set(item.styleId, item.styleName)
			}
		})
		return Array.from(styleMap.entries()).map(([id, name]) => ({ id, name }))
	}, [history])

	// 组件挂载时加载历史记录
	useEffect(() => {
		refresh()

		// 组件卸载时释放 Object URLs
		return () => {
			revokeObjectUrls(prevHistoryRef.current)
		}
	}, [refresh])

	return {
		history,
		filteredHistory,
		isLoading,
		filter,
		setFilter,
		availableStyles,
		addToHistory,
		deleteFromHistory,
		deleteMultiple,
		clearAllHistory,
		refresh,
	}
}

export type { HistoryItem }
