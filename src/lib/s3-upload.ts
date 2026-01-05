/**
 * S3 图片上传模块
 * 将 Base64 图片上传到 S3 并返回公开 URL
 *
 * 支持的图片类型：image/jpeg、image/png、image/webp
 */

// ==================== 配置 ====================

/**
 * 获取 S3 配置
 */
function getS3Config() {
	const region = import.meta.env.VITE_S3_REGION
	const bucket = import.meta.env.VITE_S3_BUCKET
	const accessKeyId = import.meta.env.VITE_S3_ACCESS_KEY_ID
	const secretAccessKey = import.meta.env.VITE_S3_SECRET_ACCESS_KEY
	const endpoint = import.meta.env.VITE_S3_ENDPOINT // 可选，用于兼容 S3 的服务（如 Cloudflare R2、Bitiful）
	const publicUrl = import.meta.env.VITE_S3_URL // 可选，公开访问的 URL 前缀

	if (!region || !bucket || !accessKeyId || !secretAccessKey) {
		throw new Error(
			'S3 配置不完整。请在 .env.local 中配置 VITE_S3_REGION, VITE_S3_BUCKET, VITE_S3_ACCESS_KEY_ID, VITE_S3_SECRET_ACCESS_KEY'
		)
	}

	// 如果没有指定 endpoint 且没有 publicUrl，使用标准 AWS S3 URL
	const normalizedEndpoint = endpoint
		? endpoint.startsWith('http')
			? endpoint
			: `https://${endpoint}`
		: null

	return {
		region,
		bucket,
		accessKeyId,
		secretAccessKey,
		endpoint: normalizedEndpoint,
		publicUrl: publicUrl || null,
	}
}

// ==================== 工具函数 ====================

/**
 * 从 Base64 Data URL 中提取 MIME 类型和原始数据
 */
function parseBase64DataUrl(dataUrl: string): {
	mimeType: string
	base64Data: string
} {
	const match = dataUrl.match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/)
	if (!match) {
		throw new Error('不支持的图片格式。仅支持 JPEG、PNG、WebP')
	}
	return {
		mimeType: match[1],
		base64Data: match[3],
	}
}

/**
 * 将 Base64 字符串转换为 ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
	const binaryString = atob(base64)
	const bytes = new Uint8Array(binaryString.length)
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i)
	}
	return bytes.buffer
}

/**
 * 生成文件名
 */
function generateFileName(mimeType: string): string {
	const ext = mimeType.split('/')[1] || 'png'
	const timestamp = Date.now()
	const random = Math.random().toString(36).substring(2, 8)
	return `soul-canvas/${timestamp}-${random}.${ext}`
}

/**
 * 创建 AWS Signature V4 签名
 * 简化实现，用于 S3 PUT 请求
 */
async function createSignatureV4(
	method: string,
	url: URL,
	headers: Record<string, string>,
	body: ArrayBuffer,
	config: ReturnType<typeof getS3Config>
): Promise<Record<string, string>> {
	const encoder = new TextEncoder()

	// 辅助函数：HMAC-SHA256
	async function hmacSha256(
		key: ArrayBuffer,
		message: string
	): Promise<ArrayBuffer> {
		const cryptoKey = await crypto.subtle.importKey(
			'raw',
			key,
			{ name: 'HMAC', hash: 'SHA-256' },
			false,
			['sign']
		)
		return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(message))
	}

	// 辅助函数：SHA-256 哈希
	async function sha256(data: ArrayBuffer | string): Promise<string> {
		const buffer = typeof data === 'string' ? encoder.encode(data) : data
		const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
		return Array.from(new Uint8Array(hashBuffer))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('')
	}

	// 辅助函数：ArrayBuffer 转 Hex
	function bufferToHex(buffer: ArrayBuffer): string {
		return Array.from(new Uint8Array(buffer))
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('')
	}

	const now = new Date()
	const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
	const dateStamp = amzDate.substring(0, 8)

	const service = 's3'
	const host = url.host
	const payloadHash = await sha256(body)

	// 规范请求
	const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'
	const canonicalHeaders =
		[
			`content-type:${headers['Content-Type']}`,
			`host:${host}`,
			`x-amz-content-sha256:${payloadHash}`,
			`x-amz-date:${amzDate}`,
		].join('\n') + '\n'

	const canonicalRequest = [
		method,
		url.pathname,
		url.search.substring(1),
		canonicalHeaders,
		signedHeaders,
		payloadHash,
	].join('\n')

	// 待签字符串
	const algorithm = 'AWS4-HMAC-SHA256'
	const credentialScope = `${dateStamp}/${config.region}/${service}/aws4_request`
	const stringToSign = [
		algorithm,
		amzDate,
		credentialScope,
		await sha256(canonicalRequest),
	].join('\n')

	// 签名密钥
	const kDate = await hmacSha256(
		encoder.encode(`AWS4${config.secretAccessKey}`),
		dateStamp
	)
	const kRegion = await hmacSha256(kDate, config.region)
	const kService = await hmacSha256(kRegion, service)
	const kSigning = await hmacSha256(kService, 'aws4_request')

	// 最终签名
	const signature = bufferToHex(await hmacSha256(kSigning, stringToSign))

	// Authorization 头
	const authorization = `${algorithm} Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

	return {
		'x-amz-date': amzDate,
		'x-amz-content-sha256': payloadHash,
		Authorization: authorization,
	}
}

// ==================== 主函数 ====================

/**
 * 上传 Base64 图片到 S3
 *
 * @param base64DataUrl - Base64 编码的图片（含 data:image 前缀）
 * @returns 图片的公开 URL
 */
export async function uploadImageToS3(base64DataUrl: string): Promise<string> {
	const config = getS3Config()
	const { mimeType, base64Data } = parseBase64DataUrl(base64DataUrl)
	const body = base64ToArrayBuffer(base64Data)
	const fileName = generateFileName(mimeType)

	// 构建上传用的 S3 URL（包含 bucket）
	let uploadBaseUrl: string
	if (config.endpoint) {
		// 兼容 S3 服务（如 Bitiful、Cloudflare R2）
		// endpoint 格式: https://s3.bitiful.net
		// 上传 URL: https://s3.bitiful.net/bucket/path
		uploadBaseUrl = `${config.endpoint}/${config.bucket}`
	} else {
		// 标准 AWS S3
		uploadBaseUrl = `https://${config.bucket}.s3.${config.region}.amazonaws.com`
	}

	const uploadUrl = new URL(`${uploadBaseUrl}/${fileName}`)

	const headers: Record<string, string> = {
		'Content-Type': mimeType,
	}

	// 创建签名
	const signatureHeaders = await createSignatureV4(
		'PUT',
		uploadUrl,
		headers,
		body,
		config
	)
	const allHeaders = { ...headers, ...signatureHeaders }

	// 上传
	const response = await fetch(uploadUrl.toString(), {
		method: 'PUT',
		headers: allHeaders,
		body: body,
	})

	if (!response.ok) {
		const errorText = await response.text()
		console.error(`[S3] 上传失败: ${response.status}`, errorText)
		throw new Error(`S3 上传失败: ${response.status} - ${errorText}`)
	}

	// 返回公开访问 URL
	// 优先使用配置的 publicUrl，否则使用上传 URL
	const publicBaseUrl = config.publicUrl || uploadBaseUrl
	const publicUrlResult = `${publicBaseUrl}/${fileName}`

	return publicUrlResult
}

/**
 * 检查 S3 是否已配置
 */
export function isS3Configured(): boolean {
	try {
		getS3Config()
		return true
	} catch {
		return false
	}
}
