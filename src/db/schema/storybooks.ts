/**
 * 绘本表结构定义
 * @description 存储用户创建的有声绘本数据
 */

import {
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'
import type { StoryGenre, StoryPage } from '@/types/storybook'

/**
 * 绘本页面数据（用于 JSONB 存储）
 */
export interface StorybookPageData {
	/** 页面 ID */
	id: string
	/** 页码 */
	pageNumber: number
	/** 插图 URL */
	imageUrl: string
	/** 故事文本 */
	text: string
	/** 旁白音频 URL */
	audioUrl?: string
}

/**
 * 绘本表
 */
export const storybooks = pgTable('storybooks', {
	/** 绘本唯一标识 */
	id: uuid('id').primaryKey().defaultRandom(),
	/** 绘本标题 */
	title: text('title').notNull(),
	/** 故事类型 */
	genre: varchar('genre', { length: 50 }).notNull().$type<StoryGenre>(),
	/** 封面图片 URL */
	coverUrl: text('cover_url'),
	/** 所有页面（JSONB 格式存储） */
	pages: jsonb('pages').notNull().$type<StorybookPageData[]>(),
	/** 语言代码 */
	language: varchar('language', { length: 10 }).notNull().default('zh-CN'),
	/** 创建者 ID (Clerk User ID，可选) */
	creatorId: varchar('creator_id', { length: 255 }),
	/** 创建时间 */
	createdAt: timestamp('created_at').notNull().defaultNow(),
	/** 更新时间 */
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ==================== 类型导出 ====================

/** 绘本查询结果类型 */
export type Storybook = typeof storybooks.$inferSelect
/** 绘本插入数据类型 */
export type NewStorybook = typeof storybooks.$inferInsert
