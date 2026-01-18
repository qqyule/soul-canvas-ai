/**
 * 英雄卡片编辑器
 * @description 用于自定义和导出英雄卡片
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Download, Sparkles, X } from 'lucide-react'
import { useCallback, useRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import HeroCard from './HeroCard'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import {
	type CardRarity,
	type HeroCardData,
	RARITY_CONFIGS,
	getRarityConfig,
} from '@/types/hero-card'

interface HeroCardEditorProps {
	/** 是否打开 */
	open: boolean
	/** 关闭回调 */
	onClose: () => void
	/** 作品图片 URL */
	imageUrl: string
	/** 风格 ID */
	styleId: string
	/** 风格中文名 */
	styleName: string
	/** 创建者名称（可选） */
	creatorName?: string
}

/**
 * 生成唯一的收藏编号
 */
const generateSerialNumber = (): number => {
	// 基于时间戳生成一个较大的序列号
	const timestamp = Date.now()
	return Math.floor((timestamp % 1000000) + Math.random() * 1000)
}

/**
 * 将图片 URL 转换为 Base64
 * 解决跨域图片导出问题
 */
const imageUrlToBase64 = async (url: string): Promise<string> => {
	try {
		const response = await fetch(url, { mode: 'cors' })
		const blob = await response.blob()
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.onloadend = () => resolve(reader.result as string)
			reader.onerror = reject
			reader.readAsDataURL(blob)
		})
	} catch (error) {
		console.warn('图片转换失败，使用原始 URL:', error)
		return url
	}
}

/**
 * 等待图片加载完成
 */
const waitForImageLoad = (element: HTMLElement): Promise<void> => {
	return new Promise((resolve) => {
		const images = element.querySelectorAll('img')
		if (images.length === 0) {
			resolve()
			return
		}

		let loadedCount = 0
		const checkAllLoaded = () => {
			loadedCount++
			if (loadedCount >= images.length) {
				resolve()
			}
		}

		images.forEach((img) => {
			if (img.complete) {
				checkAllLoaded()
			} else {
				img.onload = checkAllLoaded
				img.onerror = checkAllLoaded
			}
		})

		// 超时保护：最多等待 5 秒
		setTimeout(resolve, 5000)
	})
}

/**
 * 英雄卡片编辑器组件
 */
