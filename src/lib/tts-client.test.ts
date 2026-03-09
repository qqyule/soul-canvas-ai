/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { generateSpeech } from './tts-client'

describe('tts-client Kie state compatibility', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.stubEnv('VITE_KIE_API_KEY', 'test-kie-key')
		vi.stubEnv('VITE_KIE_BASE_URL', 'https://api.kie.ai/api/v1')
		global.fetch = vi.fn()
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.unstubAllEnvs()
		vi.restoreAllMocks()
	})

	it('returns audio url after queuing -> success', async () => {
		;(global.fetch as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					code: 200,
					msg: 'ok',
					data: { taskId: 'tts-task-1' },
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					code: 200,
					msg: 'ok',
					data: { taskId: 'tts-task-1', state: 'queuing' },
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					code: 200,
					msg: 'ok',
					data: {
						taskId: 'tts-task-1',
						state: 'success',
						resultJson: JSON.stringify({ audioUrl: 'https://example.com/audio.mp3' }),
					},
				}),
			})

		const promise = generateSpeech({ text: 'hello' })
		await vi.advanceTimersByTimeAsync(3000)

		await expect(promise).resolves.toEqual({
			audioUrl: 'https://example.com/audio.mp3',
			taskId: 'tts-task-1',
		})
	})

	it('throws on new fail state', async () => {
		;(global.fetch as any)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					code: 200,
					msg: 'ok',
					data: { taskId: 'tts-task-2' },
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					code: 200,
					msg: 'ok',
					data: { taskId: 'tts-task-2', state: 'fail', failMsg: 'voice unavailable' },
				}),
			})

		const promise = expect(generateSpeech({ text: 'hello' })).rejects.toThrow(
			'TTS 任务失败: voice unavailable'
		)
		await vi.advanceTimersByTimeAsync(1000)
		await promise
	})
})
