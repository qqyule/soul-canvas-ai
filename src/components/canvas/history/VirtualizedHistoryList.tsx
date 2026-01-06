/**
 * 虚拟化历史记录网格列表组件
 * @description 使用 @tanstack/react-virtual 实现高性能长列表渲染
 */

import { useVirtualizer } from '@tanstack/react-virtual'
import { AnimatePresence } from 'framer-motion'
import { ImageIcon } from 'lucide-react'
import { useMemo, useRef } from 'react'
import type { HistoryItem } from '@/lib/history-db'
import HistoryGridCard from './HistoryGridCard'

interface VirtualizedHistoryListProps {
	/** 历史记录列表 */
	items: HistoryItem[]
	/** 已选中的 ID 集合 */
	selectedIds: Set<string>
	/** 是否处于多选模式 */
	isSelectionMode: boolean
	/** 切换选中状态回调 */
	onToggleSelect: (id: string) => void
	/** 删除回调 */
	onDelete: (id: string) => void
	/** 预览回调 */
	onPreview: (item: HistoryItem) => void
	/** 下载回调 */
	onDownload: (item: HistoryItem) => void
	/** 每行列数 */
	columns?: number
}

/** 卡片高度估算（包含边距） */
const CARD_HEIGHT = 240

/**
 * 虚拟化历史记录网格列表组件
 */
const VirtualizedHistoryList = ({
	items,
	selectedIds,
	isSelectionMode,
	onToggleSelect,
	onDelete,
	onPreview,
	onDownload,
	columns = 2,
}: VirtualizedHistoryListProps) => {
	const parentRef = useRef<HTMLDivElement>(null)

	// 将项目分组成行
	const rows = useMemo(() => {
		const result: HistoryItem[][] = []
		for (let i = 0; i < items.length; i += columns) {
			result.push(items.slice(i, i + columns))
		}
		return result
	}, [items, columns])

	// 虚拟化器配置
	const virtualizer = useVirtualizer({
		count: rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => CARD_HEIGHT,
		overscan: 3, // 预渲染 3 行
		observeElementOffset: (instance, cb) => {
			if (!instance.scrollElement) return
			const observer = new ResizeObserver(() => {
				cb()
			})
			observer.observe(instance.scrollElement)
			return () => observer.disconnect()
		},
	})

	const virtualRows = virtualizer.getVirtualItems()

	// 空状态
	if (items.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-muted-foreground min-h-[300px]">
				<ImageIcon className="h-12 w-12 mb-4 opacity-50" />
				<p>暂无历史记录</p>
				<p className="text-sm">开始创作，记录会自动保存到这里</p>
			</div>
		)
	}

	return (
		<div
			ref={parentRef}
			className="h-full w-full overflow-auto scrollbar-none"
			style={{ contain: 'strict' }}
		>
			<div
				style={{
					height: `${virtualizer.getTotalSize()}px`,
					width: '100%',
					position: 'relative',
				}}
			>
				{virtualRows.map((virtualRow) => {
					const rowItems = rows[virtualRow.index]
					return (
						<div
							key={virtualRow.key}
							data-index={virtualRow.index}
							ref={virtualizer.measureElement}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								transform: `translateY(${virtualRow.start}px)`,
							}}
						>
							<div
								className="grid gap-3 p-1 pb-4"
								style={{
									gridTemplateColumns: `repeat(${columns}, 1fr)`,
								}}
							>
								<AnimatePresence mode="popLayout">
									{rowItems.map((item) => (
										<HistoryGridCard
											key={item.id}
											item={item}
											isSelected={selectedIds.has(item.id)}
											isSelectionMode={isSelectionMode}
											onToggleSelect={() => onToggleSelect(item.id)}
											onDelete={() => onDelete(item.id)}
											onPreview={() => onPreview(item)}
											onDownload={() => onDownload(item)}
										/>
									))}
								</AnimatePresence>
								{/* 填充空白格子保持对齐 */}
								{rowItems.length < columns &&
									Array.from({ length: columns - rowItems.length }).map((_, i) => (
										<div key={`empty-${i}`} />
									))}
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default VirtualizedHistoryList
