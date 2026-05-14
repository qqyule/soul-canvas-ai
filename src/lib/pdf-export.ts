/**
 * 绘本 PDF 导出服务
 * @description 将绘本内容导出为精美的 PDF 文件
 */

import { jsPDF } from 'jspdf'
import type { StorybookData, StoryPage } from '@/types/storybook'
import { getGenreConfig } from '@/types/storybook'

// ==================== 字体配置 ====================

/**
 * 中文字体 CDN 地址
 * 使用 Google Fonts 的 Noto Sans SC 字体
 * 注意：需要使用支持 CORS 的 CDN 源
 */
// 主源：Google Fonts gstatic（官方 CDN，稳定可靠，已验证可用）
const CHINESE_FONT_URL =
	'https://fonts.gstatic.com/s/notosanssc/v37/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYxNbPzS5HE.ttf'
// 备用源：Seven EDU CDN（国内友好）
const BACKUP_FONT_URL =
	'https://cdn.jsdelivr.net/npm/@aspect-design/pdf-cjk-fonts@0.1.2/dist/NotoSansSC-Regular.ttf'
// 第三备用源：本地字体（需要在 public 目录放置字体文件）
const FALLBACK_FONT_URL = '/fonts/NotoSansSC-Regular.ttf'

/** 字体缓存 */
let fontCache: string | null = null
let fontLoadPromise: Promise<string> | null = null

/**
 * 加载中文字体
 * @returns Base64 编码的字体数据
 */
async function loadChineseFont(): Promise<string> {
	if (fontCache) {
		return fontCache
	}

	if (fontLoadPromise) {
		return fontLoadPromise
	}

	fontLoadPromise = (async () => {
		const loadFont = async (url: string, name: string) => {
			console.log(`正在从 ${name} 加载中文字体...`)
			const response = await fetch(url)
			if (!response.ok) {
				throw new Error(`字体加载失败 (${name}): ${response.status}`)
			}
			const arrayBuffer = await response.arrayBuffer()
			const uint8Array = new Uint8Array(arrayBuffer)

			// 简单的二进制转字符串 (避免堆栈溢出)
			let binary = ''
			const len = uint8Array.byteLength
			const chunkSize = 0x8000 // 32KB chunks

			for (let i = 0; i < len; i += chunkSize) {
				binary += String.fromCharCode.apply(
					null,
					uint8Array.subarray(i, Math.min(i + chunkSize, len))
				)
			}

			return btoa(binary)
		}

		try {
			try {
				fontCache = await loadFont(CHINESE_FONT_URL, 'gstatic')
				console.log('通过 Google gstatic 加载字体成功')
			} catch (e) {
				console.warn('gstatic 字体加载失败，尝试 jsdelivr:', e)
				try {
					fontCache = await loadFont(BACKUP_FONT_URL, 'jsdelivr')
					console.log('通过 jsdelivr 加载字体成功')
				} catch (e2) {
					console.warn('jsdelivr 字体加载失败，尝试本地字体:', e2)
					fontCache = await loadFont(FALLBACK_FONT_URL, 'local')
					console.log('通过本地字体加载成功')
				}
			}
			return fontCache as string
		} catch (error) {
			console.error('所有字体源加载均失败:', error)
			fontLoadPromise = null
			throw error
		}
	})()

	return fontLoadPromise
}

/**
 * 初始化 jsPDF 中文字体
 */
async function initializeChineseFont(doc: jsPDF): Promise<void> {
	const fontData = await loadChineseFont()

	// 添加字体到虚拟文件系统
	doc.addFileToVFS('NotoSansSC-Regular.ttf', fontData)

	// 注册字体
	doc.addFont('NotoSansSC-Regular.ttf', 'NotoSansSC', 'normal')

	// 设置默认字体
	doc.setFont('NotoSansSC')
}

// ==================== 配置 ====================

