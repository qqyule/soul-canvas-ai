/**
 * 风格预设配置测试
 * @description 验证所有风格预设的完整性和正确性
 */

import { describe, expect, it } from 'vitest'
import {
	getDefaultStyle,
	getStyleById,
	STYLE_PRESETS,
	type StylePreset,
} from '../style-presets'

describe('风格预设配置', () => {
	describe('STYLE_PRESETS', () => {
		it('应该包含至少 6 种风格', () => {
			expect(STYLE_PRESETS.length).toBeGreaterThanOrEqual(6)
		})

		it('每个风格应该具有完整的必填字段', () => {
			const requiredFields: (keyof StylePreset)[] = [
				'id',
				'name',
				'nameZh',
				'description',
				'prompt',
				'gradient',
				'icon',
				'imageUrl',
				'category',
			]

			for (const style of STYLE_PRESETS) {
				for (const field of requiredFields) {
					expect(
						style[field],
						`风格 "${style.id}" 缺少字段 "${field}"`
					).toBeDefined()
					expect(
						style[field],
						`风格 "${style.id}" 的字段 "${field}" 不应为空`
					).not.toBe('')
				}
			}
		})

		it('所有风格的 ID 应该唯一', () => {
			const ids = STYLE_PRESETS.map((style) => style.id)
			const uniqueIds = new Set(ids)
			expect(uniqueIds.size).toBe(ids.length)
		})

		it('所有风格应该有有效的 category', () => {
			const validCategories = ['all', 'realistic', 'anime', '3d', 'artistic']
			for (const style of STYLE_PRESETS) {
				expect(
					validCategories.includes(style.category),
					`风格 "${style.id}" 的 category "${style.category}" 无效`
				).toBe(true)
			}
		})

		it('所有风格的 imageUrl 应该以 /styles/ 开头', () => {
			for (const style of STYLE_PRESETS) {
				expect(
					style.imageUrl.startsWith('/styles/'),
					`风格 "${style.id}" 的 imageUrl 应该以 /styles/ 开头`
				).toBe(true)
			}
		})

		it('所有风格的 gradient 应该是有效的 Tailwind 渐变格式', () => {
			for (const style of STYLE_PRESETS) {
				expect(
					style.gradient.startsWith('from-'),
					`风格 "${style.id}" 的 gradient 应该以 from- 开头`
				).toBe(true)
			}
		})
	})

	describe('新增风格验证', () => {
		const newStyleIds = [
			'watercolor',
			'claymation',
			'pixel-art',
			'anime',
			'oil-painting',
			'christmas',
		]

		it.each(newStyleIds)('应该包含风格 "%s"', (styleId) => {
			const style = STYLE_PRESETS.find((s) => s.id === styleId)
			expect(style, `未找到风格 "${styleId}"`).toBeDefined()
		})
	})

	describe('getStyleById', () => {
		it('应该返回正确的风格', () => {
			const style = getStyleById('logo')
			expect(style).toBeDefined()
			expect(style?.id).toBe('logo')
		})

		it('查找不存在的风格应返回 undefined', () => {
			const style = getStyleById('non-existent')
			expect(style).toBeUndefined()
		})
	})

	describe('getDefaultStyle', () => {
		it('应该返回第一个风格', () => {
			const defaultStyle = getDefaultStyle()
			expect(defaultStyle).toBe(STYLE_PRESETS[0])
		})
	})
})
