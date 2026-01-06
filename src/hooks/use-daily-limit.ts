/**
 * 每日生成限制 Hook
 * 管理用户每日生成次数的限制逻辑
 */

import { useUser } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import {
	isLimitReached as checkLimitReached,
	getDailyLimit,
	getRemainingCount,
	incrementDailyUsage,
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
	const { isSignedIn, isLoaded } = useUser()

	// 计算当前限制的辅助函数
	const getCurrentLimit = useCallback(() => {
		// 如果 Clerk 还没加载完成，默认为未登录状态
		if (!isLoaded) return getDailyLimit(false)
		return getDailyLimit(!!isSignedIn)
	}, [isSignedIn, isLoaded])

	const [remainingCount, setRemainingCount] = useState(() =>
		getRemainingCount(getDailyLimit(false))
	)
	const [dailyLimit, setDailyLimit] = useState(() => getDailyLimit(false))
	const [isLimitReached, setIsLimitReached] = useState(() =>
		checkLimitReached(getDailyLimit(false))
	)

	/**
	 * 刷新状态
	 */
	const refresh = useCallback(() => {
		const currentLimit = getCurrentLimit()
		setRemainingCount(getRemainingCount(currentLimit))
		setDailyLimit(currentLimit)
		setIsLimitReached(checkLimitReached(currentLimit))
	}, [getCurrentLimit])

	// 当登录状态变化时，自动刷新
	useEffect(() => {
		refresh()
	}, [refresh])

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
			const currentLimit = getCurrentLimit()

			if (checkLimitReached(currentLimit) || remainingCount < amount) {
				setIsLimitReached(true)
				return false
			}

			const remaining = incrementDailyUsage(amount, currentLimit)

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
		[remainingCount, refresh, getCurrentLimit]
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
