/**
 * 作品卡片组件
 * @description 社区画廊中的单个作品展示卡片
 */

import { useState, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import { Heart, Eye, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ArtworkCardData } from '@/types/community'

interface ArtworkCardProps {
	/** 作品数据 */
	artwork: ArtworkCardData
	/** 点击卡片 */
	onClick?: (artwork: ArtworkCardData) => void
	/** 点赞操作 */
	onLike?: (
		artworkId: string
	) => Promise<{ liked: boolean; likes: number } | null>
	/** 是否正在点赞 */
	isLiking?: boolean
	/** 优先级 (用于懒加载) */
	priority?: boolean
}

/**
 * 格式化数字 (1000 -> 1k)
 */
const formatNumber = (num: number): string => {
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1)}M`
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1)}k`
	}
	return num.toString()
}

/**
 * 作品卡片组件
 */
const ArtworkCard = memo(
	({
		artwork,
		onClick,
		onLike,
		isLiking = false,
		priority = false,
	}: ArtworkCardProps) => {
		const [isHovered, setIsHovered] = useState(false)
		const [imageLoaded, setImageLoaded] = useState(false)
		const [localLiked, setLocalLiked] = useState(artwork.isLiked ?? false)
		const [localLikes, setLocalLikes] = useState(artwork.likes)

		/**
		 * 处理点赞
		 */
		const handleLike = useCallback(
			async (e: React.MouseEvent) => {
				e.stopPropagation()
				if (!onLike || isLiking) return

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
					// 回滚
					setLocalLiked(prevLiked)
					setLocalLikes(prevLikes)
				}
			},
			[artwork.id, onLike, isLiking, localLiked, localLikes]
		)

		/**
		 * 处理卡片点击
		 */
		const handleClick = useCallback(() => {
			onClick?.(artwork)
		}, [onClick, artwork])

		// 使用缩略图或原图
		const imageUrl = artwork.thumbnailUrl || artwork.resultUrl

		return (
			<motion.div
				layout
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				transition={{ duration: 0.2 }}
				className="group relative overflow-hidden rounded-xl bg-card border border-border/50 cursor-pointer"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onClick={handleClick}
				role="button"
				tabIndex={0}
				aria-label={`查看作品 - ${artwork.styleName || '未知风格'}`}
				onKeyDown={(e) => e.key === 'Enter' && handleClick()}
			>
				{/* 图片容器 */}
				<div className="relative aspect-square overflow-hidden bg-muted/30">
					{/* 骨架屏 */}
					{!imageLoaded && (
						<div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted/50 to-muted/30" />
					)}

					{/* 图片 */}
					<img
						src={imageUrl}
						alt={artwork.styleName || '作品'}
						loading={priority ? 'eager' : 'lazy'}
						onLoad={() => setImageLoaded(true)}
						className={cn(
							'w-full h-full object-cover transition-all duration-300',
							imageLoaded ? 'opacity-100' : 'opacity-0',
							isHovered && 'scale-105'
						)}
					/>

					{/* 悬停遮罩 */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: isHovered ? 1 : 0 }}
						transition={{ duration: 0.2 }}
						className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
					/>

					{/* 悬停时显示的信息 */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
						transition={{ duration: 0.2 }}
						className="absolute bottom-0 left-0 right-0 p-3"
					>
						{/* 风格标签 */}
						{artwork.styleName && (
							<span className="inline-block px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium mb-2 backdrop-blur-sm">
								{artwork.styleName}
							</span>
						)}

						{/* 统计信息 */}
						<div className="flex items-center justify-between text-white/90">
							<div className="flex items-center gap-3 text-sm">
								{/* 点赞数 */}
								<button
									onClick={handleLike}
									disabled={isLiking}
									className={cn(
										'flex items-center gap-1 transition-colors hover:text-rose-400',
										localLiked && 'text-rose-400'
									)}
									aria-label={localLiked ? '取消点赞' : '点赞'}
								>
									<Heart
										className={cn(
											'w-4 h-4 transition-all',
											localLiked && 'fill-current',
											isLiking && 'animate-pulse'
										)}
									/>
									<span>{formatNumber(localLikes)}</span>
								</button>

								{/* 浏览量 */}
								<div className="flex items-center gap-1">
									<Eye className="w-4 h-4" />
									<span>{formatNumber(artwork.views)}</span>
								</div>
							</div>

							{/* 作者头像 */}
							<Avatar className="w-6 h-6 border border-white/20">
								<AvatarImage src={artwork.author.avatarUrl || undefined} />
								<AvatarFallback className="text-xs bg-muted">
									<User className="w-3 h-3" />
								</AvatarFallback>
							</Avatar>
						</div>
					</motion.div>
				</div>

				{/* 点赞动画效果 */}
				{localLiked && (
					<motion.div
						initial={{ scale: 0, opacity: 0 }}
						animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
						transition={{ duration: 0.6 }}
						className="absolute inset-0 flex items-center justify-center pointer-events-none"
					>
						<Heart className="w-16 h-16 text-rose-500 fill-rose-500" />
					</motion.div>
				)}
			</motion.div>
		)
	}
)

ArtworkCard.displayName = 'ArtworkCard'

export default ArtworkCard
