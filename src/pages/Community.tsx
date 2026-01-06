/**
 * 社区画廊页面
 * @description 展示用户公开发布的 AI 艺术作品
 */

import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, User as UserIcon } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArtworkDetailDialog, FilterBar, MasonryGrid } from '@/components/community'
import Header from '@/components/layout/Header'
import PageTransition from '@/components/layout/page-transition'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useArtworkDetail, useCommunityFeed, useLikeArtwork } from '@/hooks/use-community'
import { getUserProfile } from '@/lib/community-service'
import type { ArtworkCardData, UserProfileData } from '@/types/community'

/**
 * 社区画廊页面
 */
const CommunityPage = () => {
	const navigate = useNavigate()
	const { artworkId, userId } = useParams<{
		artworkId?: string
		userId?: string
	}>()
	const location = useLocation()

	// 判断当前模式
	const isUserProfileMode = location.pathname.startsWith('/user/')
	const isArtworkDetailMode = !!artworkId

	// 用户资料状态
	const [userProfile, setUserProfile] = useState<UserProfileData | null>(null)
	const [userArtworks, setUserArtworks] = useState<ArtworkCardData[]>([])
	const [isLoadingProfile, setIsLoadingProfile] = useState(false)

	// 社区动态 Hook
	const { artworks, pagination, isLoading, error, sortBy, setSortBy, loadMore, updateArtworkLike } =
		useCommunityFeed()

	// 作品详情 Hook
	const { artwork: artworkDetail, isLoading: isLoadingDetail } = useArtworkDetail(artworkId || '')

	// 点赞 Hook
	const { toggleLike, likingIds } = useLikeArtwork()

	// 详情弹窗状态
	const [detailDialogOpen, setDetailDialogOpen] = useState(false)

	// 当 URL 有 artworkId 时打开弹窗
	useEffect(() => {
		if (artworkId && artworkDetail) {
			setDetailDialogOpen(true)
		}
	}, [artworkId, artworkDetail])

	// 加载用户资料
	useEffect(() => {
		if (isUserProfileMode && userId) {
			setIsLoadingProfile(true)
			getUserProfile(userId)
				.then((data) => {
					if (data) {
						setUserProfile(data.user)
						setUserArtworks(data.artworks)
					}
				})
				.finally(() => setIsLoadingProfile(false))
		}
	}, [isUserProfileMode, userId])

	/**
	 * 处理作品点击 - 打开详情弹窗
	 */
	const handleArtworkClick = useCallback(
		(artwork: ArtworkCardData) => {
			navigate(`/community/${artwork.id}`)
		},
		[navigate]
	)

	/**
	 * 关闭详情弹窗
	 */
	const handleCloseDetail = useCallback(() => {
		setDetailDialogOpen(false)
		// 返回列表页
		if (isUserProfileMode && userId) {
			navigate(`/user/${userId}`)
		} else {
			navigate('/community')
		}
	}, [navigate, isUserProfileMode, userId])

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
		if (isUserProfileMode) {
			navigate('/community')
		} else {
			navigate('/')
		}
	}, [navigate, isUserProfileMode])

	// 决定显示哪些作品
	const displayArtworks = isUserProfileMode ? userArtworks : artworks
	const displayLoading = isUserProfileMode ? isLoadingProfile : isLoading

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
							<span>{isUserProfileMode ? '返回画廊' : '返回创作'}</span>
						</Button>

						{/* 用户资料模式 */}
						{isUserProfileMode && userProfile ? (
							<div className="flex items-center gap-4 mb-4">
								<Avatar className="w-16 h-16 border-2 border-primary/20">
									<AvatarImage src={userProfile.avatarUrl || undefined} />
									<AvatarFallback>
										<UserIcon className="w-8 h-8" />
									</AvatarFallback>
								</Avatar>
								<div>
									<h1 className="text-2xl sm:text-3xl font-bold text-foreground">
										{userProfile.name || '匿名用户'}
									</h1>
									<div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
										<span>{userProfile.artworkCount} 个作品</span>
										<span>{userProfile.totalLikes} 次获赞</span>
									</div>
								</div>
							</div>
						) : (
							<>
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
									<h1 className="text-3xl sm:text-4xl font-bold text-foreground">社区画廊</h1>
								</div>
								<p className="text-muted-foreground">发现来自全球创作者的 AI 艺术作品，获取灵感</p>
							</>
						)}
					</motion.div>

					{/* 筛选栏 (仅社区模式显示) */}
					{!isUserProfileMode && <FilterBar sortBy={sortBy} onSortChange={setSortBy} />}

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
						artworks={displayArtworks}
						isLoading={displayLoading}
						hasMore={!isUserProfileMode && (pagination?.hasMore ?? false)}
						onLoadMore={!isUserProfileMode ? loadMore : undefined}
						onArtworkClick={handleArtworkClick}
						onLike={handleLike}
						likingIds={likingIds}
					/>
				</div>
			</PageTransition>

			{/* 作品详情弹窗 */}
			<ArtworkDetailDialog
				artwork={artworkDetail}
				open={detailDialogOpen && !!artworkDetail}
				onClose={handleCloseDetail}
				onLike={handleLike}
				isLiking={artworkId ? likingIds.has(artworkId) : false}
			/>
		</div>
	)
}

export default CommunityPage
