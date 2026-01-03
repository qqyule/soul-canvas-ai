/**
 * Zod 验证 Schema
 * @description 使用 drizzle-zod 自动生成验证 Schema，并添加自定义验证规则
 */

import {
	createInsertSchema,
	createSelectSchema,
	createUpdateSchema,
} from 'drizzle-zod'
import { z } from 'zod'
import { users } from './users'
import { artworks } from './artworks'
import { customStyles } from './custom-styles'
import { generationLogs, GENERATION_STATUS } from './generation-logs'
import { favorites } from './favorites'

// ==================== Users ====================

/** 用户插入验证 Schema */
export const insertUserSchema = createInsertSchema(users, {
	email: z.string().email('请输入有效的邮箱地址'),
	name: z
		.string()
		.min(1, '用户名不能为空')
		.max(50, '用户名最长50个字符')
		.optional()
		.nullable(),
	provider: z.enum(['github', 'google', 'email']).optional().nullable(),
	avatarUrl: z.string().url('请输入有效的 URL').optional().nullable(),
})

/** 用户查询结果验证 Schema */
export const selectUserSchema = createSelectSchema(users)

/** 用户更新验证 Schema */
export const updateUserSchema = createUpdateSchema(users, {
	name: z.string().min(1).max(50).optional().nullable(),
	avatarUrl: z.string().url().optional().nullable(),
})

// ==================== Artworks ====================

/** 作品插入验证 Schema */
export const insertArtworkSchema = createInsertSchema(artworks, {
	title: z.string().max(200, '标题最长200个字符').optional().nullable(),
	styleId: z.string().min(1, '风格ID不能为空'),
	prompt: z.string().max(2000, '提示词最长2000个字符').optional().nullable(),
	sketchUrl: z.string().url('请输入有效的草图 URL').optional().nullable(),
	resultUrl: z.string().url('请输入有效的结果 URL').optional().nullable(),
})

/** 作品查询结果验证 Schema */
export const selectArtworkSchema = createSelectSchema(artworks)

/** 作品更新验证 Schema */
export const updateArtworkSchema = createUpdateSchema(artworks, {
	title: z.string().max(200).optional().nullable(),
	isPublic: z.boolean().optional(),
})

// ==================== Custom Styles ====================

/** 自定义风格插入验证 Schema */
export const insertCustomStyleSchema = createInsertSchema(customStyles, {
	name: z.string().min(1, '风格名称不能为空').max(100, '风格名称最长100个字符'),
	description: z.string().max(500, '描述最长500个字符').optional().nullable(),
	promptTemplate: z
		.string()
		.min(1, '提示词模板不能为空')
		.max(2000, '提示词模板最长2000个字符'),
	referenceImageUrl: z
		.string()
		.url('请输入有效的参考图 URL')
		.optional()
		.nullable(),
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
	durationMs: z
		.number()
		.int()
		.positive('耗时必须为正整数')
		.optional()
		.nullable(),
	styleId: z.string().min(1, '风格 ID 不能为空'),
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
