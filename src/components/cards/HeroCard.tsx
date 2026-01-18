/**
 * 英雄卡片组件
 * @description 展示用户作品的收藏卡片，支持多种稀有度样式
 */

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type HeroCardData, getRarityConfig } from '@/types/hero-card'

interface HeroCardProps {
	/** 卡片数据 */
	data: HeroCardData
	/** 自定义类名 */
	className?: string
	/** 是否显示动画效果 */
	animated?: boolean
	/** 点击事件 */
	onClick?: () => void
}

/**
 * 英雄卡片组件
 * 可用于展示和导出用户的 AI 艺术作品
 */
const HeroCard = ({
	data,
	className,
	animated = true,
	onClick,
}: HeroCardProps) => {
	const rarityConfig = getRarityConfig(data.rarity)

	// 格式化日期
	const formattedDate = format(new Date(data.createdAt), 'yyyy-MM-dd', {
		locale: zhCN,
	})

	// 格式化编号（补零到 6 位）
	const formattedSerial = `#${String(data.serialNumber).padStart(6, '0')}`

	const CardWrapper = animated ? motion.div : 'div'
	const animationProps = animated
		? {
				initial: { scale: 0.95, opacity: 0 },
				animate: { scale: 1, opacity: 1 },
				whileHover: { scale: 1.02, y: -4 },
				transition: { duration: 0.3 },
		  }
		: {}

	return (
		<CardWrapper
			className={cn(
				'relative w-72 rounded-2xl overflow-hidden cursor-pointer select-none',
				'transition-shadow duration-300',
				className
			)}
			style={{
				boxShadow: `0 8px 32px ${rarityConfig.glowColor}`,
			}}
			onClick={onClick}
			{...animationProps}
		>
			{/* 渐变边框容器 - 使用 padding 模拟边框效果 */}
			<div
				className={cn(
					'rounded-2xl p-[3px]',
					'bg-gradient-to-br',
					rarityConfig.borderGradient
				)}
			>
				{/* 内部背景 */}
				<div
					className={cn(
						'rounded-[13px] overflow-hidden',
						'bg-gradient-to-b',
						rarityConfig.bgGradient
					)}
				>
					{/* 稀有度标识 */}
					<div className="relative px-4 py-2 text-center">
						<div
							className={cn(
								'inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider',
								rarityConfig.titleColor
							)}
						>
							{data.rarity === 'legendary' && (
								<Sparkles className="w-3 h-3 animate-pulse" />
							)}
							<span>★ {rarityConfig.nameZh} ★</span>
							{data.rarity === 'legendary' && (
								<Sparkles className="w-3 h-3 animate-pulse" />
							)}
						</div>
					</div>

					{/* 作品图片 */}
					<div className="px-3 pb-2">
						<div className="relative aspect-square rounded-xl overflow-hidden border-2 border-white/50 shadow-inner">
							<img
								src={data.imageUrl}
								alt={data.title}
								className="w-full h-full object-cover"
								crossOrigin="anonymous"
								loading="lazy"
							/>
							{/* 图片光效 */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
						</div>
					</div>

					{/* 作品标题 */}
					<div className="px-4 py-2 text-center">
						<h3 className="text-lg font-bold text-gray-800 truncate">
							「{data.title}」
						</h3>
					</div>

					{/* 分隔线 */}
					<div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

					{/* 属性信息 */}
					<div className="px-4 py-3 space-y-1.5 text-sm">
						<div className="flex justify-between">
							<span className="text-gray-500">风格</span>
							<span className="font-medium text-gray-700">
								{data.styleName}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-500">创作</span>
							<span className="font-medium text-gray-700">{formattedDate}</span>
						</div>
						{data.creatorName && (
							<div className="flex justify-between">
								<span className="text-gray-500">创作者</span>
								<span className="font-medium text-gray-700 truncate max-w-[120px]">
									{data.creatorName}
								</span>
							</div>
						)}
					</div>

					{/* 收藏编号 */}
					<div className="px-4 py-3 text-center border-t border-gray-200/50">
						<span className="font-mono text-sm font-bold text-gray-600">
							{formattedSerial}
						</span>
					</div>
				</div>
			</div>
		</CardWrapper>
	)
}

export default HeroCard
