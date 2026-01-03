/**
 * 自定义风格表结构定义
 * @description 存储用户创建的自定义风格预设
 */

import { pgTable, text, timestamp, uuid, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'

/**
 * 自定义风格表
 */
export const customStyles = pgTable('custom_styles', {
	/** 风格唯一标识 */
	id: uuid('id').primaryKey().defaultRandom(),
	/** 创建者用户 ID */
	userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
	/** 风格名称 */
	name: text('name').notNull(),
	/** 风格描述 */
	description: text('description'),
	/** 提示词模板 */
	promptTemplate: text('prompt_template').notNull(),
	/** 参考图片 URL */
	referenceImageUrl: text('reference_image_url'),
	/** 是否公开分享 */
	isPublic: boolean('is_public').default(false),
	/** 创建时间 */
	createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ==================== 类型导出 ====================

/** 自定义风格查询结果类型 */
export type CustomStyle = typeof customStyles.$inferSelect
/** 自定义风格插入数据类型 */
export type NewCustomStyle = typeof customStyles.$inferInsert
