/**
 * 通用重试工具函数
 * @module lib/utils/retry
 */

interface RetryOptions {
	/** 最大重试次数 (默认: 2) */
	maxRetries?: number
	/** 初始延迟时间 ms (默认: 1000) */
	baseDelay?: number
	/** 指数退避因子 (默认: 2) */
	backoffFactor?: number
	/** 最大延迟时间 ms (默认: 30000) */
	maxDelay?: number
	/** 判断是否应该重试的回调 */
	shouldRetry?: (error: unknown) => boolean
	/** 每次重试前的回调 */
	onRetry?: (attempt: number, delay: number, error: unknown) => void
}

/**
 * 延迟函数
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 执行带有重试机制的异步操作
 * 采用指数退避策略 (Exponential Backoff)
 */
export async function withRetry<T>(
	operation: () => Promise<T>,
	options: RetryOptions = {}
): Promise<T> {
	const {
		maxRetries = 2,
		baseDelay = 1000,
		backoffFactor = 2,
		maxDelay = 30000,
		shouldRetry = () => true,
		onRetry,
	} = options

	let lastError: unknown

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await operation()
		} catch (error) {
			lastError = error

			// 如果是最后一次尝试，或者错误类型判定为不需要重试，则直接抛出
			if (attempt === maxRetries || !shouldRetry(error)) {
				throw error
			}

			// 计算下一次重试的延迟时间
			// delay = baseDelay * (backoffFactor ^ attempt)
			// 例如: 1000ms, 2000ms, 4000ms...
			let retryDelay = baseDelay * Math.pow(backoffFactor, attempt)
			// 增加一点随机抖动 (Jitter)，防止惊群效应 (0.8 ~ 1.2 倍)
			const jitter = 0.8 + Math.random() * 0.4
			retryDelay = Math.min(retryDelay * jitter, maxDelay)

			if (onRetry) {
				onRetry(attempt + 1, Math.round(retryDelay), error)
			}

			await delay(retryDelay)
		}
	}

	throw lastError
}
