/**
 * 有声书阅读器页面
 * @description 沉浸式绘本阅读体验，支持翻页和自动音频播放
 */

import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import {
	ArrowLeft,
	ArrowRight,
	ChevronLeft,
	Loader2,
	Pause,
	Play,
	Share2,
	Volume2,
	VolumeX,
	X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { db, schema } from '@/db'
import { eq } from 'drizzle-orm'
import {
	getGenreConfig,
	type StorybookData,
	type StoryPage,
} from '@/types/storybook'
import { cn } from '@/lib/utils'

/**
 * 有声书阅读器页面
 */
const StorybookReader = () => {
	const { storybookId } = useParams<{ storybookId: string }>()
	const navigate = useNavigate()
	const { toast } = useToast()

	// 绘本数据
	const [storybook, setStorybook] = useState<StorybookData | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// 阅读状态
	const [currentPage, setCurrentPage] = useState(-1) // -1 表示封面
	const [isPlaying, setIsPlaying] = useState(false)
	const [isMuted, setIsMuted] = useState(false)
	const [autoPlay, setAutoPlay] = useState(true)

	// 音频引用
	const audioRef = useRef<HTMLAudioElement | null>(null)

	/**
	 * 加载绘本数据
	 */
	useEffect(() => {
		const loadStorybook = async () => {
			if (!storybookId) {
				setError('无效的绘本链接')
				setIsLoading(false)
				return
			}

			try {
				const result = await db
					.select()
					.from(schema.storybooks)
					.where(eq(schema.storybooks.id, storybookId))
					.limit(1)

				if (result.length === 0) {
					setError('绘本不存在或已被删除')
					setIsLoading(false)
					return
				}

				const data = result[0]
				// 转换数据格式
				setStorybook({
					id: data.id,
					title: data.title,
					genre: data.genre,
					coverUrl: data.coverUrl || '',
					pages: data.pages as StoryPage[],
					language: data.language,
					createdAt: data.createdAt,
					updatedAt: data.updatedAt,
					creatorId: data.creatorId || undefined,
				})
			} catch (err) {
				console.error('加载绘本失败:', err)
				setError('加载失败，请稍后重试')
			} finally {
				setIsLoading(false)
			}
		}

		loadStorybook()
	}, [storybookId])

	/**
	 * 获取当前页面数据
	 */
	const getCurrentPageData = useCallback((): StoryPage | null => {
		if (
			!storybook ||
			currentPage < 0 ||
			currentPage >= storybook.pages.length
		) {
			return null
		}
		return storybook.pages[currentPage]
	}, [storybook, currentPage])

	/**
	 * 播放当前页音频
	 */
	useEffect(() => {
		const pageData = getCurrentPageData()

		// 停止之前的音频
		if (audioRef.current) {
			audioRef.current.pause()
			audioRef.current = null
		}

		// 如果当前页有音频且启用自动播放
		if (pageData?.audioUrl && autoPlay && !isMuted) {
			const audio = new Audio(pageData.audioUrl)
			audio.volume = isMuted ? 0 : 1
			audioRef.current = audio

			audio.addEventListener('play', () => setIsPlaying(true))
			audio.addEventListener('pause', () => setIsPlaying(false))
			audio.addEventListener('ended', () => setIsPlaying(false))

			audio.play().catch((err) => {
				console.warn('音频播放失败:', err)
			})
		}

		return () => {
			if (audioRef.current) {
				audioRef.current.pause()
			}
		}
	}, [currentPage, getCurrentPageData, autoPlay, isMuted])

	/**
	 * 切换播放/暂停
	 */
	const handleTogglePlay = useCallback(() => {
		const audio = audioRef.current
		if (!audio) return

		if (isPlaying) {
			audio.pause()
		} else {
			audio.play().catch(console.warn)
		}
	}, [isPlaying])

	/**
	 * 切换静音
	 */
	const handleToggleMute = useCallback(() => {
		setIsMuted((prev) => !prev)
		if (audioRef.current) {
			audioRef.current.volume = isMuted ? 1 : 0
		}
	}, [isMuted])

	/**
	 * 下一页
	 */
	const handleNextPage = useCallback(() => {
		if (!storybook) return
		if (currentPage < storybook.pages.length - 1) {
			setCurrentPage((prev) => prev + 1)
		}
	}, [storybook, currentPage])

	/**
	 * 上一页
	 */
	const handlePrevPage = useCallback(() => {
		if (currentPage > -1) {
			setCurrentPage((prev) => prev - 1)
		}
	}, [currentPage])

	/**
	 * 处理滑动手势
	 */
	const handleDragEnd = useCallback(
		(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
			const threshold = 50
			if (info.offset.x < -threshold) {
				handleNextPage()
			} else if (info.offset.x > threshold) {
				handlePrevPage()
			}
		},
		[handleNextPage, handlePrevPage]
	)

	/**
	 * 分享链接
	 */
	const handleShare = useCallback(async () => {
		const url = window.location.href

		try {
			if (navigator.share) {
				await navigator.share({
					title: storybook?.title || '有声绘本',
					text: `来看看这本有声绘本：${storybook?.title}`,
					url,
				})
			} else {
				await navigator.clipboard.writeText(url)
				toast({
					title: '链接已复制',
					description: '分享链接已复制到剪贴板',
				})
			}
		} catch (err) {
			console.warn('分享失败:', err)
		}
	}, [storybook, toast])

	/**
	 * 键盘导航
	 */
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'ArrowLeft':
					handlePrevPage()
					break
				case 'ArrowRight':
				case ' ':
					handleNextPage()
					break
				case 'Escape':
					navigate(-1)
					break
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [handleNextPage, handlePrevPage, navigate])

	// 加载状态
	if (isLoading) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-background">
				<div className="text-center space-y-4">
					<Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
					<p className="text-muted-foreground">正在加载绘本...</p>
				</div>
			</div>
		)
	}

	// 错误状态
	if (error || !storybook) {
		return (
			<div className="fixed inset-0 flex items-center justify-center bg-background">
				<div className="text-center space-y-4 p-8">
					<div className="text-6xl">📚</div>
					<h1 className="text-2xl font-bold">{error || '绘本不存在'}</h1>
					<Button onClick={() => navigate('/')}>返回首页</Button>
				</div>
			</div>
		)
	}

	const genreConfig = getGenreConfig(storybook.genre)
	const pageData = getCurrentPageData()
	const totalPages = storybook.pages.length
	const isCover = currentPage === -1
	const isLastPage = currentPage === totalPages - 1

	return (
		<div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
			{/* 顶部工具栏 */}
			<div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => navigate(-1)}
					className="text-white hover:bg-white/20"
				>
					<X className="w-6 h-6" />
				</Button>

				<div className="flex items-center gap-2">
					{/* 音频控制 */}
					{pageData?.audioUrl && (
						<>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleTogglePlay}
								className="text-white hover:bg-white/20"
							>
								{isPlaying ? (
									<Pause className="w-5 h-5" />
								) : (
									<Play className="w-5 h-5" />
								)}
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleToggleMute}
								className="text-white hover:bg-white/20"
							>
								{isMuted ? (
									<VolumeX className="w-5 h-5" />
								) : (
									<Volume2 className="w-5 h-5" />
								)}
							</Button>
						</>
					)}

					{/* 分享按钮 */}
					<Button
						variant="ghost"
						size="icon"
						onClick={handleShare}
						className="text-white hover:bg-white/20"
					>
						<Share2 className="w-5 h-5" />
					</Button>
				</div>
			</div>

			{/* 页面内容 */}
			<AnimatePresence mode="wait">
				<motion.div
					key={currentPage}
					initial={{ opacity: 0, x: 100 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -100 }}
					transition={{ type: 'spring', damping: 25, stiffness: 200 }}
					drag="x"
					dragConstraints={{ left: 0, right: 0 }}
					dragElastic={0.2}
					onDragEnd={handleDragEnd}
					className="absolute inset-0 flex flex-col items-center justify-center p-4 pt-16 pb-24 cursor-grab active:cursor-grabbing"
				>
					{isCover ? (
						// 封面
						<div className="flex flex-col items-center justify-center gap-6 max-w-xl text-center">
							{storybook.coverUrl && (
								<motion.img
									src={storybook.coverUrl}
									alt={storybook.title}
									className="w-full max-w-md rounded-2xl shadow-2xl"
									initial={{ scale: 0.9 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.2 }}
								/>
							)}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
								className="space-y-3"
							>
								<h1 className="text-3xl sm:text-4xl font-bold text-white">
									{storybook.title}
								</h1>
								<div className="flex items-center justify-center gap-2 text-white/70">
									<span className="text-xl">{genreConfig.icon}</span>
									<span>{genreConfig.nameZh}</span>
								</div>
							</motion.div>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.5 }}
								className="text-white/50 text-sm"
							>
								← 滑动或点击翻页 →
							</motion.div>
						</div>
					) : (
						// 故事页面
						<div className="flex flex-col items-center justify-center gap-6 max-w-2xl w-full">
							{pageData?.imageUrl && (
								<motion.img
									src={pageData.imageUrl}
									alt={`第 ${currentPage + 1} 页`}
									className="w-full max-h-[50vh] object-contain rounded-xl shadow-lg"
									initial={{ scale: 0.95 }}
									animate={{ scale: 1 }}
								/>
							)}
							<motion.p
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
								className="text-white text-lg sm:text-xl leading-relaxed text-center px-4"
							>
								{pageData?.text}
							</motion.p>
						</div>
					)}
				</motion.div>
			</AnimatePresence>

			{/* 翻页按钮 */}
			<div className="absolute bottom-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-gradient-to-t from-black/60 to-transparent">
				<Button
					variant="ghost"
					onClick={handlePrevPage}
					disabled={isCover}
					className="text-white hover:bg-white/20 disabled:opacity-30"
				>
					<ArrowLeft className="w-5 h-5 mr-1" />
					上一页
				</Button>

				{/* 页码指示器 */}
				<div className="flex items-center gap-1">
					{Array.from({ length: totalPages + 1 }).map((_, i) => (
						<div
							key={i}
							className={cn(
								'w-2 h-2 rounded-full transition-all',
								currentPage === i - 1
									? 'bg-white w-4'
									: 'bg-white/40 hover:bg-white/60'
							)}
							onClick={() => setCurrentPage(i - 1)}
							role="button"
							tabIndex={0}
							aria-label={i === 0 ? '封面' : `第 ${i} 页`}
							onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(i - 1)}
						/>
					))}
				</div>

				<Button
					variant="ghost"
					onClick={handleNextPage}
					disabled={isLastPage}
					className="text-white hover:bg-white/20 disabled:opacity-30"
				>
					下一页
					<ArrowRight className="w-5 h-5 ml-1" />
				</Button>
			</div>
		</div>
	)
}

export default StorybookReader
