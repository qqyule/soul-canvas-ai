/**
 * 瀑布流网格组件
 * @description 实现响应式瀑布流布局，用于展示社区作品
 */

import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import type { ArtworkCardData } from '@/types/community'
import ArtworkCard from './ArtworkCard'

interface MasonryGridProps {
	/** 作品列表 */
	artworks: ArtworkCardData[]
	/** 加载状态 */
	isLoading?: boolean
	/** 是否有更多数据 */
	hasMore?: boolean
	/** 加载更多回调 */
	onLoadMore?: () => void
	/** 点击作品回调 */
	onArtworkClick?: (artwork: ArtworkCardData) => void
	/** 点赞回调 */
	onLike?: (artworkId: string) => Promise<{ liked: boolean; likes: number } | null>
	/** 正在点赞的作品 ID 集合 */
	likingIds?: Set<string>
	/** 列数配置 */
	columns?: {
		sm?: number
		md?: number
		lg?: number
		xl?: number
	}
	/** 间距 */
	gap?: number
}

/**
 * 获取当前屏幕宽度对应的列数
 */
const getColumnCount = (
	width: number,
	config: { sm?: number; md?: number; lg?: number; xl?: number }
): number => {
	const { sm = 2, md = 3, lg = 4, xl = 5 } = config

	if (width >= 1280) return xl
	if (width >= 1024) return lg
	if (width >= 768) return md
	return sm
}

/**
 * 瀑布流网格组件
 */
const MasonryGrid = memo(
	({
		artworks,
		isLoading = false,
		hasMore = false,
		onLoadMore,
		onArtworkClick,
		onLike,
		likingIds = new Set(),
		columns = { sm: 2, md: 3, lg: 4, xl: 5 },
		gap = 16,
	}: MasonryGridProps) => {
		const containerRef = useRef<HTMLDivElement>(null)
		const observerRef = useRef<IntersectionObserver | null>(null)
		const loadMoreRef = useRef<HTMLDivElement>(null)
		const [columnCount, setColumnCount] = useState(3)

		/**
		 * 监听容器宽度变化
		 */
		useEffect(() => {
			const container = containerRef.current
			if (!container) return

			const updateColumns = () => {
				const width = container.offsetWidth
				setColumnCount(getColumnCount(width, columns))
			}

			// 初始化
			updateColumns()

			// 使用 ResizeObserver 监听容器大小变化
			const resizeObserver = new ResizeObserver(updateColumns)
			resizeObserver.observe(container)

			return () => {
				resizeObserver.disconnect()
			}
		}, [columns])

		/**
		 * 无限滚动监听
		 */
		useEffect(() => {
			if (!hasMore || !onLoadMore || isLoading) return

			const target = loadMoreRef.current
			if (!target) return

			observerRef.current = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						onLoadMore()
					}
				},
				{ threshold: 0.1 }
			)

			observerRef.current.observe(target)

			return () => {
				observerRef.current?.disconnect()
			}
		}, [hasMore, onLoadMore, isLoading])

		/**
		 * 将作品分配到各列 (简单的轮询分配)
		 */
		const columnItems = useCallback((): ArtworkCardData[][] => {
			const cols: ArtworkCardData[][] = Array.from({ length: columnCount }, () => [])

			artworks.forEach((artwork, index) => {
				cols[index % columnCount].push(artwork)
			})

			return cols
		}, [artworks, columnCount])

		const columnsData = columnItems()

		return (
			<div ref={containerRef} className="w-full">
				{/* 网格容器 */}
				<div className="flex" style={{ gap: `${gap}px` }}>
					{columnsData.map((column, colIndex) => (
						<div key={colIndex} className="flex-1 flex flex-col" style={{ gap: `${gap}px` }}>
							<AnimatePresence mode="popLayout">
								{column.map((artwork, itemIndex) => (
									<ArtworkCard
										key={artwork.id}
										artwork={artwork}
										onClick={onArtworkClick}
										onLike={onLike}
										isLiking={likingIds.has(artwork.id)}
										priority={colIndex < 2 && itemIndex < 3}
									/>
								))}
							</AnimatePresence>
						</div>
					))}
				</div>

				{/* 加载更多触发器 */}
				{hasMore && (
					<div ref={loadMoreRef} className="flex items-center justify-center py-8">
						{isLoading && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="flex items-center gap-2 text-muted-foreground"
							>
								<Loader2 className="w-5 h-5 animate-spin" />
								<span>加载中...</span>
							</motion.div>
						)}
					</div>
				)}

				{/* 空状态 */}
				{!isLoading && artworks.length === 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex flex-col items-center justify-center py-20 text-center"
					>
						<div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-4">
							<span className="text-4xl">🎨</span>
						</div>
						<h3 className="text-lg font-medium text-foreground mb-2">暂无作品</h3>
						<p className="text-sm text-muted-foreground max-w-sm">
							社区还没有作品，成为第一个分享创作的人吧！
						</p>
					</motion.div>
				)}

				{/* 加载完成提示 */}
				{!hasMore && artworks.length > 0 && (
					<div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
						<span>—— 已经到底啦 ——</span>
					</div>
				)}
			</div>
		)
	}
)

MasonryGrid.displayName = 'MasonryGrid'

export default MasonryGrid
