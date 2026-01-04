/**
 * 过滤工具栏组件
 * @description 提供风格筛选、日期范围、关键词搜索和排序功能
 */

import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import type { HistoryFilter } from '@/types/history'

interface FilterBarProps {
	/** 当前过滤配置 */
	filter: HistoryFilter
	/** 过滤配置变更回调 */
	onFilterChange: (filter: HistoryFilter) => void
	/** 可用的风格列表 */
	availableStyles: Array<{ id: string; name: string }>
	/** 总记录数 */
	totalCount: number
	/** 过滤后记录数 */
	filteredCount: number
}

/**
 * 过滤工具栏组件
 */
const FilterBar = ({
	filter,
	onFilterChange,
	availableStyles,
	totalCount,
	filteredCount,
}: FilterBarProps) => {
	/**
	 * 更新过滤字段
	 */
	const updateFilter = (updates: Partial<HistoryFilter>) => {
		onFilterChange({ ...filter, ...updates })
	}

	/**
	 * 清除所有过滤
	 */
	const clearFilters = () => {
		onFilterChange({
			sortBy: 'latest',
		})
	}

	const hasActiveFilters =
		filter.styleId || filter.searchQuery || filter.startDate || filter.endDate

	return (
		<div className="flex flex-col gap-3 pb-3 border-b border-border/50">
			{/* 搜索栏 */}
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="搜索风格名称..."
					value={filter.searchQuery ?? ''}
					onChange={(e) =>
						updateFilter({ searchQuery: e.target.value || undefined })
					}
					className="pl-9 bg-muted/30"
				/>
			</div>

			{/* 过滤选项行 */}
			<div className="flex items-center gap-2 flex-wrap">
				{/* 风格筛选 */}
				<Select
					value={filter.styleId ?? 'all'}
					onValueChange={(value) =>
						updateFilter({ styleId: value === 'all' ? undefined : value })
					}
				>
					<SelectTrigger className="w-32 bg-muted/30">
						<SelectValue placeholder="全部风格" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">全部风格</SelectItem>
						{availableStyles.map((style) => (
							<SelectItem key={style.id} value={style.id}>
								{style.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				{/* 排序 */}
				<Select
					value={filter.sortBy}
					onValueChange={(value: 'latest' | 'oldest') =>
						updateFilter({ sortBy: value })
					}
				>
					<SelectTrigger className="w-28 bg-muted/30">
						<ArrowUpDown className="h-3.5 w-3.5 mr-1" />
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="latest">最新</SelectItem>
						<SelectItem value="oldest">最旧</SelectItem>
					</SelectContent>
				</Select>

				{/* 高级过滤弹出 */}
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline" size="sm" className="bg-muted/30">
							<SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
							高级
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-64" align="start">
						<div className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium">日期范围</label>
								<div className="flex items-center gap-2">
									<Input
										type="date"
										value={
											filter.startDate
												? new Date(filter.startDate).toISOString().split('T')[0]
												: ''
										}
										onChange={(e) =>
											updateFilter({
												startDate: e.target.value
													? new Date(e.target.value).getTime()
													: undefined,
											})
										}
										className="text-xs"
									/>
									<span className="text-muted-foreground">-</span>
									<Input
										type="date"
										value={
											filter.endDate
												? new Date(filter.endDate).toISOString().split('T')[0]
												: ''
										}
										onChange={(e) =>
											updateFilter({
												endDate: e.target.value
													? new Date(e.target.value).getTime()
													: undefined,
											})
										}
										className="text-xs"
									/>
								</div>
							</div>
						</div>
					</PopoverContent>
				</Popover>

				{/* 清除过滤 */}
				{hasActiveFilters && (
					<Button
						variant="ghost"
						size="sm"
						onClick={clearFilters}
						className="text-muted-foreground hover:text-foreground"
					>
						清除筛选
					</Button>
				)}

				{/* 记录数统计 */}
				<div className="ml-auto text-xs text-muted-foreground">
					{filteredCount === totalCount ? (
						<span>共 {totalCount} 条</span>
					) : (
						<span>
							显示 {filteredCount} / {totalCount} 条
						</span>
					)}
				</div>
			</div>
		</div>
	)
}

export default FilterBar
