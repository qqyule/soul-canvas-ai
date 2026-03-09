/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildKieImageRequest,
	createKieClient,
	createTask,
	KieAPIError,
	pollTaskResult,
	TaskTimeoutError,
} from './kie-client'

vi.mock('@/prompts', () => ({
	buildFinalPrompt: vi.fn((stylePrompt: string, userPrompt?: string) =>
		userPrompt ? `${stylePrompt} | ${userPrompt}` : stylePrompt
	),
}))

vi.mock('./s3-upload', () => ({
	isS3Configured: vi.fn(() => true),
	uploadImageToS3: vi.fn(async () => 'https://example.com/sketch.png'),
}))

describe('kie-client', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.stubEnv('VITE_KIE_API_KEY', 'test-kie-key')
		vi.stubEnv('VITE_KIE_BASE_URL', 'https://api.kie.ai/api/v1')
		vi.stubEnv('VITE_KIE_IMAGE_MODEL', '')
		global.fetch = vi.fn()
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllEnvs()
		vi.restoreAllMocks()
	})

	it('builds edit payload with image_urls and image_size', () => {
		vi.stubEnv('VITE_KIE_IMAGE_API_VARIANT', 'edit')

		expect(buildKieImageRequest('https://example.com/input.png', 'draw a fox', 'edit')).toEqual({
			model: 'google/nano-banana-edit',
			input: {
				prompt: 'draw a fox',
				image_urls: ['https://example.com/input.png'],
				output_format: 'png',
				image_size: '1:1',
			},
		})
	})

	it('builds nano-banana-2 payload with image_input and resolution fields', () => {
		vi.stubEnv('VITE_KIE_IMAGE_API_VARIANT', 'nano-banana-2')

		expect(
			buildKieImageRequest('https://example.com/input.png', 'draw a fox', 'nano-banana-2')
		).toEqual({
			model: 'nano-banana-2',
			input: {
				prompt: 'draw a fox',
				image_input: ['https://example.com/input.png'],
				aspect_ratio: '1:1',
				resolution: '1K',
				output_format: 'png',
				google_search: false,
			},
		})
	})

	it('throws when configured model and variant do not match', () => {
		vi.stubEnv('VITE_KIE_IMAGE_API_VARIANT', 'nano-banana-2')
		vi.stubEnv('VITE_KIE_IMAGE_MODEL', 'google/nano-banana-edit')

		expect(() =>
			buildKieImageRequest('https://example.com/input.png', 'draw a fox', 'nano-banana-2')
		).toThrow('Kie 图片模型与 variant 不匹配')
	})

	it('createTask returns task id on success', async () => {
		;(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => ({
				code: 200,
				msg: 'ok',
				data: { taskId: 'task-123' },
			}),
		})

		await expect(
			createTask({
				model: 'nano-banana-2',
				input: {
					prompt: 'test',
					image_input: ['https://example.com/input.png'],
				},
			})
		).resolves.toBe('task-123')
	})

	it('createTask throws on http failure', async () => {
		;(global.fetch as any).mockResolvedValue({
			ok: false,
			status: 500,
			text: async () => 'server error',
		})

		await expect(
			createTask({
				model: 'nano-banana-2',
				input: {
					prompt: 'test',
					image_input: ['https://example.com/input.png'],
				},
			})
		).rejects.toThrow('创建任务失败: 500 - server error')
	})

	it('createTask throws on business failure', async () => {
		;(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => ({
				code: 400,
				msg: 'invalid input',
				data: { taskId: '' },
			}),
		})

		await expect(
			createTask({
				model: 'nano-banana-2',
				input: {
					prompt: 'test',
					image_input: ['https://example.com/input.png'],
				},
			})
		).rejects.toThrow('创建任务失败: invalid input')
	})

	it('pollTaskResult waits through pending states and returns first image on success', async () => {
		;(global.fetch as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					code: 200,
					msg: 'ok',
					data: { taskId: 'task-1', state: 'waiting' },
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					code: 200,
					msg: 'ok',
					data: { taskId: 'task-1', state: 'generating' },
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					code: 200,
					msg: 'ok',
					data: {
						taskId: 'task-1',
						state: 'success',
						resultJson: JSON.stringify({
							resultUrls: ['https://example.com/output.png'],
						}),
					},
				}),
			})

		const promise = pollTaskResult('task-1')
		await vi.advanceTimersByTimeAsync(8000)

		await expect(promise).resolves.toBe('https://example.com/output.png')
		expect(global.fetch).toHaveBeenCalledTimes(3)
	})

	it('pollTaskResult treats unknown states as pending and keeps polling', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
		;(global.fetch as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					code: 200,
					msg: 'ok',
					data: { taskId: 'task-unknown', state: 'queued' as any },
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					code: 200,
					msg: 'ok',
					data: {
						taskId: 'task-unknown',
						state: 'success',
						resultJson: JSON.stringify({
							resultUrls: ['https://example.com/output.png'],
						}),
					},
				}),
			})

		const promise = pollTaskResult('task-unknown')
		await vi.advanceTimersByTimeAsync(5000)

		await expect(promise).resolves.toBe('https://example.com/output.png')
		expect(warnSpy).toHaveBeenCalledWith(
			'[kie-task] 遇到未识别的任务状态，按 pending 继续轮询: queued'
		)
	})

	it('pollTaskResult throws on fail state', async () => {
		;(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => ({
				code: 200,
				msg: 'ok',
				data: { taskId: 'task-2', state: 'fail', failMsg: 'unsafe prompt' },
			}),
		})

		const promise = expect(pollTaskResult('task-2')).rejects.toThrow('任务失败: unsafe prompt')
		await vi.advanceTimersByTimeAsync(2000)
		await promise
	})

	it('pollTaskResult throws when resultJson is missing or invalid', async () => {
		;(global.fetch as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					code: 200,
					msg: 'ok',
					data: { taskId: 'task-3', state: 'success' },
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					code: 200,
					msg: 'ok',
					data: { taskId: 'task-4', state: 'success', resultJson: '{bad json' },
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					code: 200,
					msg: 'ok',
					data: {
						taskId: 'task-5',
						state: 'success',
						resultJson: JSON.stringify({ resultUrls: [] }),
					},
				}),
			})

		const missingPromise = expect(pollTaskResult('task-3')).rejects.toThrow(
			'任务完成但未返回 resultJson'
		)
		await vi.advanceTimersByTimeAsync(2000)
		await missingPromise

		const invalidPromise = expect(pollTaskResult('task-4')).rejects.toThrow(
			'任务完成但 resultJson 无法解析'
		)
		await vi.advanceTimersByTimeAsync(2000)
		await invalidPromise

		const emptyPromise = expect(pollTaskResult('task-5')).rejects.toThrow('任务完成但未返回图像')
		await vi.advanceTimersByTimeAsync(2000)
		await emptyPromise
	})

	it('pollTaskResult supports legacy failed state', async () => {
		;(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => ({
				code: 200,
				msg: 'ok',
				data: { taskId: 'task-legacy', state: 'failed', failMsg: 'legacy failure' },
			}),
		})

		const promise = expect(pollTaskResult('task-legacy')).rejects.toThrow(
			'任务失败: legacy failure'
		)
		await vi.advanceTimersByTimeAsync(2000)
		await promise
	})

	it('pollTaskResult aborts when signal is cancelled', async () => {
		const controller = new AbortController()
		controller.abort()

		await expect(pollTaskResult('task-abort', controller.signal)).rejects.toThrow('请求已取消')
		expect(global.fetch).not.toHaveBeenCalled()
	})

	it('pollTaskResult throws timeout after max wait', async () => {
		;(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => ({
				code: 200,
				msg: 'ok',
				data: { taskId: 'task-timeout', state: 'processing' },
			}),
		})

		const promise = expect(pollTaskResult('task-timeout')).rejects.toBeInstanceOf(TaskTimeoutError)
		await vi.advanceTimersByTimeAsync(182000)
		await promise
	})

	it('createKieClient uses configured nano-banana-2 payload', async () => {
		vi.stubEnv('VITE_KIE_IMAGE_API_VARIANT', 'nano-banana-2')
		;(global.fetch as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					code: 200,
					msg: 'ok',
					data: { taskId: 'task-9' },
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					code: 200,
					msg: 'ok',
					data: {
						taskId: 'task-9',
						state: 'success',
						resultJson: JSON.stringify({
							resultUrls: ['https://example.com/output.png'],
						}),
					},
				}),
			})

		const client = createKieClient()
		const promise = client.generateImage({
			sketchDataUrl: 'data:image/png;base64,abc',
			stylePrompt: 'anime',
			userPrompt: 'cat',
		})

		await vi.advanceTimersByTimeAsync(2000)
		await expect(promise).resolves.toBe('https://example.com/output.png')

		const request = JSON.parse((global.fetch as any).mock.calls[0][1].body)
		expect(request).toEqual({
			model: 'nano-banana-2',
			input: {
				prompt: 'anime | cat',
				image_input: ['https://example.com/sketch.png'],
				aspect_ratio: '1:1',
				resolution: '1K',
				output_format: 'png',
				google_search: false,
			},
		})
	})

	it('pollTaskResult wraps parse failures as KieAPIError', async () => {
		;(global.fetch as any).mockResolvedValue({
			ok: true,
			json: async () => ({
				code: 200,
				msg: 'ok',
				data: { taskId: 'task-x', state: 'success', resultJson: 'nope' },
			}),
		})

		const promise = expect(pollTaskResult('task-x')).rejects.toBeInstanceOf(KieAPIError)
		await vi.advanceTimersByTimeAsync(2000)
		await promise
	})
})
