/**
 * 作品数据操作 Repository
 * @description 封装作品相关的数据库操作，集成 Zod 验证
 */

import { desc, eq, sql } from 'drizzle-orm'
import { getDb } from '../index'
import {
	type Artwork,
	artworks,
	insertArtworkSchema,
	type NewArtwork,
	type UpdateArtwork,
	updateArtworkSchema,
} from '../schema'

/**
 * 作品 Repository
 */
export const artworksRepository = {
	/**
	 * 根据 ID 获取作品
	 * @param id 作品 ID
	 * @returns 作品信息或 null
	 */
	async getById(id: string): Promise<Artwork | null> {
		const db = getDb()
		const result = await db.select().from(artworks).where(eq(artworks.id, id))
		return result[0] ?? null
	},

	/**
	 * 获取用户的所有作品
	 * @param userId 用户 ID
	 * @param limit 限制数量
	 * @param offset 偏移量
	 * @returns 作品列表
	 */
	async getByUserId(userId: string, limit = 20, offset = 0): Promise<Artwork[]> {
		const db = getDb()
		return db
			.select()
			.from(artworks)
			.where(eq(artworks.userId, userId))
			.orderBy(desc(artworks.createdAt))
			.limit(limit)
			.offset(offset)
	},

	/**
	 * 获取公开作品列表
	 * @param limit 限制数量
	 * @param offset 偏移量
	 * @returns 公开作品列表
	 */
	async getPublic(limit = 20, offset = 0): Promise<Artwork[]> {
		const db = getDb()
		return db
			.select()
			.from(artworks)
			.where(eq(artworks.isPublic, true))
			.orderBy(desc(artworks.createdAt))
			.limit(limit)
			.offset(offset)
	},

	/**
	 * 创建作品（带 Zod 验证）
	 * @param data 作品数据
	 * @returns 创建的作品
	 * @throws Zod 验证错误
	 */
	async create(data: NewArtwork): Promise<Artwork> {
		const db = getDb()
		// 验证数据
		insertArtworkSchema.parse(data)
		const result = await db.insert(artworks).values(data).returning()
		return result[0]
	},

	/**
	 * 更新作品（带 Zod 验证）
	 * @param id 作品 ID
	 * @param data 更新数据
	 * @returns 更新后的作品或 null
	 * @throws Zod 验证错误
	 */
	async update(id: string, data: UpdateArtwork): Promise<Artwork | null> {
		const db = getDb()
		const validated = updateArtworkSchema.parse(data)
		const result = await db
			.update(artworks)
			.set({ ...validated, updatedAt: new Date() })
			.where(eq(artworks.id, id))
			.returning()
		return result[0] ?? null
	},

	/**
	 * 删除作品
	 * @param id 作品 ID
	 * @returns 是否删除成功
	 */
	async delete(id: string): Promise<boolean> {
		const db = getDb()
		const result = await db.delete(artworks).where(eq(artworks.id, id)).returning()
		return result.length > 0
	},

	/**
	 * 切换作品公开状态
	 * @param id 作品 ID
	 * @returns 更新后的作品或 null
	 */
	async togglePublic(id: string): Promise<Artwork | null> {
		const existing = await this.getById(id)
		if (!existing) return null
		return this.update(id, { isPublic: !existing.isPublic })
	},

	/**
	 * 获取用户作品数量
	 * @param userId 用户 ID
	 * @returns 作品数量
	 */
	async countByUserId(userId: string): Promise<number> {
		const db = getDb()
		const result = await db
			.select({ count: sql<number>`count(*)` })
			.from(artworks)
			.where(eq(artworks.userId, userId))
		return Number(result[0]?.count ?? 0)
	},

	// ==================== 草稿相关操作 ====================

	/**
	 * 获取用户的草稿列表
	 * @param userId 用户 ID
	 * @param limit 限制数量
	 * @returns 草稿列表
	 */
	async getDraftsByUserId(userId: string, limit = 10): Promise<Artwork[]> {
		const db = getDb()
		return db
			.select()
			.from(artworks)
			.where(sql`${artworks.userId} = ${userId} AND ${artworks.isDraft} = true`)
			.orderBy(desc(artworks.updatedAt))
			.limit(limit)
	},

	/**
	 * 保存草稿（创建或更新）
	 * @param data 草稿数据
	 * @returns 保存的草稿
	 */
	async saveDraft(data: NewArtwork & { id?: string }): Promise<Artwork> {
		const db = getDb()
		// 验证数据
		insertArtworkSchema.parse({ ...data, isDraft: true })

		if (data.id) {
			// 更新现有草稿
			const result = await db
				.update(artworks)
				.set({ ...data, isDraft: true, updatedAt: new Date() })
				.where(eq(artworks.id, data.id))
				.returning()
			return result[0]
		} else {
			// 创建新草稿
			const result = await db
				.insert(artworks)
				.values({ ...data, isDraft: true })
				.returning()
			return result[0]
		}
	},

	/**
	 * 将草稿转为正式作品
	 * @param id 草稿 ID
	 * @returns 更新后的作品或 null
	 */
	async publishDraft(id: string): Promise<Artwork | null> {
		return this.update(id, { isDraft: false })
	},
}
