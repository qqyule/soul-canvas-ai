/**
 * 用户数据操作 Repository
 * @description 封装用户相关的数据库操作，集成 Zod 验证
 */

import { eq } from 'drizzle-orm'
import { getDb } from '../index'
import {
	users,
	type User,
	insertUserSchema,
	updateUserSchema,
	type InsertUser,
	type UpdateUser,
} from '../schema'

/**
 * 用户 Repository
 */
export const usersRepository = {
	/**
	 * 根据 ID 获取用户
	 * @param id 用户 ID
	 * @returns 用户信息或 null
	 */
	async getById(id: string): Promise<User | null> {
		const db = getDb()
		const result = await db.select().from(users).where(eq(users.id, id))
		return result[0] ?? null
	},

	/**
	 * 根据 Email 获取用户
	 * @param email 用户邮箱
	 * @returns 用户信息或 null
	 */
	async getByEmail(email: string): Promise<User | null> {
		const db = getDb()
		const result = await db.select().from(users).where(eq(users.email, email))
		return result[0] ?? null
	},

	/**
	 * 根据 OAuth 提供商信息获取用户
	 * @param provider OAuth 提供商
	 * @param providerId 提供商用户 ID
	 * @returns 用户信息或 null
	 */
	async getByProvider(
		provider: string,
		providerId: string
	): Promise<User | null> {
		const db = getDb()
		const result = await db
			.select()
			.from(users)
			.where(eq(users.provider, provider))
			.where(eq(users.providerId, providerId))
		return result[0] ?? null
	},

	/**
	 * 创建用户（带 Zod 验证）
	 * @param data 用户数据
	 * @returns 创建的用户
	 * @throws Zod 验证错误
	 */
	async create(data: InsertUser): Promise<User> {
		const db = getDb()
		const validated = insertUserSchema.parse(data)
		const result = await db.insert(users).values(validated).returning()
		return result[0]
	},

	/**
	 * 更新用户（带 Zod 验证）
	 * @param id 用户 ID
	 * @param data 更新数据
	 * @returns 更新后的用户或 null
	 * @throws Zod 验证错误
	 */
	async update(id: string, data: UpdateUser): Promise<User | null> {
		const db = getDb()
		const validated = updateUserSchema.parse(data)
		const result = await db
			.update(users)
			.set({ ...validated, updatedAt: new Date() })
			.where(eq(users.id, id))
			.returning()
		return result[0] ?? null
	},

	/**
	 * 删除用户
	 * @param id 用户 ID
	 * @returns 是否删除成功
	 */
	async delete(id: string): Promise<boolean> {
		const db = getDb()
		const result = await db.delete(users).where(eq(users.id, id)).returning()
		return result.length > 0
	},

	/**
	 * 创建或更新用户（Upsert，用于 OAuth 登录）
	 * @param data 用户数据
	 * @returns 用户信息
	 */
	async upsertByEmail(data: InsertUser): Promise<User> {
		const validated = insertUserSchema.parse(data)
		const existing = await this.getByEmail(validated.email)

		if (existing) {
			const updated = await this.update(existing.id, {
				name: validated.name,
				avatarUrl: validated.avatarUrl,
				provider: validated.provider,
				providerId: validated.providerId,
			})
			return updated ?? existing
		}

		return this.create(validated)
	},
}
