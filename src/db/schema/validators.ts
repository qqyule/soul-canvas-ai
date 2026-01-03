/**
 * Zod 验证 Schema
 * @description 使用 drizzle-zod 自动生成验证 Schema，并添加自定义验证规则
 * @note 使用 createSchemaFactory 以兼容 Zod v4
 */

import { createSchemaFactory } from 'drizzle-zod'
import { z } from 'zod/v4'
import { users } from './users'
import { artworks } from './artworks'
import { customStyles } from './custom-styles'
import { generationLogs, GENERATION_STATUS } from './generation-logs'
import { favorites } from './favorites'

// 使用 Zod v4 创建 schema factory
const { createInsertSchema, createSelectSchema, createUpdateSchema } =
	createSchemaFactory({ zodInstance: z })

// ==================== Users ====================

/** 用户插入验证 Schema */
export const insertUserSchema = createInsertSchema(users, {
	email: (schema) => schema.email('请输入有效的邮箱地址'),
	name: (schema) => schema.max(50, '用户名最长50个字符'),
	provider: z.enum(['github', 'google', 'email']).optional().nullable(),
	avatarUrl: (schema) => schema.url('请输入有效的 URL'),
})

/** 用户查询结果验证 Schema */
export const selectUserSchema = createSelectSchema(users)

/** 用户更新验证 Schema */
export const updateUserSchema = createUpdateSchema(users, {
	name: (schema) => schema.max(50),
	avatarUrl: (schema) => schema.url(),
})

// ==================== Artworks ====================

/** 作品插入验证 Schema */
export const insertArtworkSchema = createInsertSchema(artworks, {
	title: (schema) => schema.max(200, '标题最长200个字符'),
	styleId: (schema) => schema.min(1, '风格ID不能为空'),
	prompt: (schema) => schema.max(2000, '提示词最长2000个字符'),
	sketchUrl: (schema) => schema.url('请输入有效的草图 URL'),
	resultUrl: (schema) => schema.url('请输入有效的结果 URL'),
})

/** 作品查询结果验证 Schema */
export const selectArtworkSchema = createSelectSchema(artworks)

/** 作品更新验证 Schema */
export const updateArtworkSchema = createUpdateSchema(artworks, {
	title: (schema) => schema.max(200),
})

// ==================== Custom Styles ====================

/** 自定义风格插入验证 Schema */
export const insertCustomStyleSchema = createInsertSchema(customStyles, {
	name: (schema) =>
		schema.min(1, '风格名称不能为空').max(100, '风格名称最长100个字符'),
	description: (schema) => schema.max(500, '描述最长500个字符'),
	promptTemplate: (schema) =>
		schema.min(1, '提示词模板不能为空').max(2000, '提示词模板最长2000个字符'),
	referenceImageUrl: (schema) => schema.url('请输入有效的参考图 URL'),
})

/** 自定义风格查询结果验证 Schema */
export const selectCustomStyleSchema = createSelectSchema(customStyles)

// ==================== Favorites ====================

/** 收藏插入验证 Schema */
export const insertFavoriteSchema = createInsertSchema(favorites, {
	userId: z.string().uuid('用户 ID 格式无效'),
	artworkId: z.string().uuid('作品 ID 格式无效'),
})

/** 收藏查询结果验证 Schema */
export const selectFavoriteSchema = createSelectSchema(favorites)

// ==================== Generation Logs ====================

/** 生成日志插入验证 Schema */
export const insertGenerationLogSchema = createInsertSchema(generationLogs, {
	status: z.enum([
		GENERATION_STATUS.SUCCESS,
		GENERATION_STATUS.FAILED,
		GENERATION_STATUS.TIMEOUT,
	]),
	durationMs: (schema) => schema.positive('耗时必须为正整数'),
	styleId: (schema) => schema.min(1, '风格 ID 不能为空'),
})

/** 生成日志查询结果验证 Schema */
export const selectGenerationLogSchema = createSelectSchema(generationLogs)

// ==================== 类型导出 ====================

/** 用户插入数据类型（已验证） */
export type InsertUser = z.infer<typeof insertUserSchema>
/** 用户更新数据类型（已验证） */
export type UpdateUser = z.infer<typeof updateUserSchema>

/** 作品插入数据类型（已验证） */
export type InsertArtwork = z.infer<typeof insertArtworkSchema>
/** 作品更新数据类型（已验证） */
export type UpdateArtwork = z.infer<typeof updateArtworkSchema>

/** 自定义风格插入数据类型（已验证） */
export type InsertCustomStyle = z.infer<typeof insertCustomStyleSchema>

/** 收藏插入数据类型（已验证） */
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>

/** 生成日志插入数据类型（已验证） */
export type InsertGenerationLog = z.infer<typeof insertGenerationLogSchema>
