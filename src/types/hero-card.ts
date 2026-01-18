/**
 * 英雄卡片类型定义
 * @description 用于生成个性化英雄卡片的数据结构
 */

/**
 * 卡片稀有度等级
 */
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary'

/**
 * 稀有度配置
 */
export interface RarityConfig {
	/** 稀有度标识 */
	id: CardRarity
	/** 英文名称 */
	name: string
	/** 中文名称 */
	nameZh: string
	/** 边框渐变色 */
	borderGradient: string
	/** 背景渐变色 */
	bgGradient: string
	/** 发光颜色 */
	glowColor: string
	/** 标题颜色 */
	titleColor: string
}

/**
 * 英雄卡片数据
 */
export interface HeroCardData {
	/** 唯一标识 */
	id: string
	/** 作品标题 */
	title: string
	/** 作品图片 URL */
	imageUrl: string
	/** 使用的风格 ID */
	styleId: string
	/** 风格中文名 */
	styleName: string
	/** 稀有度 */
	rarity: CardRarity
	/** 创作日期 */
	createdAt: Date
	/** 收藏编号 */
	serialNumber: number
	/** 创作者名称（可选） */
	creatorName?: string
}

/**
 * 稀有度配置列表
 */
export const RARITY_CONFIGS: RarityConfig[] = [
	{
		id: 'common',
		name: 'Common',
		nameZh: '普通',
		borderGradient: 'from-gray-400 via-gray-300 to-gray-400',
		bgGradient: 'from-gray-100 to-gray-200',
		glowColor: 'rgba(156, 163, 175, 0.4)',
		titleColor: 'text-gray-600',
	},
	{
		id: 'rare',
		name: 'Rare',
		nameZh: '稀有',
		borderGradient: 'from-blue-500 via-cyan-400 to-blue-500',
		bgGradient: 'from-blue-50 to-cyan-100',
		glowColor: 'rgba(59, 130, 246, 0.5)',
		titleColor: 'text-blue-600',
	},
	{
		id: 'epic',
		name: 'Epic',
		nameZh: '史诗',
		borderGradient: 'from-purple-500 via-pink-400 to-purple-500',
		bgGradient: 'from-purple-50 to-pink-100',
		glowColor: 'rgba(168, 85, 247, 0.5)',
		titleColor: 'text-purple-600',
	},
	{
		id: 'legendary',
		name: 'Legendary',
		nameZh: '传说',
		borderGradient: 'from-amber-400 via-yellow-300 to-orange-500',
		bgGradient: 'from-amber-50 to-orange-100',
		glowColor: 'rgba(251, 191, 36, 0.6)',
		titleColor: 'text-amber-600',
	},
]

/**
 * 根据稀有度 ID 获取配置
 */
export const getRarityConfig = (rarity: CardRarity): RarityConfig => {
	return RARITY_CONFIGS.find((r) => r.id === rarity) || RARITY_CONFIGS[0]
}
