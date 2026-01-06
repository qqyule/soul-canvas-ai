/**
 * 社区画廊 Hook
 * @description 封装社区数据的获取和操作逻辑
 */

import { useUser } from '@clerk/clerk-react'
import { useCallback, useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
	getArtworkDetail,
	getCommunityFeed,
	publishArtwork,
	toggleArtworkLike,
} from '@/lib/community-service'
import type {
	ArtworkCardData,
	ArtworkDetailData,
	FeedSortBy,
	PaginationInfo,
	PublishArtworkParams,
} from '@/types/community'

// ==================== useCommunityFeed ====================

interface UseCommunityFeedOptions {
	/** 初始排序方式 */
	initialSortBy?: FeedSortBy
	/** 每页数量 */
	pageSize?: number
	/** 风格筛选 */
	styleId?: string
}

interface UseCommunityFeedReturn {
	/** 作品列表 */
	artworks: ArtworkCardData[]
	/** 分页信息 */
	pagination: PaginationInfo | null
	/** 加载状态 */
	isLoading: boolean
	/** 错误信息 */
	error: Error | null
	/** 当前排序方式 */
	sortBy: FeedSortBy
	/** 设置排序方式 */
	setSortBy: (sortBy: FeedSortBy) => void
	/** 加载更多 */
	loadMore: () => Promise<void>
	/** 刷新列表 */
	refresh: () => Promise<void>
	/** 更新某个作品的点赞状态 */
	updateArtworkLike: (artworkId: string, liked: boolean, likes: number) => void
}

/**
 * 社区动态列表 Hook
 */
export const useCommunityFeed = (options: UseCommunityFeedOptions = {}): UseCommunityFeedReturn => {
	const { initialSortBy = 'latest', pageSize = 20, styleId } = options

	const [artworks, setArtworks] = useState<ArtworkCardData[]>([])
	const [pagination, setPagination] = useState<PaginationInfo | null>(null)
	const [sortBy, setSortByState] = useState<FeedSortBy>(initialSortBy)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	/**
	 * 获取动态列表
	 */
	const fetchFeed = useCallback(
		async (page: number, append = false) => {
			setIsLoading(true)
			setError(null)

			try {
				const response = await getCommunityFeed({
					page,
					limit: pageSize,
					sortBy,
					styleId,
				})

				if (append) {
					setArtworks((prev) => [...prev, ...response.artworks])
				} else {
					setArtworks(response.artworks)
				}
				setPagination(response.pagination)
			} catch (err) {
				setError(err instanceof Error ? err : new Error('加载失败'))
			} finally {
				setIsLoading(false)
			}
		},
		[pageSize, sortBy, styleId]
	)

	/**
	 * 切换排序方式
	 */
	const setSortBy = useCallback((newSortBy: FeedSortBy) => {
		setSortByState(newSortBy)
		// 排序变更时会通过 useEffect 自动刷新
	}, [])

	/**
	 * 加载更多
	 */
	const loadMore = useCallback(async () => {
		if (!pagination?.hasMore || isLoading) return
		await fetchFeed(pagination.page + 1, true)
	}, [pagination, isLoading, fetchFeed])

	/**
	 * 刷新列表
	 */
	const refresh = useCallback(async () => {
		await fetchFeed(1, false)
	}, [fetchFeed])

	/**
	 * 更新某个作品的点赞状态
	 */
	const updateArtworkLike = useCallback((artworkId: string, liked: boolean, likes: number) => {
		setArtworks((prev) =>
			prev.map((art) => (art.id === artworkId ? { ...art, isLiked: liked, likes } : art))
		)
	}, [])

	// 初始加载和排序变更时刷新
	useEffect(() => {
		fetchFeed(1, false)
	}, [fetchFeed])

	return {
		artworks,
		pagination,
		isLoading,
		error,
		sortBy,
		setSortBy,
		loadMore,
		refresh,
		updateArtworkLike,
	}
}

// ==================== useArtworkDetail ====================

