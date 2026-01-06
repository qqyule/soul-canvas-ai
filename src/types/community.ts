/**
 * 社区画廊相关类型定义
 * @description 定义社区功能的 API 接口和数据结构
 */

import type { Artwork } from '@/db/schema'

// ==================== API 请求/响应类型 ====================

/**
 * 社区动态排序方式
 */
export type FeedSortBy = 'latest' | 'popular' | 'trending'

/**
 * 获取社区动态请求参数
 */
export interface GetFeedParams {
	/** 页码 (从 1 开始) */
	page?: number
	/** 每页数量 */
	limit?: number
	/** 排序方式 */
	sortBy?: FeedSortBy
	/** 按风格筛选 */
	styleId?: string
}

/**
 * 分页信息
 */
export interface PaginationInfo {
	/** 当前页码 */
	page: number
	/** 每页数量 */
	limit: number
	/** 总数量 */
	total: number
	/** 总页数 */
	totalPages: number
	/** 是否有下一页 */
	hasMore: boolean
}

/**
 * 作品卡片展示数据 (用于列表)
 */
export interface ArtworkCardData {
	id: string
	resultUrl: string
	thumbnailUrl: string | null
	styleName: string | null
	likes: number
	views: number
	createdAt: string
	/** 作者信息 */
	author: {
		id: string
		name: string | null
		avatarUrl: string | null
	}
	/** 当前用户是否已点赞 */
	isLiked?: boolean
}

/**
 * 获取社区动态响应
 */
export interface GetFeedResponse {
	artworks: ArtworkCardData[]
	pagination: PaginationInfo
}

/**
 * 作品详情数据
 */
export interface ArtworkDetailData extends Omit<Artwork, 'createdAt' | 'updatedAt'> {
	createdAt: string
	updatedAt: string
	/** 作者信息 */
	author: {
		id: string
		name: string | null
		avatarUrl: string | null
	}
	/** 当前用户是否已点赞 */
	isLiked?: boolean
}

/**
 * 发布作品请求参数
 */
export interface PublishArtworkParams {
	/** 生成结果图片 URL */
	resultUrl: string
	/** 草图 URL (可选) */
	sketchUrl?: string
	/** 缩略图 URL (可选) */
	thumbnailUrl?: string
	/** 风格 ID */
	styleId: string
	/** 风格名称 */
	styleName?: string
	/** 提示词 */
	prompt?: string
	/** 图片宽度 */
	width?: number
	/** 图片高度 */
	height?: number
	/** 作品标题 */
	title?: string
}

/**
 * 点赞操作响应
 */
export interface LikeResponse {
	/** 当前点赞状态 */
	liked: boolean
	/** 更新后的点赞数 */
	likes: number
}

/**
 * 用户资料数据
 */
export interface UserProfileData {
	id: string
	name: string | null
	avatarUrl: string | null
	/** 作品总数 */
	artworkCount: number
	/** 获赞总数 */
	totalLikes: number
	/** 创建时间 */
	createdAt: string
}

/**
 * 用户资料页响应
 */
export interface UserProfileResponse {
	user: UserProfileData
	artworks: ArtworkCardData[]
	pagination: PaginationInfo
}
