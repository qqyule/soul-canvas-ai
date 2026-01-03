/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateImageFromSketch } from './openrouter'

describe('generateImageFromSketch', () => {
	beforeEach(() => {
		vi.stubEnv('VITE_OPENROUTER_API_KEY', 'test-key')
		vi.stubEnv('VITE_OPENROUTER_IMAGE_MODEL', 'google/gemini-2.5-flash-image')
		global.fetch = vi.fn()
	})

	afterEach(() => {
		vi.unstubAllEnvs()
		vi.restoreAllMocks()
	})

	it('should return image url on success', async () => {
		const mockResponse = {
			ok: true,
			json: async () => ({
				choices: [{ message: { content: 'https://example.com/image.png' } }],
			}),
		}
		;(global.fetch as any).mockResolvedValue(mockResponse)

		const result = await generateImageFromSketch(
			'data:image/png;base64,abc',
			'Anime Style',
			'A cat'
		)
		expect(result).toBe('https://example.com/image.png')
	})

	it('should retry on 500 network error and eventually succeed', async () => {
		const mockErrorResponse = {
			ok: false,
			status: 500,
			text: async () => 'Internal Server Error',
		}
		const mockSuccessResponse = {
			ok: true,
			json: async () => ({
				choices: [{ message: { content: 'https://example.com/image.png' } }],
			}),
		}

		// First call 500, Second call 200
		;(global.fetch as any)
			.mockResolvedValueOnce(mockErrorResponse)
			.mockResolvedValueOnce(mockSuccessResponse)

		const result = await generateImageFromSketch(
			'data:image/png;base64,abc',
			'Anime Style'
		)

		expect(result).toBe('https://example.com/image.png')
		expect(global.fetch).toHaveBeenCalledTimes(2)
	})

	it('should retry on fetch failure (Network Error) and eventually succeed', async () => {
		// First call rejects (Network Error), Second call 200
		;(global.fetch as any)
			.mockRejectedValueOnce(new TypeError('Network request failed'))
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					choices: [
						{ message: { content: 'https://example.com/success.png' } },
					],
				}),
			})

		const result = await generateImageFromSketch(
			'data:image/png;base64,abc',
			'Style'
		)
		expect(result).toBe('https://example.com/success.png')
		expect(global.fetch).toHaveBeenCalledTimes(2)
	})

	it('should fail after max retries (2 retries -> 3 total calls)', async () => {
		const mockErrorResponse = {
			ok: false,
			status: 503,
			text: async () => 'Service Unavailable',
		}

		// All calls fail
		;(global.fetch as any).mockResolvedValue(mockErrorResponse)

		await expect(
			generateImageFromSketch('data:image/png;base64,abc', 'Style')
		).rejects.toThrow('服务器错误: 503')

		// Initial + 2 Retries = 3 Calls
		expect(global.fetch).toHaveBeenCalledTimes(3)
	}, 10000) // Increase timeout for this test as it involves delays

	it('should NOT retry on 400 client error', async () => {
		const mockResponse = {
			ok: false,
			status: 400,
			text: async () => 'Bad Request',
		}
		;(global.fetch as any).mockResolvedValue(mockResponse)

		await expect(
			generateImageFromSketch('data:image/png;base64,abc', 'Style')
		).rejects.toThrow('图像生成失败: 400')

		expect(global.fetch).toHaveBeenCalledTimes(1)
	})
})
