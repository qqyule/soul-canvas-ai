/**
 * Zod 验证 Schema 单元测试
 * @description 测试数据验证规则和错误提示
 */

import { describe, expect, it } from 'vitest'
import {
	insertArtworkSchema,
	insertCustomStyleSchema,
	insertFavoriteSchema,
	insertGenerationLogSchema,
	insertUserSchema,
	updateUserSchema,
} from '../schema/validators'

describe('用户验证 Schema', () => {
	describe('insertUserSchema', () => {
		it('应该验证有效的用户数据', () => {
			const validUser = {
				email: 'test@example.com',
				name: '张三',
				provider: 'github' as const,
				providerId: '12345',
			}
			const result = insertUserSchema.safeParse(validUser)
			expect(result.success).toBe(true)
		})

		it('应该拒绝无效的邮箱格式', () => {
			const invalidUser = {
				email: 'invalid-email',
				name: '张三',
			}
			const result = insertUserSchema.safeParse(invalidUser)
			expect(result.success).toBe(false)
		})

		it('应该允许 name 为空', () => {
			const userWithoutName = {
				email: 'test@example.com',
			}
			const result = insertUserSchema.safeParse(userWithoutName)
			expect(result.success).toBe(true)
		})

		it('应该拒绝超长的用户名', () => {
			const userWithLongName = {
				email: 'test@example.com',
				name: 'a'.repeat(51), // 超过 50 个字符
			}
			const result = insertUserSchema.safeParse(userWithLongName)
			expect(result.success).toBe(false)
		})

		it('应该只接受有效的 provider 值', () => {
			const validProviders = ['github', 'google', 'email'] as const
			validProviders.forEach((provider) => {
				const user = { email: 'test@example.com', provider }
				expect(insertUserSchema.safeParse(user).success).toBe(true)
			})

			const invalidProvider = { email: 'test@example.com', provider: 'invalid' }
			expect(insertUserSchema.safeParse(invalidProvider).success).toBe(false)
		})

		it('应该验证 avatarUrl 格式', () => {
			const validUrl = {
				email: 'test@example.com',
				avatarUrl: 'https://example.com/avatar.png',
			}
			expect(insertUserSchema.safeParse(validUrl).success).toBe(true)

			const invalidUrl = {
				email: 'test@example.com',
				avatarUrl: 'not-a-url',
			}
			const result = insertUserSchema.safeParse(invalidUrl)
			expect(result.success).toBe(false)
		})
	})

	describe('updateUserSchema', () => {
		it('应该允许部分更新', () => {
			const partialUpdate = { name: '李四' }
			expect(updateUserSchema.safeParse(partialUpdate).success).toBe(true)
		})

		it('应该允许空对象', () => {
			expect(updateUserSchema.safeParse({}).success).toBe(true)
		})
	})
})

describe('作品验证 Schema', () => {
	describe('insertArtworkSchema', () => {
		it('应该验证有效的作品数据', () => {
			const validArtwork = {
				styleId: 'anime',
				title: '测试作品',
				prompt: '可爱的猫咪',
			}
			expect(insertArtworkSchema.safeParse(validArtwork).success).toBe(true)
		})

		it('应该要求 styleId 不为空', () => {
			const emptyStyleId = {
				styleId: '',
				title: '测试作品',
			}
			const result = insertArtworkSchema.safeParse(emptyStyleId)
			expect(result.success).toBe(false)
		})

		it('应该拒绝超长标题', () => {
			const longTitle = {
				styleId: 'anime',
				title: 'a'.repeat(201), // 超过 200 个字符
			}
			const result = insertArtworkSchema.safeParse(longTitle)
			expect(result.success).toBe(false)
		})

		it('应该拒绝超长提示词', () => {
			const longPrompt = {
				styleId: 'anime',
				prompt: 'a'.repeat(2001), // 超过 2000 个字符
			}
			const result = insertArtworkSchema.safeParse(longPrompt)
			expect(result.success).toBe(false)
		})

		it('应该验证 URL 格式', () => {
			const invalidUrls = {
				styleId: 'anime',
				sketchUrl: 'not-a-url',
			}
			expect(insertArtworkSchema.safeParse(invalidUrls).success).toBe(false)

			const validUrls = {
				styleId: 'anime',
				sketchUrl: 'https://example.com/sketch.png',
				resultUrl: 'https://example.com/result.png',
			}
			expect(insertArtworkSchema.safeParse(validUrls).success).toBe(true)
		})
	})
})

describe('自定义风格验证 Schema', () => {
	describe('insertCustomStyleSchema', () => {
		it('应该验证有效的风格数据', () => {
			const validStyle = {
				name: '我的风格',
				promptTemplate: '将图像转换为 {{style}} 风格',
			}
			expect(insertCustomStyleSchema.safeParse(validStyle).success).toBe(true)
		})

		it('应该要求 name 不为空', () => {
			const emptyName = {
				name: '',
				promptTemplate: '模板',
			}
			const result = insertCustomStyleSchema.safeParse(emptyName)
			expect(result.success).toBe(false)
		})

		it('应该要求 promptTemplate 不为空', () => {
			const emptyTemplate = {
				name: '风格名称',
				promptTemplate: '',
			}
			const result = insertCustomStyleSchema.safeParse(emptyTemplate)
			expect(result.success).toBe(false)
		})

		it('应该拒绝超长描述', () => {
			const longDescription = {
				name: '风格',
				promptTemplate: '模板',
				description: 'a'.repeat(501), // 超过 500 个字符
			}
			const result = insertCustomStyleSchema.safeParse(longDescription)
			expect(result.success).toBe(false)
		})
	})
})

describe('生成日志验证 Schema', () => {
	describe('insertGenerationLogSchema', () => {
		it('应该验证有效的日志数据', () => {
			const validLog = {
				styleId: 'anime',
				status: 'success' as const,
				durationMs: 1500,
			}
			expect(insertGenerationLogSchema.safeParse(validLog).success).toBe(true)
		})

		it('应该只接受有效的 status 值', () => {
			const validStatuses = ['success', 'failed', 'timeout'] as const
			validStatuses.forEach((status) => {
				const log = { styleId: 'anime', status }
				expect(insertGenerationLogSchema.safeParse(log).success).toBe(true)
			})

			const invalidStatus = { styleId: 'anime', status: 'invalid' }
			expect(insertGenerationLogSchema.safeParse(invalidStatus).success).toBe(false)
		})

		it('应该拒绝负数的 durationMs', () => {
			const negativeDuration = {
				styleId: 'anime',
				status: 'success' as const,
				durationMs: -100,
			}
			expect(insertGenerationLogSchema.safeParse(negativeDuration).success).toBe(false)
		})
	})
})

describe('收藏验证 Schema', () => {
	describe('insertFavoriteSchema', () => {
		it('应该验证有效的 UUID', () => {
			const validFavorite = {
				userId: '550e8400-e29b-41d4-a716-446655440000',
				artworkId: '550e8400-e29b-41d4-a716-446655440001',
			}
			expect(insertFavoriteSchema.safeParse(validFavorite).success).toBe(true)
		})

		it('应该拒绝无效的 UUID', () => {
			const invalidUserId = {
				userId: 'not-a-uuid',
				artworkId: '550e8400-e29b-41d4-a716-446655440001',
			}
			const result = insertFavoriteSchema.safeParse(invalidUserId)
			expect(result.success).toBe(false)
		})
	})
})
