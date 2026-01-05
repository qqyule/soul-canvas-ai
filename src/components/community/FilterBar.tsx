/**
 * 社区画廊筛选栏组件
 * @description 提供排序和风格筛选功能
 */

import { memo } from 'react'
import { motion } from 'framer-motion'
import { Flame, Clock, TrendingUp, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { FeedSortBy } from '@/types/community'

interface FilterBarProps {
	/** 当前排序方式 */
	sortBy: FeedSortBy
	/** 排序变更回调 */
	onSortChange: (sortBy: FeedSortBy) => void
	/** 可用的风格列表 */
	availableStyles?: { id: string; name: string }[]
	/** 当前选中的风格 */
	selectedStyleId?: string
	/** 风格变更回调 */
	onStyleChange?: (styleId: string | undefined) => void
}

/**
 * 排序选项配置
 */
const SORT_OPTIONS: { value: FeedSortBy; label: string; icon: typeof Clock }[] =
	[
		{ value: 'latest', label: '最新', icon: Clock },
		{ value: 'popular', label: '最热', icon: Flame },
		{ value: 'trending', label: '趋势', icon: TrendingUp },
	]

/**
 * 社区画廊筛选栏
 */
const FilterBar = memo(
	({
		sortBy,
		onSortChange,
		availableStyles = [],
		selectedStyleId,
		onStyleChange,
	}: FilterBarProps) => {
		return (
			<div className="flex items-center justify-between gap-4 py-4">
				{/* 排序切换 */}
				<div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30 border border-border/50">
					{SORT_OPTIONS.map((option) => {
						const Icon = option.icon
						const isActive = sortBy === option.value

						return (
							<button
								key={option.value}
								onClick={() => onSortChange(option.value)}
								className={cn(
									'relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
									'hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20',
									isActive ? 'text-primary' : 'text-muted-foreground'
								)}
								aria-pressed={isActive}
							>
								{/* 活动指示器 */}
								{isActive && (
									<motion.div
										layoutId="sort-indicator"
										className="absolute inset-0 rounded-md bg-primary/10 border border-primary/20"
										transition={{ type: 'spring', stiffness: 400, damping: 30 }}
									/>
								)}
								<Icon className="w-4 h-4 relative z-10" />
								<span className="relative z-10">{option.label}</span>
							</button>
						)
					})}
				</div>

				{/* 风格筛选 */}
				{availableStyles.length > 0 && onStyleChange && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className={cn(
									'gap-2',
									selectedStyleId && 'border-primary/50 text-primary'
								)}
							>
								<Filter className="w-4 h-4" />
								<span>
									{selectedStyleId
										? availableStyles.find((s) => s.id === selectedStyleId)
												?.name || '筛选风格'
										: '筛选风格'}
								</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							{/* 全部选项 */}
							<DropdownMenuItem
								onClick={() => onStyleChange(undefined)}
								className={cn(
									'cursor-pointer',
									!selectedStyleId && 'bg-primary/10 text-primary'
								)}
							>
								全部风格
							</DropdownMenuItem>

							{/* 风格列表 */}
							{availableStyles.map((style) => (
								<DropdownMenuItem
									key={style.id}
									onClick={() => onStyleChange(style.id)}
									className={cn(
										'cursor-pointer',
										selectedStyleId === style.id && 'bg-primary/10 text-primary'
									)}
								>
									{style.name}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>
		)
	}
)

FilterBar.displayName = 'FilterBar'

export default FilterBar
