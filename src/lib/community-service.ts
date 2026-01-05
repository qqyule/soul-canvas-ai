/**
 * 社区画廊 API 服务
 * @description 封装社区相关的 API 调用
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { desc, eq, sql, and, asc } from 'drizzle-orm'
import { artworks, users, favorites } from '@/db/schema'
import type {
	GetFeedParams,
	GetFeedResponse,
	ArtworkCardData,
	ArtworkDetailData,
	PublishArtworkParams,
	LikeResponse,
	UserProfileResponse,
	PaginationInfo,
} from '@/types/community'

// ==================== 数据库连接 ====================

/**
 * 获取数据库实例
 */
const getDb = () => {
	const dbUrl = import.meta.env.VITE_DATABASE_URL
	if (!dbUrl) {
		throw new Error('数据库连接未配置')
	}
	const sqlClient = neon(dbUrl)
	return drizzle(sqlClient)
}

// ==================== API 函数 ====================

/**
 * 获取社区动态列表
 */
export const getCommunityFeed = async (
	params: GetFeedParams = {}
): Promise<GetFeedResponse> => {
	const { page = 1, limit = 20, sortBy = 'latest', styleId } = params
	const db = getDb()
	const offset = (page - 1) * limit

	// 构建查询条件
	const conditions = [eq(artworks.isPublic, true), eq(artworks.isDraft, false)]
	if (styleId) {
		conditions.push(eq(artworks.styleId, styleId))
	}

	// 构建排序
	const orderBy =
		sortBy === 'popular'
			? [desc(artworks.likes), desc(artworks.createdAt)]
			: sortBy === 'trending'
			? [desc(artworks.views), desc(artworks.createdAt)]
			: [desc(artworks.createdAt)]

	// 查询作品列表
	const artworkList = await db
		.select({
			id: artworks.id,
			resultUrl: artworks.resultUrl,
			thumbnailUrl: artworks.thumbnailUrl,
			styleName: artworks.styleName,
			likes: artworks.likes,
			views: artworks.views,
			createdAt: artworks.createdAt,
			authorId: artworks.userId,
			authorName: users.name,
			authorAvatar: users.avatarUrl,
		})
		.from(artworks)
		.leftJoin(users, eq(artworks.userId, users.id))
		.where(and(...conditions))
		.orderBy(...orderBy)
		.limit(limit)
		.offset(offset)

	// 查询总数
	const totalResult = await db
		.select({ count: sql<number>`count(*)` })
		.from(artworks)
		.where(and(...conditions))

	const total = Number(totalResult[0]?.count ?? 0)
	const totalPages = Math.ceil(total / limit)

	// 转换为卡片数据格式
	const artworkCards: ArtworkCardData[] = artworkList.map((item) => ({
		id: item.id,
		resultUrl: item.resultUrl,
		thumbnailUrl: item.thumbnailUrl,
		styleName: item.styleName,
		likes: item.likes ?? 0,
		views: item.views ?? 0,
		createdAt: item.createdAt.toISOString(),
		author: {
			id: item.authorId,
			name: item.authorName,
			avatarUrl: item.authorAvatar,
		},
	}))

	return {
		artworks: artworkCards,
		pagination: {
			page,
			limit,
			total,
			totalPages,
			hasMore: page < totalPages,
		},
	}
}

/**
 * 获取作品详情
 */
export const getArtworkDetail = async (
	artworkId: string,
	currentUserId?: string
): Promise<ArtworkDetailData | null> => {
	const db = getDb()

	// 查询作品
	const result = await db
		.select({
			artwork: artworks,
			authorName: users.name,
			authorAvatar: users.avatarUrl,
		})
		.from(artworks)
		.leftJoin(users, eq(artworks.userId, users.id))
		.where(eq(artworks.id, artworkId))
		.limit(1)

	if (result.length === 0) {
		return null
	}

	const { artwork, authorName, authorAvatar } = result[0]

	// 增加浏览量
	await db
		.update(artworks)
		.set({ views: sql`${artworks.views} + 1` })
		.where(eq(artworks.id, artworkId))

	// 检查当前用户是否已点赞
	let isLiked = false
	if (currentUserId) {
		const likeResult = await db
			.select()
			.from(favorites)
			.where(
				and(
					eq(favorites.userId, currentUserId),
					eq(favorites.artworkId, artworkId)
				)
			)
			.limit(1)
		isLiked = likeResult.length > 0
	}

	return {
		...artwork,
		createdAt: artwork.createdAt.toISOString(),
		updatedAt: artwork.updatedAt.toISOString(),
		author: {
			id: artwork.userId,
			name: authorName,
			avatarUrl: authorAvatar,
		},
		isLiked,
	}
}

/**
 * 发布作品到社区
 */
