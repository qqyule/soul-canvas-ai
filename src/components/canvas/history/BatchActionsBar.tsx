/**
 * 批量操作工具栏组件
 * @description 提供全选、批量删除、批量下载功能
 */

import { AnimatePresence, motion } from 'framer-motion'
import { CheckSquare, Download, Square, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BatchActionsBarProps {
	/** 已选中数量 */
	selectedCount: number
	/** 总数量 */
	totalCount: number
	/** 是否全选 */
	isAllSelected: boolean
	/** 全选/取消全选回调 */
	onToggleSelectAll: () => void
	/** 批量删除回调 */
	onBatchDelete: () => void
	/** 批量下载回调 */
	onBatchDownload: () => void
	/** 清除选择回调 */
	onClearSelection: () => void
}

/**
 * 批量操作工具栏组件
 */
const BatchActionsBar = ({
	selectedCount,
	totalCount,
	isAllSelected,
	onToggleSelectAll,
	onBatchDelete,
	onBatchDownload,
	onClearSelection,
}: BatchActionsBarProps) => {
	const hasSelection = selectedCount > 0

	return (
		<AnimatePresence>
			{hasSelection && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20"
				>
					{/* 左侧：选择信息 */}
					<div className="flex items-center gap-3">
						<Button
							variant="ghost"
							size="sm"
							onClick={onToggleSelectAll}
							className="text-primary hover:text-primary"
						>
							{isAllSelected ? (
								<CheckSquare className="h-4 w-4 mr-1.5" />
							) : (
								<Square className="h-4 w-4 mr-1.5" />
							)}
							{isAllSelected ? '取消全选' : '全选'}
						</Button>
						<span className="text-sm font-medium text-primary">已选择 {selectedCount} 项</span>
					</div>

					{/* 右侧：操作按钮 */}
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={onBatchDownload}
							className="border-primary/30 text-primary hover:bg-primary/10"
						>
							<Download className="h-4 w-4 mr-1.5" />
							下载
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={onBatchDelete}
							className="border-destructive/30 text-destructive hover:bg-destructive/10"
						>
							<Trash2 className="h-4 w-4 mr-1.5" />
							删除
						</Button>
						<Button variant="ghost" size="icon-sm" onClick={onClearSelection} aria-label="清除选择">
							<X className="h-4 w-4" />
						</Button>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export default BatchActionsBar
