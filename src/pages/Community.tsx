/**
 * 社区画廊页面
 * @description 展示用户公开发布的 AI 艺术作品
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowLeft } from 'lucide-react'
import Header from '@/components/layout/Header'
import PageTransition from '@/components/layout/page-transition'
import { MasonryGrid, FilterBar } from '@/components/community'
import { Button } from '@/components/ui/button'
import { useCommunityFeed, useLikeArtwork } from '@/hooks/use-community'
import type { ArtworkCardData } from '@/types/community'

/**
 * 社区画廊页面
 */
const CommunityPage = () => {
	const navigate = useNavigate()

	// 社区动态 Hook
	const {
		artworks,
		pagination,
		isLoading,
		error,
		sortBy,
		setSortBy,
		loadMore,
		updateArtworkLike,
	} = useCommunityFeed()

	// 点赞 Hook
	const { toggleLike, likingIds } = useLikeArtwork()

	/**
	 * 处理作品点击 - 跳转详情页
	 */
	const handleArtworkClick = useCallback(
		(artwork: ArtworkCardData) => {
			navigate(`/community/${artwork.id}`)
		},
		[navigate]
	)

	/**
	 * 处理点赞
	 */
	const handleLike = useCallback(
		async (artworkId: string) => {
			const result = await toggleLike(artworkId)
			if (result) {
				updateArtworkLike(artworkId, result.liked, result.likes)
			}
			return result
		},
		[toggleLike, updateArtworkLike]
	)

	/**
	 * 返回首页
	 */
	const handleBack = useCallback(() => {
		navigate('/')
	}, [navigate])

	return (
		<div className="min-h-screen animated-gradient">
			<Header />

			{/* 背景网格 */}
			<div className="fixed inset-0 bg-grid-pattern bg-grid opacity-5 pointer-events-none" />

			<PageTransition className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					{/* 页面头部 */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="mb-8"
					>
						{/* 返回按钮 */}
						<Button
							variant="ghost"
							size="sm"
							onClick={handleBack}
							className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
						>
							<ArrowLeft className="w-4 h-4" />
							<span>返回创作</span>
						</Button>

						{/* 标题区域 */}
						<div className="flex items-center gap-3 mb-2">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: 'spring' }}
								className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center"
							>
								<Sparkles className="w-5 h-5 text-white" />
							</motion.div>
							<h1 className="text-3xl sm:text-4xl font-bold text-foreground">
								社区画廊
							</h1>
						</div>
						<p className="text-muted-foreground">
							发现来自全球创作者的 AI 艺术作品，获取灵感
						</p>
					</motion.div>

					{/* 筛选栏 */}
					<FilterBar sortBy={sortBy} onSortChange={setSortBy} />

					{/* 错误提示 */}
					{error && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6"
						>
							{error.message}
						</motion.div>
					)}

					{/* 作品网格 */}
					<MasonryGrid
						artworks={artworks}
						isLoading={isLoading}
						hasMore={pagination?.hasMore ?? false}
						onLoadMore={loadMore}
						onArtworkClick={handleArtworkClick}
						onLike={handleLike}
						likingIds={likingIds}
					/>
				</div>
			</PageTransition>
		</div>
	)
}

export default CommunityPage