/** PDF 页面配置 */
const PDF_CONFIG = {
	/** 页面宽度（mm） */
	pageWidth: 210,
	/** 页面高度（mm） */
	pageHeight: 297,
	/** 边距（mm） */
	margin: 15,
	/** 图片区域高度比例 */
	imageHeightRatio: 0.5,
	/** 标题字体大小 */
	titleFontSize: 28,
	/** 正文字体大小 */
	bodyFontSize: 14,
	/** 页码字体大小 */
	pageNumberFontSize: 10,
}

// ==================== 工具函数 ====================

/**
 * 加载图片并转换为 Base64
 */
async function loadImageAsBase64(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.crossOrigin = 'anonymous'

		img.onload = () => {
			const canvas = document.createElement('canvas')
			canvas.width = img.naturalWidth
			canvas.height = img.naturalHeight

			const ctx = canvas.getContext('2d')
			if (!ctx) {
				reject(new Error('无法创建 canvas context'))
				return
			}

			ctx.drawImage(img, 0, 0)
			resolve(canvas.toDataURL('image/jpeg', 0.9))
		}

		img.onerror = () => {
			reject(new Error(`图片加载失败: ${url}`))
		}

		img.src = url
	})
}

/**
 * 文本换行处理
 */
function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
	const words = text.split('')
	const lines: string[] = []
	let currentLine = ''

	for (const char of words) {
		const testLine = currentLine + char
		const textWidth =
			(doc.getStringUnitWidth(testLine) * PDF_CONFIG.bodyFontSize) / doc.internal.scaleFactor

		if (textWidth > maxWidth && currentLine.length > 0) {
			lines.push(currentLine)
			currentLine = char
		} else {
			currentLine = testLine
		}
	}

	if (currentLine) {
		lines.push(currentLine)
	}

	return lines
}

// ==================== PDF 生成 ====================

/**
 * 生成绘本封面页
 */
async function generateCoverPage(doc: jsPDF, storybook: StorybookData): Promise<void> {
	const { pageWidth, pageHeight, margin, titleFontSize } = PDF_CONFIG
	const genreConfig = getGenreConfig(storybook.genre)

	// 背景渐变（使用纯色模拟）
	doc.setFillColor(255, 250, 245)
	doc.rect(0, 0, pageWidth, pageHeight, 'F')

	// 装饰性边框
	doc.setDrawColor(200, 180, 160)
	doc.setLineWidth(0.5)
	doc.rect(margin - 5, margin - 5, pageWidth - 2 * margin + 10, pageHeight - 2 * margin + 10)

	// 封面图片
	if (storybook.coverUrl) {
		try {
			const imageData = await loadImageAsBase64(storybook.coverUrl)
			const imageWidth = pageWidth - 2 * margin - 20
			const imageHeight = imageWidth * 0.75
			const imageX = (pageWidth - imageWidth) / 2
			const imageY = 50

			doc.addImage(imageData, 'JPEG', imageX, imageY, imageWidth, imageHeight)
		} catch (error) {
			console.warn('封面图片加载失败:', error)
		}
	}

	// 标题
	doc.setFontSize(titleFontSize)
	doc.setTextColor(60, 60, 60)
	const titleY = storybook.coverUrl ? 200 : 120
	doc.text(storybook.title, pageWidth / 2, titleY, { align: 'center' })

	// 类型标签
	doc.setFontSize(14)
	doc.setTextColor(120, 100, 80)
	doc.text(`${genreConfig.icon} ${genreConfig.nameZh}`, pageWidth / 2, titleY + 15, {
		align: 'center',
	})

	// 创建日期
	doc.setFontSize(10)
	doc.setTextColor(150, 150, 150)
	const dateStr = new Date(storybook.createdAt).toLocaleDateString('zh-CN')
	doc.text(`创作于 ${dateStr}`, pageWidth / 2, pageHeight - margin - 10, {
		align: 'center',
	})

	// Soul Canvas 水印
	doc.setFontSize(8)
	doc.text('Made with Soul Canvas', pageWidth / 2, pageHeight - margin, {
		align: 'center',
	})
}

