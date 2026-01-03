/**
 * 收藏表结构定义
 * @description 存储用户收藏的作品关系
 */

import { pgTable, timestamp, uuid, primaryKey } from 'drizzle-orm/pg-core'
import { users } from './users'
import { artworks } from './artworks'

/**
 * 收藏表（多对多关系表）
 */
export const favorites = pgTable(
	'favorites',
	{
		/** 用户 ID */
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		/** 作品 ID */
		artworkId: uuid('artwork_id')
			.notNull()
			.references(() => artworks.id, { onDelete: 'cascade' }),
		/** 收藏时间 */
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => ({
		/** 联合主键 */
		pk: primaryKey({ columns: [table.userId, table.artworkId] }),
	})
)

// ==================== 类型导出 ====================

/** 收藏记录查询结果类型 */
export type Favorite = typeof favorites.$inferSelect
/** 收藏记录插入数据类型 */
export type NewFavorite = typeof favorites.$inferInsert