interface UseArtworkDetailReturn {
	/** 作品详情 */
	artwork: ArtworkDetailData | null
	/** 加载状态 */
	isLoading: boolean
	/** 错误信息 */
	error: Error | null
	/** 刷新详情 */
	refresh: () => Promise<void>
}

/**
 * 作品详情 Hook
 */
export const useArtworkDetail = (artworkId: string): UseArtworkDetailReturn => {
	const { user } = useUser()
	const [artwork, setArtwork] = useState<ArtworkDetailData | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const fetchDetail = useCallback(async () => {
		if (!artworkId) return

		setIsLoading(true)
		setError(null)

		try {
			const detail = await getArtworkDetail(artworkId, user?.id)
			setArtwork(detail)
		} catch (err) {
			setError(err instanceof Error ? err : new Error('加载失败'))
		} finally {
			setIsLoading(false)
		}
	}, [artworkId, user?.id])

	const refresh = useCallback(async () => {
		await fetchDetail()
	}, [fetchDetail])

	useEffect(() => {
		fetchDetail()
	}, [fetchDetail])

	return {
		artwork,
		isLoading,
		error,
		refresh,
	}
}

// ==================== usePublishArtwork ====================

interface UsePublishArtworkReturn {
	/** 发布作品 */
	publish: (params: PublishArtworkParams) => Promise<ArtworkCardData | null>
	/** 发布中 */
	isPublishing: boolean
}

/**
 * 发布作品 Hook
 */
export const usePublishArtwork = (): UsePublishArtworkReturn => {
	const { user } = useUser()
	const { toast } = useToast()
	const [isPublishing, setIsPublishing] = useState(false)

	const publish = useCallback(
		async (params: PublishArtworkParams): Promise<ArtworkCardData | null> => {
			if (!user?.id) {
				toast({
					title: '请先登录',
					description: '登录后即可发布作品到社区',
					variant: 'destructive',
				})
				return null
			}

			setIsPublishing(true)

			try {
				const result = await publishArtwork(user.id, params)
				toast({
					title: '发布成功！🎉',
					description: '您的作品已发布到社区',
				})
				return result
			} catch (err) {
				toast({
					title: '发布失败',
					description: err instanceof Error ? err.message : '请稍后重试',
					variant: 'destructive',
				})
				return null
			} finally {
				setIsPublishing(false)
			}
		},
		[user?.id, toast]
	)

	return {
		publish,
		isPublishing,
	}
}

// ==================== useLikeArtwork ====================

interface UseLikeArtworkReturn {
	/** 切换点赞状态 */
	toggleLike: (artworkId: string) => Promise<{ liked: boolean; likes: number } | null>
	/** 点赞操作中的作品 ID */
	likingIds: Set<string>
}

/**
 * 点赞作品 Hook
 */
export const useLikeArtwork = (): UseLikeArtworkReturn => {
	const { user, isSignedIn } = useUser()
	const { toast } = useToast()
	const [likingIds, setLikingIds] = useState<Set<string>>(new Set())

	const toggleLike = useCallback(
		async (artworkId: string): Promise<{ liked: boolean; likes: number } | null> => {
			if (!isSignedIn || !user?.id) {
				toast({
					title: '请先登录',
					description: '登录后即可点赞作品',
					variant: 'destructive',
				})
				return null
			}

			// 防止重复点击
			if (likingIds.has(artworkId)) return null

			setLikingIds((prev) => new Set(prev).add(artworkId))

			try {
				const result = await toggleArtworkLike(user.id, artworkId)
				return result
			} catch (err) {
				toast({
					title: '操作失败',
					description: '请稍后重试',
					variant: 'destructive',
				})
				return null
			} finally {
				setLikingIds((prev) => {
					const next = new Set(prev)
					next.delete(artworkId)
					return next
				})
			}
		},
		[isSignedIn, user?.id, likingIds, toast]
	)

	return {
		toggleLike,
		likingIds,
	}
}
