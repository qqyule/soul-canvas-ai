/**
 * 用户表结构定义
 * @description 存储用户基本信息和 OAuth 认证信息
 */

import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

/**
 * 用户表
 */
export const users = pgTable('users', {
	/** 用户唯一标识 (Clerk User ID) */
	id: text('id').primaryKey(),
	/** 用户邮箱（唯一） */
	email: text('email').notNull().unique(),
	/** 用户名 */
	name: text('name'),
	/** 头像 URL */
	avatarUrl: text('avatar_url'),
	/** OAuth 提供商 */
	provider: text('provider').default('clerk'), // 'clerk' | 'github' | 'google' | 'email'
	/** OAuth 提供商用户 ID (Clerk User ID) */
	providerId: text('provider_id'),
	/** 创建时间 */
	createdAt: timestamp('created_at').notNull().defaultNow(),
	/** 更新时间 */
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ==================== 类型导出 ====================

/** 用户查询结果类型 */
export type User = typeof users.$inferSelect
/** 用户插入数据类型 */
export type NewUser = typeof users.$inferInsert
