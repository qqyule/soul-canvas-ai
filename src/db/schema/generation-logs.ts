/**
 * 生成日志表结构定义
 * @description 记录每次 AI 生成的参数和结果，用于问题排查和数据分析
 */

import {
	pgTable,
	text,
	timestamp,
	uuid,
	jsonb,
	integer,
} from 'drizzle-orm/pg-core'
import { users } from './users'

/**
 * 生成状态枚举值
 */
export const GENERATION_STATUS = {
	SUCCESS: 'success',
	FAILED: 'failed',
	TIMEOUT: 'timeout',
} as const

export type GenerationStatus =
	(typeof GENERATION_STATUS)[keyof typeof GENERATION_STATUS]

/**
 * 生成日志表
 */
export const generationLogs = pgTable('generation_logs', {
	/** 日志唯一标识 */
	id: uuid('id').primaryKey().defaultRandom(),
	/** 用户 ID（可为空，匿名用户） */
	/** 用户 ID（可为空，匿名用户） */
	userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
	/** 使用的风格 ID */
	styleId: text('style_id').notNull(),
	/** 生成时使用的提示词 */
	prompt: text('prompt'),
	/** 使用的 AI 模型 */
	model: text('model'),
	/** 生成状态 */
	status: text('status').notNull(), // 'success' | 'failed' | 'timeout'
	/** 错误信息（失败时） */
	errorMessage: text('error_message'),
	/** 生成耗时（毫秒） */
	durationMs: integer('duration_ms'),
	/** 额外元数据（JSON 格式） */
	metadata: jsonb('metadata'),
	/** 创建时间 */
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ==================== 类型导出 ====================

/** 生成日志查询结果类型 */
export type GenerationLog = typeof generationLogs.$inferSelect
/** 生成日志插入数据类型 */
export type NewGenerationLog = typeof generationLogs.$inferInsert
