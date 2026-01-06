/**
 * 草稿管理 React Hook
 * @description 提供草稿的读写、自动保存等功能
 */

import { useCallback, useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import {
	type Draft,
	deleteDraft as deleteDraftDB,
	getAllDrafts as getAllDraftsDB,
	getDraft as getDraftDB,
	getLatestDraft,
	saveDraft as saveDraftDB,
} from '@/lib/draft-db'

// ==================== 类型定义 ====================

/**
 * 保存状态
 */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/**
 * Hook 返回值
 */
interface UseDraftsReturn {
	/** 当前草稿 */
	currentDraft: Draft | null
	/** 所有草稿列表 */
	drafts: Draft[]
	/** 保存状态 */
	saveStatus: SaveStatus
	/** 错误信息 */
	error: string | null
	/** 保存草稿 */
	saveDraft: (data: {
		canvasData: string
		styleId: string
		prompt?: string
		thumbnailBlob?: Blob
	}) => Promise<void>
	/** 加载草稿 */
	loadDraft: (id: string) => Promise<Draft | null>
	/** 删除草稿 */
	deleteDraft: (id: string) => Promise<void>
	/** 刷新草稿列表 */
	refreshDrafts: () => Promise<void>
	/** 检查并恢复最新草稿 */
	checkLatestDraft: () => Promise<Draft | null>
}

// ==================== Hook 实现 ====================

/**
 * 草稿管理 Hook
 */
export const useDrafts = (): UseDraftsReturn => {
	const [currentDraft, setCurrentDraft] = useState<Draft | null>(null)
	const [drafts, setDrafts] = useState<Draft[]>([])
	const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
	const [error, setError] = useState<string | null>(null)

	/**
	 * 刷新草稿列表
	 */
	const refreshDrafts = useCallback(async () => {
		try {
			const allDrafts = await getAllDraftsDB()
			setDrafts(allDrafts)
		} catch (err) {
			console.error('Failed to refresh drafts:', err)
		}
	}, [])

	/**
	 * 保存草稿（立即执行）
	 */
	const saveDraftImmediate = useCallback(
		async (data: {
			canvasData: string
			styleId: string
			prompt?: string
			thumbnailBlob?: Blob
		}) => {
			try {
				setSaveStatus('saving')
				setError(null)

				const savedDraft = await saveDraftDB({
					id: currentDraft?.id, // 如果有当前草稿 ID，则更新；否则新建
					...data,
				})

				setCurrentDraft(savedDraft)
				setSaveStatus('saved')

				// 刷新列表
				await refreshDrafts()

				// 2秒后重置为 idle
				setTimeout(() => {
					setSaveStatus('idle')
				}, 2000)
			} catch (err) {
				console.error('Failed to save draft:', err)
				setError(err instanceof Error ? err.message : '保存失败')
				setSaveStatus('error')
			}
		},
		[currentDraft?.id, refreshDrafts]
	)

	/**
	 * 防抖保存（用于自动保存）
	 * 2秒延迟，避免频繁写入
	 */
	const saveDraft = useDebouncedCallback(saveDraftImmediate, 2000)

	/**
	 * 加载草稿
	 */
	const loadDraft = useCallback(async (id: string): Promise<Draft | null> => {
		try {
			const draft = await getDraftDB(id)
			if (draft) {
				setCurrentDraft(draft)
			}
			return draft
		} catch (err) {
			console.error('Failed to load draft:', err)
			setError(err instanceof Error ? err.message : '加载失败')
			return null
		}
	}, [])

	/**
	 * 删除草稿
	 */
	const deleteDraft = useCallback(
		async (id: string) => {
			try {
				await deleteDraftDB(id)

				// 如果删除的是当前草稿，清空当前草稿
				if (currentDraft?.id === id) {
					setCurrentDraft(null)
				}

				// 刷新列表
				await refreshDrafts()
			} catch (err) {
				console.error('Failed to delete draft:', err)
				setError(err instanceof Error ? err.message : '删除失败')
			}
		},
		[currentDraft?.id, refreshDrafts]
	)

	/**
	 * 检查并返回最新草稿（用于恢复提示）
	 */
	const checkLatestDraft = useCallback(async (): Promise<Draft | null> => {
		try {
			const latest = await getLatestDraft()
			return latest
		} catch (err) {
			console.error('Failed to check latest draft:', err)
			return null
		}
	}, [])

	/**
	 * 初始化时加载草稿列表
	 */
	useEffect(() => {
		refreshDrafts()
	}, [refreshDrafts])

	return {
		currentDraft,
		drafts,
		saveStatus,
		error,
		saveDraft,
		loadDraft,
		deleteDraft,
		refreshDrafts,
		checkLatestDraft,
	}
}
