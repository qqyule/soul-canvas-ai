/**
 * 历史记录网格卡片组件
 * @description 单个历史记录的卡片展示，支持悬停详情、选择、操作
 */

import { motion } from 'framer-motion'
import { Clock, Download, Info, Palette, Trash2 } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { HistoryItem } from '@/lib/history-db'

interface HistoryGridCardProps {
	/** 历史记录项 */
	item: HistoryItem
	/** 是否选中 */
	isSelected: boolean
	/** 是否处于多选模式 */
	isSelectionMode: boolean
	/** 切换选中状态 */
	onToggleSelect: () => void
	/** 删除回调 */
	onDelete: () => void
	/** 预览回调 */
	onPreview: () => void
	/** 下载回调 */
	onDownload: () => void
}

/**
 * 格式化时间
 */
const formatDate = (timestamp: number): string => {
	const date = new Date(timestamp)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffMins = Math.floor(diffMs / 60000)
	const diffHours = Math.floor(diffMs / 3600000)
	const diffDays = Math.floor(diffMs / 86400000)

	if (diffMins < 1) return '刚刚'
	if (diffMins < 60) return `${diffMins} 分钟前`
	if (diffHours < 24) return `${diffHours} 小时前`
	if (diffDays < 7) return `${diffDays} 天前`

	return date.toLocaleDateString('zh-CN', {
		month: 'short',
		day: 'numeric',
	})
}

/**
 * 历史记录网格卡片组件
 */
const HistoryGridCard = forwardRef<HTMLDivElement, HistoryGridCardProps>(
	({ item, isSelected, isSelectionMode, onToggleSelect, onDelete, onPreview, onDownload }, ref) => {
		const [isHovered, setIsHovered] = useState(false)

		return (
			<motion.div
				ref={ref}
				layoutId={item.id}
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0, scale: 0.95 }}
				whileHover={{ y: -4 }}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				className={`
				group relative rounded-xl overflow-hidden border transition-all duration-200
				${
					isSelected
						? 'border-primary ring-2 ring-primary/30'
						: 'border-border/50 hover:border-primary/30'
				}
				bg-card/50 backdrop-blur-sm
			`}
			>
				{/* 选择复选框 */}
				{isSelectionMode && (
					<div className="absolute top-2 left-2 z-20">
						<Checkbox
							checked={isSelected}
							onCheckedChange={onToggleSelect}
							aria-label="选择此记录"
							className="bg-background/80 backdrop-blur-sm"
						/>
					</div>
				)}

				{/* 图片区域 */}
				{/* 图片区域 */}
				<div
					role="button"
					className="relative aspect-square w-full overflow-hidden cursor-pointer"
					onClick={onPreview}
					onKeyDown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault()
							onPreview()
						}
					}}
					aria-label="预览图片"
					tabIndex={0}
				>
					<img
						src={item.resultUrl}
						alt="生成结果"
						loading="lazy"
						className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>

					{/* 悬停遮罩 */}
					<div
						className={`
						absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
						transition-opacity duration-200
						${isHovered ? 'opacity-100' : 'opacity-0'}
					`}
					/>

					{/* 操作按钮 */}
					<div
						className={`
						absolute bottom-2 right-2 flex items-center gap-1
						transition-opacity duration-200
						${isHovered ? 'opacity-100' : 'opacity-0'}
					`}
					>
						<Button
							variant="secondary"
							size="icon-sm"
							onClick={(e) => {
								e.stopPropagation()
								onDownload()
							}}
							aria-label="下载图片"
							className="bg-white/90 hover:bg-white text-gray-700"
						>
							<Download className="h-3.5 w-3.5" />
						</Button>
						<Button
							variant="secondary"
							size="icon-sm"
							onClick={(e) => {
								e.stopPropagation()
								onDelete()
							}}
							aria-label="删除记录"
							className="bg-white/90 hover:bg-destructive hover:text-white text-gray-700"
						>
							<Trash2 className="h-3.5 w-3.5" />
						</Button>
					</div>
				</div>

				{/* 信息区域 */}
				<div className="p-3 space-y-1.5">
					{/* 风格标签 */}
					<div className="flex items-center gap-1.5 text-sm">
						<Palette className="h-3.5 w-3.5 text-primary" />
						<span className="font-medium truncate">{item.styleName}</span>
					</div>

					{/* 时间与详情 */}
					<div className="flex items-center justify-between text-xs text-muted-foreground">
						<div className="flex items-center gap-1">
							<Clock className="h-3 w-3" />
							<span>{formatDate(item.createdAt)}</span>
						</div>

						{/* 参数详情提示 */}
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									className="flex items-center gap-1 hover:text-foreground transition-colors"
									aria-label="查看生成参数"
								>
									<Info className="h-3 w-3" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="top" className="max-w-xs">
								<div className="space-y-1 text-xs">
									<p>
										<strong>风格:</strong> {item.styleName}
									</p>
									<p>
										<strong>风格 ID:</strong> {item.styleId}
									</p>
									<p>
										<strong>生成时间:</strong> {new Date(item.createdAt).toLocaleString('zh-CN')}
									</p>
								</div>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
			</motion.div>
		)
	}
)

HistoryGridCard.displayName = 'HistoryGridCard'

export default HistoryGridCard