const HeroCardEditor = ({
	open,
	onClose,
	imageUrl,
	styleId,
	styleName,
	creatorName,
}: HeroCardEditorProps) => {
	const { toast } = useToast()
	const cardRef = useRef<HTMLDivElement>(null)

	// 卡片状态
	const [title, setTitle] = useState('我的艺术作品')
	const [rarity, setRarity] = useState<CardRarity>('rare')
	const [isExporting, setIsExporting] = useState(false)
	const [base64ImageUrl, setBase64ImageUrl] = useState<string>('')

	// 预加载图片并转换为 Base64
	useEffect(() => {
		if (open && imageUrl) {
			imageUrlToBase64(imageUrl).then(setBase64ImageUrl)
		}
	}, [open, imageUrl])

	// 生成卡片数据（使用 Base64 图片）
	const cardData: HeroCardData = {
		id: 'preview',
		title,
		imageUrl: base64ImageUrl || imageUrl,
		styleId,
		styleName,
		rarity,
		createdAt: new Date(),
		serialNumber: generateSerialNumber(),
		creatorName,
	}

	/**
	 * 导出卡片为 PNG
	 * 使用 html2canvas 直接截图原始元素
	 */
	const handleExport = useCallback(async () => {
		if (!cardRef.current) return

		setIsExporting(true)
		try {
			// 1. 等待 base64 图片加载完成
			if (!base64ImageUrl) {
				throw new Error('图片还未加载完成，请稍后重试')
			}

			// 2. 等待字体加载
			if (document.fonts) {
				await document.fonts.ready
			}

			// 3. 等待原始元素中的图片完全加载
			await waitForImageLoad(cardRef.current)

			// 4. 短暂延时确保渲染完成
			await new Promise((resolve) => setTimeout(resolve, 100))

			// 5. 检查元素尺寸
			const rect = cardRef.current.getBoundingClientRect()
			console.log('HeroCard dimensions:', {
				width: rect.width,
				height: rect.height,
			})

			if (rect.width === 0 || rect.height === 0) {
				throw new Error('卡片元素尺寸为 0，请确保弹窗已完全打开')
			}

			// 6. 使用 html2canvas 截图
			const canvas = await html2canvas(cardRef.current, {
				scale: 2, // 2x 分辨率
				useCORS: true, // 允许跨域图片
				allowTaint: false,
				backgroundColor: null, // 透明背景
				logging: false,
			})

			// 7. 转换为 PNG 并下载
			const dataUrl = canvas.toDataURL('image/png', 1.0)

			if (!dataUrl || dataUrl === 'data:,') {
				throw new Error('生成的图片数据为空')
			}

			const link = document.createElement('a')
			link.download = `hero-card-${Date.now()}.png`
			link.href = dataUrl
			link.click()

			toast({
				title: '导出成功! 🎉',
				description: '英雄卡片已保存到您的设备',
			})
		} catch (error) {
			console.error('Export failed:', error)
			toast({
				title: '导出失败',
				description:
					error instanceof Error
						? error.message
						: '无法导出卡片，请检查网络或重试。',
				variant: 'destructive',
			})
		} finally {
			setIsExporting(false)
		}
	}, [toast, base64ImageUrl])

	/**
	 * 重置状态
	 */
	const handleClose = useCallback(() => {
		setTitle('我的艺术作品')
		setRarity('rare')
		onClose()
	}, [onClose])

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Sparkles className="w-5 h-5 text-primary" />
						制作英雄卡片
					</DialogTitle>
					<DialogDescription>
						为您的艺术作品创建一张独特的收藏卡片
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
					{/* 左侧：编辑区 */}
					<div className="space-y-6">
						{/* 标题输入 */}
						<div className="space-y-2">
							<Label htmlFor="card-title">作品标题</Label>
							<Input
								id="card-title"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="输入作品标题..."
								maxLength={20}
							/>
							<p className="text-xs text-muted-foreground">{title.length}/20</p>
						</div>

						{/* 稀有度选择 */}
						<div className="space-y-2">
							<Label>选择稀有度</Label>
							<div className="grid grid-cols-2 gap-2">
								{RARITY_CONFIGS.map((config) => (
									<motion.button
										key={config.id}
										type="button"
										onClick={() => setRarity(config.id)}
										className={cn(
											'relative p-3 rounded-lg border-2 transition-all text-center',
											rarity === config.id
												? 'border-primary bg-primary/5'
												: 'border-border hover:border-primary/50'
										)}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<div className={cn('text-sm font-bold', config.titleColor)}>
											★ {config.nameZh} ★
										</div>
										<div className="text-xs text-muted-foreground mt-1">
											{config.name}
										</div>
										{rarity === config.id && (
											<motion.div
												layoutId="rarity-indicator"
												className="absolute inset-0 border-2 border-primary rounded-lg"
												initial={false}
												transition={{ duration: 0.2 }}
											/>
										)}
									</motion.button>
								))}
							</div>
						</div>

						{/* 导出按钮 */}
						<Button
							onClick={handleExport}
							disabled={isExporting || !title.trim()}
							className="w-full gap-2"
							size="lg"
						>
							{isExporting ? (
								<>
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									导出中...
								</>
							) : (
								<>
									<Download className="w-4 h-4" />
									导出 PNG
								</>
							)}
						</Button>
					</div>

					{/* 右侧：预览区 */}
					<div className="flex items-center justify-center">
						<div ref={cardRef} className="inline-block">
							<HeroCard data={cardData} animated={false} />
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default HeroCardEditor
