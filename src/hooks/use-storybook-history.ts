/**
 * 绘本历史记录 Hook
 * @description 从数据库获取用户创建的所有绘本
 */

import { useCallback, useEffect, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { db, schema } from '@/db'
import { desc, eq } from 'drizzle-orm'
import type { Storybook } from '@/db/schema'

export interface UseStorybookHistoryReturn {
	/** 绘本列表 */
	storybooks: Storybook[]
	/** 加载状态 */
	isLoading: boolean
	/** 错误信息 */
	error: string | null
	/** 刷新列表 */
	refresh: () => Promise<void>
	/** 删除绘本 */
	deleteStorybook: (id: string) => Promise<void>
}

/**
 * 绘本历史记录 Hook
 */
export const useStorybookHistory = (): UseStorybookHistoryReturn => {
	const { user } = useUser()
	const [storybooks, setStorybooks] = useState<Storybook[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	/**
	 * 加载绘本列表
	 */
	const refresh = useCallback(async () => {
		try {
			setIsLoading(true)
			setError(null)

			// 获取所有绘本（暂不按用户过滤，方便演示）
			const result = await db
				.select()
				.from(schema.storybooks)
				.orderBy(desc(schema.storybooks.createdAt))
				.limit(50)

			setStorybooks(result)
		} catch (err) {
			console.error('加载绘本历史失败:', err)
			setError('加载失败，请稍后重试')
		} finally {
			setIsLoading(false)
		}
	}, [])

	/**
	 * 删除绘本
	 */
	const deleteStorybook = useCallback(async (id: string) => {
		try {
			await db.delete(schema.storybooks).where(eq(schema.storybooks.id, id))
			setStorybooks((prev) => prev.filter((s) => s.id !== id))
		} catch (err) {
			console.error('删除绘本失败:', err)
			throw err
		}
	}, [])

	// 初始加载
	useEffect(() => {
		refresh()
	}, [refresh])

	return {
		storybooks,
		isLoading,
		error,
		refresh,
		deleteStorybook,
	}
}
