/**
 * 生成日志数据操作 Repository
 * @description 封装生成日志相关的数据库操作，用于问题排查和数据分析
 */

import { eq, desc, and, sql } from 'drizzle-orm'
import { getDb } from '../index'
import {
	generationLogs,
	type GenerationLog,
	type NewGenerationLog,
	insertGenerationLogSchema,
	GENERATION_STATUS,
} from '../schema'

/**
 * 生成日志 Repository
 */
export const generationLogsRepository = {
	/**
	 * 创建生成日志（带 Zod 验证）
	 * @param data 日志数据
	 * @returns 创建的日志
	 * @throws Zod 验证错误
	 */
	async create(data: NewGenerationLog): Promise<GenerationLog> {
		const db = getDb()
		// 验证数据
		insertGenerationLogSchema.parse(data)
		const result = await db.insert(generationLogs).values(data).returning()
		return result[0]
	},

	/**
	 * 获取用户的生成日志
	 * @param userId 用户 ID
	 * @param limit 限制数量
	 * @param offset 偏移量
	 * @returns 日志列表
	 */
	async getByUserId(
		userId: string,
		limit = 50,
		offset = 0
	): Promise<GenerationLog[]> {
		const db = getDb()
		return db
			.select()
			.from(generationLogs)
			.where(eq(generationLogs.userId, userId))
			.orderBy(desc(generationLogs.createdAt))
			.limit(limit)
			.offset(offset)
	},

	/**
	 * 获取失败的生成日志
	 * @param limit 限制数量
	 * @returns 失败日志列表
	 */
	async getFailed(limit = 100): Promise<GenerationLog[]> {
		const db = getDb()
		return db
			.select()
			.from(generationLogs)
			.where(eq(generationLogs.status, GENERATION_STATUS.FAILED))
			.orderBy(desc(generationLogs.createdAt))
			.limit(limit)
	},

	/**
	 * 获取生成统计
	 * @param userId 用户 ID（可选，不传则统计全部）
	 * @returns 统计数据
	 */
	async getStats(userId?: string) {
		const db = getDb()
		const baseQuery = userId
			? and(eq(generationLogs.userId, userId))
			: undefined

		const [total, success, failed] = await Promise.all([
			db
				.select({ count: sql<number>`count(*)` })
				.from(generationLogs)
				.where(baseQuery),
			db
				.select({ count: sql<number>`count(*)` })
				.from(generationLogs)
				.where(
					and(baseQuery, eq(generationLogs.status, GENERATION_STATUS.SUCCESS))
				),
			db
				.select({ count: sql<number>`count(*)` })
				.from(generationLogs)
				.where(
					and(baseQuery, eq(generationLogs.status, GENERATION_STATUS.FAILED))
				),
		])

		return {
			total: Number(total[0]?.count ?? 0),
			success: Number(success[0]?.count ?? 0),
			failed: Number(failed[0]?.count ?? 0),
			successRate: total[0]?.count
				? (Number(success[0]?.count) / Number(total[0]?.count)) * 100
				: 0,
		}
	},

	/**
	 * 记录成功的生成
	 * @param data 生成数据
	 * @returns 创建的日志
	 */
	async logSuccess(
		data: Omit<NewGenerationLog, 'status'> & { durationMs: number }
	): Promise<GenerationLog> {
		return this.create({
			...data,
			status: GENERATION_STATUS.SUCCESS,
		})
	},

	/**
	 * 记录失败的生成
	 * @param data 生成数据
	 * @returns 创建的日志
	 */
	async logFailure(
		data: Omit<NewGenerationLog, 'status'> & { errorMessage: string }
	): Promise<GenerationLog> {
		return this.create({
			...data,
			status: GENERATION_STATUS.FAILED,
		})
	},

	/**
	 * 记录超时的生成
	 * @param data 生成数据
	 * @returns 创建的日志
	 */
	async logTimeout(
		data: Omit<NewGenerationLog, 'status'>
	): Promise<GenerationLog> {
		return this.create({
			...data,
			status: GENERATION_STATUS.TIMEOUT,
			errorMessage: '生成请求超时',
		})
	},
}
