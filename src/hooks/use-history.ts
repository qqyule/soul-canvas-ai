/**
 * 历史记录 Hook（IndexedDB 版本）
 * 管理用户生成历史的异步存储
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import type { StylePreset } from '@/types/canvas'
import {
	getHistory,
	addHistory as addHistoryToDB,
	deleteHistory as deleteHistoryFromDB,
	clearHistory as clearHistoryFromDB,
	revokeObjectUrls,
	type HistoryItem,
} from '@/lib/history-db'

interface UseHistoryReturn {
	/** 历史记录列表 */
	history: HistoryItem[]
	/** 是否正在加载 */
	isLoading: boolean
	/** 添加历史记录 */
	addToHistory: (
		sketchDataUrl: string,
		resultUrl: string,
		style: StylePreset
	) => Promise<HistoryItem>
	/** 删除历史记录 */
	deleteFromHistory: (id: string) => Promise<void>
	/** 清空所有历史记录 */
	clearAllHistory: () => Promise<void>
	/** 刷新历史记录 */
	refresh: () => Promise<void>
}

/**
 * 历史记录 Hook（IndexedDB 版本）
 */
export const useHistory = (): UseHistoryReturn => {
	const [history, setHistory] = useState<HistoryItem[]>([])
	const [isLoading, setIsLoading] = useState(true)
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
			console.error('Failed to load history:', error)
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
	 * 清空所有历史记录
	 */
	const clearAllHistory = useCallback(async () => {
		await clearHistoryFromDB()
		// 释放所有 Object URLs
		revokeObjectUrls(prevHistoryRef.current)
		setHistory([])
		prevHistoryRef.current = []
	}, [])

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
		isLoading,
		addToHistory,
		deleteFromHistory,
		clearAllHistory,
		refresh,
	}
}

export type { HistoryItem }