/**
 * 生成故事页面
 */
async function generateStoryPage(
	doc: jsPDF,
	page: StoryPage,
	pageIndex: number,
	totalPages: number
): Promise<void> {
	const { pageWidth, pageHeight, margin, bodyFontSize, pageNumberFontSize, imageHeightRatio } =
		PDF_CONFIG

	// 页面背景
	doc.setFillColor(255, 255, 255)
	doc.rect(0, 0, pageWidth, pageHeight, 'F')

	// 页面插图
	if (page.imageUrl) {
		try {
			const imageData = await loadImageAsBase64(page.imageUrl)
			const imageWidth = pageWidth - 2 * margin
			const imageHeight = (pageHeight - 2 * margin) * imageHeightRatio
			const imageX = margin
			const imageY = margin

			// 图片边框
			doc.setDrawColor(230, 230, 230)
			doc.setLineWidth(0.3)
			doc.rect(imageX - 1, imageY - 1, imageWidth + 2, imageHeight + 2)

			doc.addImage(imageData, 'JPEG', imageX, imageY, imageWidth, imageHeight)
		} catch (error) {
			console.warn(`页面 ${page.pageNumber} 图片加载失败:`, error)
		}
	}

	// 故事文本
	const textY = margin + (pageHeight - 2 * margin) * imageHeightRatio + 20
	const textWidth = pageWidth - 2 * margin

	doc.setFontSize(bodyFontSize)
	doc.setTextColor(50, 50, 50)

	const lines = wrapText(doc, page.text, textWidth)
	let currentY = textY

	for (const line of lines) {
		if (currentY > pageHeight - margin - 20) break
		doc.text(line, margin, currentY)
		currentY += bodyFontSize * 0.5
	}

	// 页码
	doc.setFontSize(pageNumberFontSize)
	doc.setTextColor(150, 150, 150)
	doc.text(`- ${pageIndex + 1} / ${totalPages} -`, pageWidth / 2, pageHeight - margin + 5, {
		align: 'center',
	})
}

// ==================== 公开 API ====================

/**
 * 导出绘本为 PDF
 * @param storybook 绘本数据
 * @param onProgress 进度回调（0-100）
 * @returns PDF Blob
 */
export async function exportStorybookToPDF(
	storybook: StorybookData,
	onProgress?: (progress: number) => void
): Promise<Blob> {
	const doc = new jsPDF({
		orientation: 'portrait',
		unit: 'mm',
		format: 'a4',
	})

	// 初始化中文字体
	onProgress?.(0)
	await initializeChineseFont(doc)

	const totalSteps = storybook.pages.length + 1 // 封面 + 所有页面
	let currentStep = 0

	const updateProgress = () => {
		currentStep++
		onProgress?.(Math.round((currentStep / totalSteps) * 100))
	}

	// 生成封面
	await generateCoverPage(doc, storybook)
	updateProgress()

	// 生成故事页面
	for (let i = 0; i < storybook.pages.length; i++) {
		doc.addPage()
		await generateStoryPage(doc, storybook.pages[i], i, storybook.pages.length)
		updateProgress()
	}

	// 返回 Blob
	return doc.output('blob')
}

/**
 * 下载绘本 PDF
 * @param storybook 绘本数据
 * @param filename 文件名（不含扩展名）
 * @param onProgress 进度回调
 */
export async function downloadStorybookPDF(
	storybook: StorybookData,
	filename?: string,
	onProgress?: (progress: number) => void
): Promise<void> {
	const blob = await exportStorybookToPDF(storybook, onProgress)

	// 创建下载链接
	const url = URL.createObjectURL(blob)
	const link = document.createElement('a')
	link.href = url
	link.download = `${filename || storybook.title}-storybook.pdf`
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	URL.revokeObjectURL(url)
}
