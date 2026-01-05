/**
 * 本地存储管理
 * 处理生成次数限制等逻辑
 */

// 每日限制
const GUEST_DAILY_LIMIT = 4
const AUTH_DAILY_LIMIT = 50
export const GITHUB_REPO_URL = 'https://github.com/qqyule/soul-canvas-ai'

// Legacy/UI constants
export const BASE_DAILY_LIMIT = GUEST_DAILY_LIMIT
export const STARRED_DAILY_LIMIT = AUTH_DAILY_LIMIT
export const AUTHENTICATED_DAILY_LIMIT = AUTH_DAILY_LIMIT

// Storage Keys
const STORAGE_PREFIX = 'soul-canvas-'
const KEY_USAGE_DATE = `${STORAGE_PREFIX}usage-date`
const KEY_USAGE_COUNT = `${STORAGE_PREFIX}usage-count`
const KEY_STARRED = `${STORAGE_PREFIX}is-starred` // Legacy support

// Helper: Check and reset daily usage
const checkDateAndReset = () => {
	if (typeof window === 'undefined') return

	const today = new Date().toDateString()
	const lastDate = localStorage.getItem(KEY_USAGE_DATE)

	if (lastDate !== today) {
		localStorage.setItem(KEY_USAGE_DATE, today)
		localStorage.setItem(KEY_USAGE_COUNT, '0')
	}
}

/**
 * 获取每日限制次数
 * @param isSignedIn 是否登录
 */
export const getDailyLimit = (isSignedIn: boolean): number => {
	if (isSignedIn) return AUTH_DAILY_LIMIT
	return GUEST_DAILY_LIMIT
}

/**
 * 获取当前已使用次数
 */
export const getUsedCount = (): number => {
	if (typeof window === 'undefined') return 0
	checkDateAndReset()
	const count = parseInt(localStorage.getItem(KEY_USAGE_COUNT) || '0', 10)
	return isNaN(count) ? 0 : count
}

/**
 * 获取剩余次数
 * @param limit 当前限制
 */
export const getRemainingCount = (limit: number): number => {
	const used = getUsedCount()
	return Math.max(0, limit - used)
}

/**
 * 检查是否达到限制
 * @param limit 当前限制
 */
export const isLimitReached = (limit: number): boolean => {
	return getUsedCount() >= limit
}

/**
 * 增加使用次数
 * @param amount 增加数量
 * @param limit 当前限制
 * @returns 剩余次数，如果操作失败或已超限返回 -1
 */
export const incrementDailyUsage = (amount: number, limit: number): number => {
	if (typeof window === 'undefined') return -1
	checkDateAndReset()

	const currentUsage = getUsedCount()

	// Double check (though hook usually checks first)
	if (currentUsage >= limit) return -1

	const newUsage = currentUsage + amount
	localStorage.setItem(KEY_USAGE_COUNT, newUsage.toString())

	return Math.max(0, limit - newUsage)
}

/**
 * 标记用户已 Star (兼容旧代码 API，实际可能不再影响额度)
 */
export const markUserAsStarred = () => {
	if (typeof window === 'undefined') return
	localStorage.setItem(KEY_STARRED, 'true')
}
