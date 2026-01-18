/**
 * 绘本类型定义
 * @description 绘本生成功能的数据结构
 */

/**
 * 绘本故事类型
 */
export type StoryGenre =
	| 'adventure'
	| 'fairy-tale'
	| 'sci-fi'
	| 'educational'
	| 'bedtime'

/**
 * 故事类型配置
 */
export interface GenreConfig {
	id: StoryGenre
	name: string
	nameZh: string
	description: string
	icon: string
	promptHint: string
}

/**
 * 绘本页面
 */
export interface StoryPage {
	/** 页面 ID */
	id: string
	/** 页码（从 1 开始） */
	pageNumber: number
	/** 插图图片 URL */
	imageUrl: string
	/** 故事文本 */
	text: string
	/** 旁白音频 URL（可选） */
	audioUrl?: string
}

/**
 * 绘本数据
 */
export interface StorybookData {
	/** 唯一标识 */
	id: string
	/** 绘本标题 */
	title: string
	/** 故事类型 */
	genre: StoryGenre
	/** 封面图片 URL */
	coverUrl: string
	/** 所有页面 */
	pages: StoryPage[]
	/** 语言代码 */
	language: string
	/** 创建时间 */
	createdAt: Date
	/** 更新时间 */
	updatedAt: Date
	/** 创作者 ID */
	creatorId?: string
}

/**
 * 绘本生成状态
 */
export type StorybookStatus =
	| 'idle'
	| 'generating-story'
	| 'generating-images'
	| 'generating-audio'
	| 'complete'
	| 'error'

/**
 * 故事类型配置列表
 */
export const GENRE_CONFIGS: GenreConfig[] = [
	{
		id: 'adventure',
		name: 'Adventure',
		nameZh: '冒险故事',
		description: '勇敢探索未知世界的奇妙旅程',
		icon: '🗺️',
		promptHint: 'epic adventure, brave hero, magical journey, treasure hunting',
	},
	{
		id: 'fairy-tale',
		name: 'Fairy Tale',
		nameZh: '童话故事',
		description: '充满魔法与奇迹的经典童话',
		icon: '🧚',
		promptHint: 'fairy tale, magical kingdom, enchanted forest, happy ending',
	},
	{
		id: 'sci-fi',
		name: 'Sci-Fi',
		nameZh: '科幻故事',
		description: '探索宇宙与未来科技的奇想',
		icon: '🚀',
		promptHint: 'futuristic, space exploration, robots, advanced technology',
	},
	{
		id: 'educational',
		name: 'Educational',
		nameZh: '益智故事',
		description: '寓教于乐的知识启蒙故事',
		icon: '📚',
		promptHint: 'educational, learning, curious child, knowledge discovery',
	},
	{
		id: 'bedtime',
		name: 'Bedtime',
		nameZh: '睡前故事',
		description: '温馨治愈的晚安故事',
		icon: '🌙',
		promptHint: 'peaceful, cozy, dreamy, gentle, soothing atmosphere',
	},
]

/**
 * 支持的语言列表
 */
export const SUPPORTED_LANGUAGES = [
	{ code: 'zh-CN', name: '简体中文' },
	{ code: 'zh-TW', name: '繁體中文' },
	{ code: 'en-US', name: 'English' },
	{ code: 'ja-JP', name: '日本語' },
	{ code: 'ko-KR', name: '한국어' },
] as const

/**
 * 根据类型 ID 获取配置
 */
export const getGenreConfig = (genre: StoryGenre): GenreConfig => {
	return GENRE_CONFIGS.find((g) => g.id === genre) || GENRE_CONFIGS[0]
}
