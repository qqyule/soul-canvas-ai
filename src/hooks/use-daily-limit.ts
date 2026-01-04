/**
 * 每日生成限制 Hook
 * 管理用户每日生成次数的限制逻辑
 */

import { useState, useCallback, useEffect } from 'react'
import {
	getDailyLimit,
	getRemainingCount,
	incrementDailyUsage,
	isLimitReached as checkLimitReached,
	markUserAsStarred,
} from '@/lib/storage'

interface UseDailyLimitReturn {
	/** 剩余次数 */
	remainingCount: number
	/** 每日限制总数 */
	dailyLimit: number
	/** 是否达到限制 */
	isLimitReached: boolean
	/** 消耗一次生成次数，返回是否成功 */
	consumeGeneration: (amount?: number) => boolean
	/** 刷新状态 */
	refresh: () => void
	/** 升级配额（标记为已 Star） */
	upgradeQuota: () => void
}

/**
 * 每日生成限制 Hook
 */
export const useDailyLimit = (): UseDailyLimitReturn => {
	const [remainingCount, setRemainingCount] = useState(() =>
		getRemainingCount()
	)
	const [dailyLimit, setDailyLimit] = useState(() => getDailyLimit())
	const [isLimitReached, setIsLimitReached] = useState(() =>
		checkLimitReached()
	)

	/**
	 * 刷新状态
	 */
	const refresh = useCallback(() => {
		setRemainingCount(getRemainingCount())
		setDailyLimit(getDailyLimit())
		setIsLimitReached(checkLimitReached())
	}, [])

	/**
	 * 升级配额
	 */
	const upgradeQuota = useCallback(() => {
		markUserAsStarred()
		refresh()
	}, [refresh])

	/**
	 * 使用一次或多次生成次数
	 * @param amount 消耗的数量，默认为 1
	 * @returns 是否成功（未达限制）
	 */
	const consumeGeneration = useCallback(
		(amount: number = 1): boolean => {
			if (checkLimitReached() || remainingCount < amount) {
				setIsLimitReached(true)
				return false
			}

			const remaining = incrementDailyUsage(amount)

			if (remaining === -1) {
				// 理论上 checkLimitReached 应该已经拦截了，但双重保险
				// 如果 incrementDailyUsage 返回 -1，说明实际上超限了（可能是并发导致）
				// 这种情况下不更新 remaining 为 -1，而是保持原样或强制刷新
				refresh()
				setIsLimitReached(true)
				return false
			}

			setRemainingCount(remaining)
			setIsLimitReached(remaining <= 0)

			return true
		},
		[remainingCount, refresh]
	)

	// 组件挂载时刷新状态（处理跨日期情况）
	useEffect(() => {
		refresh()
	}, [refresh])

	return {
		remainingCount,
		dailyLimit,
		isLimitReached,
		consumeGeneration,
		refresh,
		upgradeQuota,
	}
}
