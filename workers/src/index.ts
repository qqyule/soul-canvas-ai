/**
 * Soul Canvas API Proxy - Cloudflare Worker
 * 代理 OpenRouter API 请求，保护 API Key 不暴露在前端
 */

export interface Env {
	/** OpenRouter API Key (通过 wrangler secret put 设置) */
	OPENROUTER_API_KEY: string
	/** 允许的来源域名，逗号分隔 */
	ALLOWED_ORIGINS: string
}

/** OpenRouter API 基础 URL */
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

/**
 * 检查请求来源是否被允许
 */
function isOriginAllowed(
	origin: string | null,
	allowedOrigins: string
): boolean {
	if (!origin) return false
	const origins = allowedOrigins.split(',').map((o) => o.trim())
	return origins.some((allowed) => {
		// 支持通配符匹配，如 *.github.io
		if (allowed.includes('*')) {
			const regex = new RegExp('^' + allowed.replace(/\*/g, '.*') + '$')
			return regex.test(origin)
		}
		return origin === allowed
	})
}

/**
 * 创建 CORS 响应头
 */
function getCorsHeaders(
	origin: string | null,
	allowedOrigins: string
): HeadersInit {
	const headers: HeadersInit = {
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		'Access-Control-Max-Age': '86400',
	}

	if (origin && isOriginAllowed(origin, allowedOrigins)) {
		headers['Access-Control-Allow-Origin'] = origin
	}

	return headers
}

/**
 * 处理 CORS 预检请求
 */
function handleOptions(request: Request, env: Env): Response {
	const origin = request.headers.get('Origin')
	return new Response(null, {
		status: 204,
		headers: getCorsHeaders(origin, env.ALLOWED_ORIGINS),
	})
}

/**
 * 代理请求到 OpenRouter API
 */
async function handleRequest(request: Request, env: Env): Promise<Response> {
	const origin = request.headers.get('Origin')
	const corsHeaders = getCorsHeaders(origin, env.ALLOWED_ORIGINS)

	// 验证来源
	if (origin && !isOriginAllowed(origin, env.ALLOWED_ORIGINS)) {
		return new Response(JSON.stringify({ error: '不允许的来源' }), {
			status: 403,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	}

	// 验证 API Key 是否配置
	if (!env.OPENROUTER_API_KEY) {
		return new Response(JSON.stringify({ error: 'API Key 未配置' }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	}

	try {
		// 解析请求路径
		const url = new URL(request.url)
		const path = url.pathname

		// 只允许特定的 API 端点
		if (path !== '/chat/completions' && path !== '/api/chat/completions') {
			return new Response(JSON.stringify({ error: '不支持的端点' }), {
				status: 404,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		// 获取请求体
		const body = await request.text()

		// 调试日志：检查 API Key（只显示前几位）
		const apiKeyPreview = env.OPENROUTER_API_KEY
			? `${env.OPENROUTER_API_KEY.substring(0, 10)}...`
			: 'undefined'
		console.log('[Worker] API Key preview:', apiKeyPreview)
		console.log('[Worker] API Key length:', env.OPENROUTER_API_KEY?.length || 0)

		// 转发请求到 OpenRouter
		const openRouterResponse = await fetch(
			`${OPENROUTER_BASE_URL}/chat/completions`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
					'HTTP-Referer': origin || 'https://soul-canvas.app',
					'X-Title': 'SoulCanvas AI',
				},
				body,
			}
		)

		// 获取响应
		const responseText = await openRouterResponse.text()

		// 返回响应给客户端
		return new Response(responseText, {
			status: openRouterResponse.status,
			headers: {
				...corsHeaders,
				'Content-Type': 'application/json',
			},
		})
	} catch (error) {
		console.error('代理请求失败:', error)
		return new Response(
			JSON.stringify({
				error: '代理请求失败',
				message: error instanceof Error ? error.message : '未知错误',
			}),
			{
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		)
	}
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// 处理 CORS 预检请求
		if (request.method === 'OPTIONS') {
			return handleOptions(request, env)
		}

		// 只允许 POST 请求
		if (request.method !== 'POST') {
			const origin = request.headers.get('Origin')
			return new Response(JSON.stringify({ error: '只支持 POST 请求' }), {
				status: 405,
				headers: {
					...getCorsHeaders(origin, env.ALLOWED_ORIGINS),
					'Content-Type': 'application/json',
				},
			})
		}

		return handleRequest(request, env)
	},
}
