/**
 * 作品详情弹窗组件
 * @description 展示作品的详细信息，支持点赞、分享等操作
 */

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	X,
	Heart,
	Eye,
	Download,
	Share2,
	Copy,
	Check,
	User,
	Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import type { ArtworkDetailData } from '@/types/community'

interface ArtworkDetailDialogProps {
	/** 作品数据 */
	artwork: ArtworkDetailData | null
	/** 是否打开 */
	open: boolean
	/** 关闭回调 */
	onClose: () => void
	/** 点赞回调 */
	onLike?: (
		artworkId: string
	) => Promise<{ liked: boolean; likes: number } | null>
	/** 是否正在点赞 */
	isLiking?: boolean
}

/**
 * 格式化日期
 */
const formatDate = (dateStr: string): string => {
	const date = new Date(dateStr)
	return date.toLocaleDateString('zh-CN', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})
}

/**
 * 作品详情弹窗
 */
const ArtworkDetailDialog = ({
	artwork,
	open,
	onClose,
	onLike,
	isLiking = false,
}: ArtworkDetailDialogProps) => {
	const navigate = useNavigate()
	const { toast } = useToast()
	const [localLiked, setLocalLiked] = useState(artwork?.isLiked ?? false)
	const [localLikes, setLocalLikes] = useState(artwork?.likes ?? 0)
	const [copied, setCopied] = useState(false)

	// 同步外部数据
	useEffect(() => {
		if (artwork) {
			setLocalLiked(artwork.isLiked ?? false)
			setLocalLikes(artwork.likes ?? 0)
		}
	}, [artwork])

	/**
	 * 处理点赞
	 */
	const handleLike = useCallback(async () => {
		if (!artwork || !onLike || isLiking) return

		// 乐观更新
		const prevLiked = localLiked
		const prevLikes = localLikes
		setLocalLiked(!localLiked)
		setLocalLikes(localLiked ? localLikes - 1 : localLikes + 1)

		const result = await onLike(artwork.id)
		if (result) {
			setLocalLiked(result.liked)
			setLocalLikes(result.likes)
		} else {
			setLocalLiked(prevLiked)
			setLocalLikes(prevLikes)
		}
	}, [artwork, onLike, isLiking, localLiked, localLikes])

	/**
	 * 下载图片
	 */
	const handleDownload = useCallback(async () => {
		if (!artwork) return

		try {
			const response = await fetch(artwork.resultUrl)
			const blob = await response.blob()
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `artwork-${artwork.id}.png`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			URL.revokeObjectURL(url)

			toast({
				title: '下载成功',
				description: '图片已保存到本地',
			})
		} catch (error) {
			toast({
				title: '下载失败',
				description: '请稍后重试',
				variant: 'destructive',
			})
		}
	}, [artwork, toast])

	/**
	 * 复制提示词
	 */
	const handleCopyPrompt = useCallback(async () => {
		if (!artwork?.prompt) return

		try {
			await navigator.clipboard.writeText(artwork.prompt)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
			toast({
				title: '已复制',
				description: '提示词已复制到剪贴板',
			})
		} catch (error) {
			toast({
				title: '复制失败',
				description: '请手动复制',
				variant: 'destructive',
			})
		}
	}, [artwork?.prompt, toast])

	/**
	 * 分享
	 */
	const handleShare = useCallback(async () => {
		if (!artwork) return

		const shareUrl = `${window.location.origin}/#/community/${artwork.id}`

		if (navigator.share) {
			try {
				await navigator.share({
					title: '查看这个 AI 艺术作品',
					text: artwork.prompt || '来自神笔马良的创作',
					url: shareUrl,
				})
			} catch (error) {
				// 用户取消分享
			}
		} else {
			// 降级：复制链接
			try {
				await navigator.clipboard.writeText(shareUrl)
				toast({
					title: '链接已复制',
					description: '分享链接已复制到剪贴板',
				})
			} catch (error) {
				toast({
					title: '分享失败',
					description: '请手动复制页面链接',
					variant: 'destructive',
				})
			}
		}
	}, [artwork, toast])

	/**
	 * 跳转作者主页
	 */
	const handleAuthorClick = useCallback(() => {
		if (!artwork) return
		onClose()
		navigate(`/user/${artwork.author.id}`)
	}, [artwork, navigate, onClose])

	/**
	 * 同款生成 (Remix)
	 */
	const handleRemix = useCallback(() => {
		if (!artwork) return
		// TODO: 跳转到首页并填充提示词和风格
		toast({
			title: '功能开发中',
			description: '同款生成功能即将上线',
		})
	}, [artwork, toast])

	if (!artwork) return null

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
				<div className="flex flex-col lg:flex-row h-full">
					{/* 左侧：图片 */}
					<div className="flex-1 bg-black/5 dark:bg-white/5 flex items-center justify-center p-4 min-h-[300px] lg:min-h-[500px]">
						<motion.img
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							src={artwork.resultUrl}
							alt="作品"
							className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
						/>
					</div>

					{/* 右侧：信息面板 */}
					<div className="w-full lg:w-80 flex flex-col border-t lg:border-t-0 lg:border-l border-border">
						{/* 头部：作者信息 */}
						<div className="p-4 border-b border-border">
							<button
								onClick={handleAuthorClick}
								className="flex items-center gap-3 hover:opacity-80 transition-opacity"
							>
								<Avatar className="w-10 h-10 border border-border">
									<AvatarImage src={artwork.author.avatarUrl || undefined} />
									<AvatarFallback>
										<User className="w-5 h-5" />
									</AvatarFallback>
								</Avatar>
								<div className="text-left">
									<p className="font-medium text-foreground">
										{artwork.author.name || '匿名用户'}
									</p>
									<p className="text-xs text-muted-foreground">
										{formatDate(artwork.createdAt)}
									</p>
								</div>
							</button>
						</div>

						{/* 统计信息 */}
						<div className="flex items-center gap-4 p-4 border-b border-border">
							<button
								onClick={handleLike}
								disabled={isLiking}
								className={cn(
									'flex items-center gap-1.5 text-sm transition-colors',
									localLiked
										? 'text-rose-500'
										: 'text-muted-foreground hover:text-rose-500'
								)}
							>
								<Heart
									className={cn(
										'w-5 h-5',
										localLiked && 'fill-current',
										isLiking && 'animate-pulse'
									)}
								/>
								<span>{localLikes}</span>
							</button>
							<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
								<Eye className="w-5 h-5" />
								<span>{artwork.views}</span>
							</div>
						</div>

						{/* 风格标签 */}
						{artwork.styleName && (
							<div className="px-4 pt-4">
								<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
									<Sparkles className="w-3.5 h-3.5" />
									{artwork.styleName}
								</span>
							</div>
						)}

						{/* 提示词 */}
						{artwork.prompt && (
							<div className="p-4 flex-1 overflow-auto">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-muted-foreground">
										提示词
									</span>
									<button
										onClick={handleCopyPrompt}
										className="text-muted-foreground hover:text-foreground transition-colors"
										aria-label="复制提示词"
									>
										{copied ? (
											<Check className="w-4 h-4 text-green-500" />
										) : (
											<Copy className="w-4 h-4" />
										)}
									</button>
								</div>
								<p className="text-sm text-foreground leading-relaxed">
									{artwork.prompt}
								</p>
							</div>
						)}

						{/* 操作按钮 */}
						<div className="p-4 border-t border-border space-y-2">
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									className="flex-1 gap-2"
									onClick={handleDownload}
								>
									<Download className="w-4 h-4" />
									下载
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="flex-1 gap-2"
									onClick={handleShare}
								>
									<Share2 className="w-4 h-4" />
									分享
								</Button>
							</div>
							<Button className="w-full gap-2" onClick={handleRemix}>
								<Sparkles className="w-4 h-4" />
								同款生成
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default ArtworkDetailDialog
