/**
 * 每日生成限制 Hook
 * 管理用户每日生成次数的限制逻辑
 */

import { useState, useCallback, useEffect } from 'react'
import {
	DAILY_LIMIT,
	getRemainingCount,
	incrementDailyUsage,
	isLimitReached as checkLimitReached,
} from '@/lib/storage'

interface UseDailyLimitReturn {
	/** 剩余次数 */
	remainingCount: number
	/** 每日限制总数 */
	dailyLimit: number
	/** 是否达到限制 */
	isLimitReached: boolean
	/** 消耗一次生成次数，返回是否成功 */
	consumeGeneration: () => boolean
	/** 刷新状态 */
	refresh: () => void
}

/**
 * 每日生成限制 Hook
 */
export const useDailyLimit = (): UseDailyLimitReturn => {
	const [remainingCount, setRemainingCount] = useState(() =>
		getRemainingCount()
	)
	const [isLimitReached, setIsLimitReached] = useState(() =>
		checkLimitReached()
	)

	/**
	 * 刷新状态
	 */
	const refresh = useCallback(() => {
		setRemainingCount(getRemainingCount())
		setIsLimitReached(checkLimitReached())
	}, [])

	/**
	 * 使用一次生成次数
	 * @returns 是否成功（未达限制）
	 */
	const consumeGeneration = useCallback((): boolean => {
		if (checkLimitReached()) {
			setIsLimitReached(true)
			return false
		}

		const remaining = incrementDailyUsage()

		if (remaining === -1) {
			setIsLimitReached(true)
			return false
		}

		setRemainingCount(remaining)
		setIsLimitReached(remaining <= 0)

		return true
	}, [])

	// 组件挂载时刷新状态（处理跨日期情况）
	useEffect(() => {
		refresh()
	}, [refresh])

	return {
		remainingCount,
		dailyLimit: DAILY_LIMIT,
		isLimitReached,
		consumeGeneration,
		refresh,
	}
}