export const publishArtwork = async (
	userId: string,
	params: PublishArtworkParams
): Promise<ArtworkCardData> => {
	const db = getDb()

	// 插入作品
	const [newArtwork] = await db
		.insert(artworks)
		.values({
			userId,
			resultUrl: params.resultUrl,
			sketchUrl: params.sketchUrl,
			thumbnailUrl: params.thumbnailUrl,
			styleId: params.styleId,
			styleName: params.styleName,
			prompt: params.prompt,
			width: params.width,
			height: params.height,
			title: params.title,
			isPublic: true,
			isDraft: false,
		})
		.returning()

	// 获取用户信息
	const [user] = await db
		.select({ name: users.name, avatarUrl: users.avatarUrl })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1)

	return {
		id: newArtwork.id,
		resultUrl: newArtwork.resultUrl,
		thumbnailUrl: newArtwork.thumbnailUrl,
		styleName: newArtwork.styleName,
		likes: 0,
		views: 0,
		createdAt: newArtwork.createdAt.toISOString(),
		author: {
			id: userId,
			name: user?.name ?? null,
			avatarUrl: user?.avatarUrl ?? null,
		},
	}
}

/**
 * 点赞/取消点赞作品
 */
export const toggleArtworkLike = async (
	userId: string,
	artworkId: string
): Promise<LikeResponse> => {
	const db = getDb()

	// 检查是否已点赞
	const existing = await db
		.select()
		.from(favorites)
		.where(
			and(eq(favorites.userId, userId), eq(favorites.artworkId, artworkId))
		)
		.limit(1)

	let liked: boolean

	if (existing.length > 0) {
		// 取消点赞
		await db
			.delete(favorites)
			.where(
				and(eq(favorites.userId, userId), eq(favorites.artworkId, artworkId))
			)
		await db
			.update(artworks)
			.set({ likes: sql`GREATEST(${artworks.likes} - 1, 0)` })
			.where(eq(artworks.id, artworkId))
		liked = false
	} else {
		// 添加点赞
		await db.insert(favorites).values({ userId, artworkId })
		await db
			.update(artworks)
			.set({ likes: sql`${artworks.likes} + 1` })
			.where(eq(artworks.id, artworkId))
		liked = true
	}

	// 获取更新后的点赞数
	const [updated] = await db
		.select({ likes: artworks.likes })
		.from(artworks)
		.where(eq(artworks.id, artworkId))

	return {
		liked,
		likes: updated?.likes ?? 0,
	}
}

/**
 * 获取用户资料及作品集
 */
export const getUserProfile = async (
	userId: string,
	page = 1,
	limit = 20
): Promise<UserProfileResponse | null> => {
	const db = getDb()
	const offset = (page - 1) * limit

	// 获取用户信息
	const [user] = await db
		.select()
		.from(users)
		.where(eq(users.id, userId))
		.limit(1)

	if (!user) {
		return null
	}

	// 获取作品统计
	const statsResult = await db
		.select({
			count: sql<number>`count(*)`,
			totalLikes: sql<number>`COALESCE(sum(${artworks.likes}), 0)`,
		})
		.from(artworks)
		.where(and(eq(artworks.userId, userId), eq(artworks.isPublic, true)))

	const artworkCount = Number(statsResult[0]?.count ?? 0)
	const totalLikes = Number(statsResult[0]?.totalLikes ?? 0)

	// 获取用户作品列表
	const artworkList = await db
		.select({
			id: artworks.id,
			resultUrl: artworks.resultUrl,
			thumbnailUrl: artworks.thumbnailUrl,
			styleName: artworks.styleName,
			likes: artworks.likes,
			views: artworks.views,
			createdAt: artworks.createdAt,
		})
		.from(artworks)
		.where(and(eq(artworks.userId, userId), eq(artworks.isPublic, true)))
		.orderBy(desc(artworks.createdAt))
		.limit(limit)
		.offset(offset)

	const totalPages = Math.ceil(artworkCount / limit)

	// 转换为卡片数据格式
	const artworkCards: ArtworkCardData[] = artworkList.map((item) => ({
		id: item.id,
		resultUrl: item.resultUrl,
		thumbnailUrl: item.thumbnailUrl,
		styleName: item.styleName,
		likes: item.likes ?? 0,
		views: item.views ?? 0,
		createdAt: item.createdAt.toISOString(),
		author: {
			id: userId,
			name: user.name,
			avatarUrl: user.avatarUrl,
		},
	}))

	return {
		user: {
			id: user.id,
			name: user.name,
			avatarUrl: user.avatarUrl,
			artworkCount,
			totalLikes,
			createdAt: user.createdAt.toISOString(),
		},
		artworks: artworkCards,
		pagination: {
			page,
			limit,
			total: artworkCount,
			totalPages,
			hasMore: page < totalPages,
		},
	}
}
