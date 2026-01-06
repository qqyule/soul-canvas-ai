/**
 * Repository 层单元测试
 * @description 测试 Repository 的导出和基本结构
 */

import { describe, expect, it } from 'vitest'
import { artworksRepository, generationLogsRepository, usersRepository } from '../repositories'

describe('Repository 导出验证', () => {
	describe('usersRepository', () => {
		it('应该导出所有必需的方法', () => {
			expect(usersRepository.getById).toBeDefined()
			expect(usersRepository.getByEmail).toBeDefined()
			expect(usersRepository.getByProvider).toBeDefined()
			expect(usersRepository.create).toBeDefined()
			expect(usersRepository.update).toBeDefined()
			expect(usersRepository.delete).toBeDefined()
			expect(usersRepository.upsertByEmail).toBeDefined()
		})

		it('所有方法应该是函数', () => {
			expect(typeof usersRepository.getById).toBe('function')
			expect(typeof usersRepository.getByEmail).toBe('function')
			expect(typeof usersRepository.getByProvider).toBe('function')
			expect(typeof usersRepository.create).toBe('function')
			expect(typeof usersRepository.update).toBe('function')
			expect(typeof usersRepository.delete).toBe('function')
			expect(typeof usersRepository.upsertByEmail).toBe('function')
		})
	})

	describe('artworksRepository', () => {
		it('应该导出所有必需的方法', () => {
			expect(artworksRepository.getById).toBeDefined()
			expect(artworksRepository.getByUserId).toBeDefined()
			expect(artworksRepository.getPublic).toBeDefined()
			expect(artworksRepository.create).toBeDefined()
			expect(artworksRepository.update).toBeDefined()
			expect(artworksRepository.delete).toBeDefined()
			expect(artworksRepository.togglePublic).toBeDefined()
			expect(artworksRepository.countByUserId).toBeDefined()
		})

		it('所有方法应该是函数', () => {
			expect(typeof artworksRepository.getById).toBe('function')
			expect(typeof artworksRepository.getByUserId).toBe('function')
			expect(typeof artworksRepository.getPublic).toBe('function')
			expect(typeof artworksRepository.create).toBe('function')
			expect(typeof artworksRepository.update).toBe('function')
			expect(typeof artworksRepository.delete).toBe('function')
			expect(typeof artworksRepository.togglePublic).toBe('function')
			expect(typeof artworksRepository.countByUserId).toBe('function')
		})
	})

	describe('generationLogsRepository', () => {
		it('应该导出所有必需的方法', () => {
			expect(generationLogsRepository.create).toBeDefined()
			expect(generationLogsRepository.getByUserId).toBeDefined()
			expect(generationLogsRepository.getFailed).toBeDefined()
			expect(generationLogsRepository.getStats).toBeDefined()
			expect(generationLogsRepository.logSuccess).toBeDefined()
			expect(generationLogsRepository.logFailure).toBeDefined()
			expect(generationLogsRepository.logTimeout).toBeDefined()
		})

		it('所有方法应该是函数', () => {
			expect(typeof generationLogsRepository.create).toBe('function')
			expect(typeof generationLogsRepository.getByUserId).toBe('function')
			expect(typeof generationLogsRepository.getFailed).toBe('function')
			expect(typeof generationLogsRepository.getStats).toBe('function')
			expect(typeof generationLogsRepository.logSuccess).toBe('function')
			expect(typeof generationLogsRepository.logFailure).toBe('function')
			expect(typeof generationLogsRepository.logTimeout).toBe('function')
		})
	})
})
