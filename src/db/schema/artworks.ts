/**
 * 作品表结构定义
 * @description 存储用户创作的作品信息
 */

import {
	boolean,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'

/**
 * 作品表
 */
export const artworks = pgTable('artworks', {
	/** 作品唯一标识 */
	id: uuid('id').primaryKey().defaultRandom(),
	/** 所属用户 ID (Clerk User ID) */
	userId: varchar('user_id', { length: 255 }).notNull(),
	/** 作品标题 */
	title: text('title'),
	/** 草图存储 URL */
	sketchUrl: text('sketch_url'),
	/** 生成结果存储 URL (主图) */
	resultUrl: text('result_url').notNull(),
	/** 缩略图 URL */
	thumbnailUrl: text('thumbnail_url'),
	/** 使用的风格 ID */
	styleId: text('style_id').notNull(),
	/** 使用的风格名称 */
	styleName: text('style_name'),
	/** 生成时使用的提示词 */
	prompt: text('prompt'),
	/** 图片宽度 */
	width: integer('width'),
	/** 图片高度 */
	height: integer('height'),
	/** 浏览量 */
	views: integer('views').default(0),
	/** 点赞数 */
	likes: integer('likes').default(0),
	/** 额外元数据（JSON 格式） */
	metadata: jsonb('metadata'),
	/** 是否公开展示 */
	isPublic: boolean('is_public').default(false),
	/** 是否为草稿（未完成作品） */
	isDraft: boolean('is_draft').default(false),
	/** 创建时间 */
	createdAt: timestamp('created_at').notNull().defaultNow(),
	/** 更新时间 */
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ==================== 类型导出 ====================

/** 作品查询结果类型 */
export type Artwork = typeof artworks.$inferSelect
/** 作品插入数据类型 */
export type NewArtwork = typeof artworks.$inferInsert
