/**
 * 历史记录面板（重构版）
 * @description 侧边抽屉式显示用户的生成历史，支持虚拟滚动、过滤和批量操作
 */

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, X, Download, Grid, List, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { HistoryItem } from '@/lib/history-db'
import type { HistoryFilter } from '@/types/history'
import { DEFAULT_SELECTION_STATE, type SelectionState } from '@/types/history'
import { FilterBar, BatchActionsBar, VirtualizedHistoryList } from './history'

interface HistoryPanelProps {
	/** 是否显示面板 */
	open: boolean
	/** 关闭面板回调 */
	onClose: () => void
	/** 历史记录列表 */
	history: HistoryItem[]
	/** 过滤后的历史记录 */
	filteredHistory: HistoryItem[]
	/** 当前过滤配置 */
	filter: HistoryFilter
	/** 设置过滤配置 */
	onFilterChange: (filter: HistoryFilter) => void
	/** 可用风格列表 */
	availableStyles: Array<{ id: string; name: string }>
	/** 删除记录回调 */
	onDelete: (id: string) => void
	/** 批量删除回调 */
	onDeleteMultiple: (ids: string[]) => void
	/** 清空全部回调 */
	onClearAll: () => void
}

/**
 * 下载图片
 */
const handleDownload = async (url: string | undefined, filename: string) => {
	if (!url) return
	try {
		const response = await fetch(url)
		const blob = await response.blob()
		const blobUrl = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = blobUrl
		a.download = filename
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(blobUrl)
	} catch (error) {
		console.error('Download failed, fallback to direct link:', error)
		const a = document.createElement('a')
		a.href = url
		a.download = filename
		a.target = '_blank'
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
	}
}

/**
 * 批量下载图片
 */
const handleBatchDownload = async (items: HistoryItem[]) => {
	for (const item of items) {
		await handleDownload(item.resultUrl, `shenbimaliang-${item.id}.png`)
		// 添加小延迟避免浏览器阻止多次下载
		await new Promise((resolve) => setTimeout(resolve, 300))
	}
}

/**
 * 历史记录面板组件
 */
const HistoryPanel = ({
	open,
	onClose,
	history,
	filteredHistory,
	filter,
	onFilterChange,
	availableStyles,
	onDelete,
	onDeleteMultiple,
	onClearAll,
}: HistoryPanelProps) => {
	// 清空确认弹窗
	const [showClearConfirm, setShowClearConfirm] = useState(false)
	// 批量删除确认弹窗
	const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false)
	// 预览项
	const [previewItem, setPreviewItem] = useState<HistoryItem | null>(null)
	// 选择状态
	const [selection, setSelection] = useState<SelectionState>(
		DEFAULT_SELECTION_STATE
	)
	// 视图模式
	const [columns, setColumns] = useState(2)

	/** 是否处于多选模式 */
	const isSelectionMode = selection.selectedIds.size > 0

	/**
	 * 切换选中状态
	 */
	const handleToggleSelect = useCallback(
		(id: string) => {
			setSelection((prev) => {
				const newSelectedIds = new Set(prev.selectedIds)
				if (newSelectedIds.has(id)) {
					newSelectedIds.delete(id)
				} else {
					newSelectedIds.add(id)
				}
				return {
					selectedIds: newSelectedIds,
					isAllSelected: newSelectedIds.size === filteredHistory.length,
				}
			})
		},
		[filteredHistory.length]
	)

	/**
	 * 全选/取消全选
	 */
	const handleToggleSelectAll = useCallback(() => {
		setSelection((prev) => {
			if (prev.isAllSelected) {
				return { selectedIds: new Set(), isAllSelected: false }
			}
			return {
				selectedIds: new Set(filteredHistory.map((item) => item.id)),
				isAllSelected: true,
			}
		})
	}, [filteredHistory])

	/**
	 * 清除选择
	 */
	const handleClearSelection = useCallback(() => {
		setSelection(DEFAULT_SELECTION_STATE)
	}, [])

	/**
	 * 执行批量删除
	 */
	const handleBatchDelete = useCallback(() => {
		const ids = Array.from(selection.selectedIds)
		onDeleteMultiple(ids)
		setSelection(DEFAULT_SELECTION_STATE)
		setShowBatchDeleteConfirm(false)
	}, [selection.selectedIds, onDeleteMultiple])

	/**
	 * 执行批量下载
	 */
	const handleBatchDownloadClick = useCallback(() => {
		const items = filteredHistory.filter((item) =>
			selection.selectedIds.has(item.id)
		)
		handleBatchDownload(items)
	}, [filteredHistory, selection.selectedIds])

	/**
	 * 已选中的项目
	 */
	const selectedItems = useMemo(() => {
		return filteredHistory.filter((item) => selection.selectedIds.has(item.id))
	}, [filteredHistory, selection.selectedIds])

	return (
		<TooltipProvider>
			<AnimatePresence>
				{open && (
					<>
						{/* 背景遮罩 */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
							onClick={onClose}
						/>

						{/* 侧边面板 */}
						<motion.div
							initial={{ x: '100%' }}
							animate={{ x: 0 }}
							exit={{ x: '100%' }}
							transition={{ type: 'spring', damping: 25, stiffness: 300 }}
							className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col"
						>
							{/* Header */}
							<div className="flex items-center justify-between p-4 border-b border-border">
								<div className="flex items-center gap-2">
									<History className="h-5 w-5 text-primary" />
									<span className="font-semibold">历史记录</span>
								</div>
								<div className="flex items-center gap-2">
									{/* 列数切换 */}
									<div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
										<Button
											variant={columns === 2 ? 'secondary' : 'ghost'}
											size="icon-sm"
											onClick={() => setColumns(2)}
											aria-label="两列视图"
										>
											<Grid className="h-3.5 w-3.5" />
										</Button>
										<Button
											variant={columns === 3 ? 'secondary' : 'ghost'}
											size="icon-sm"
											onClick={() => setColumns(3)}
											aria-label="三列视图"
										>
											<List className="h-3.5 w-3.5" />
										</Button>
									</div>

									{history.length > 0 && (
										<Button
											variant="ghost"
											size="sm"
											className="text-destructive hover:text-destructive"
											onClick={() => setShowClearConfirm(true)}
										>
											清空全部
										</Button>
									)}
									<Button
										variant="ghost"
										size="icon"
										onClick={onClose}
										aria-label="关闭历史记录"
										tabIndex={0}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							</div>

							{/* 过滤工具栏 */}
							<div className="p-4 pb-0">
								<FilterBar
									filter={filter}
									onFilterChange={onFilterChange}
									availableStyles={availableStyles}
									totalCount={history.length}
									filteredCount={filteredHistory.length}
								/>
							</div>

							{/* 批量操作栏 */}
							{isSelectionMode && (
								<div className="px-4 pt-3">
									<BatchActionsBar
										selectedCount={selection.selectedIds.size}
										totalCount={filteredHistory.length}
										isAllSelected={selection.isAllSelected}
										onToggleSelectAll={handleToggleSelectAll}
										onBatchDelete={() => setShowBatchDeleteConfirm(true)}
										onBatchDownload={handleBatchDownloadClick}
										onClearSelection={handleClearSelection}
									/>
								</div>
							)}

							{/* 主内容区 - 虚拟滚动列表 */}
							<div className="flex-1 overflow-hidden p-4">
								<VirtualizedHistoryList
									items={filteredHistory}
									selectedIds={selection.selectedIds}
									isSelectionMode={isSelectionMode}
									onToggleSelect={handleToggleSelect}
									onDelete={onDelete}
									onPreview={setPreviewItem}
									onDownload={(item) =>
										handleDownload(
											item.resultUrl,
											`shenbimaliang-${item.id}.png`
										)
									}
									columns={columns}
								/>
							</div>

							{/* 多选提示 (未选中时) */}
							{!isSelectionMode && filteredHistory.length > 0 && (
								<div className="px-4 pb-4">
									<button
										className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
										onClick={handleToggleSelectAll}
									>
										<Settings2 className="h-3 w-3 inline-block mr-1" />
										长按或点击此处进入多选模式
									</button>
								</div>
							)}
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* 清空确认弹窗 */}
			<AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>确认清空所有记录？</AlertDialogTitle>
						<AlertDialogDescription>
							此操作将删除所有 {history.length} 条历史记录，且无法恢复。
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>取消</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => {
								onClearAll()
								setShowClearConfirm(false)
								setSelection(DEFAULT_SELECTION_STATE)
							}}
						>
							确认清空
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* 批量删除确认弹窗 */}
			<AlertDialog
				open={showBatchDeleteConfirm}
				onOpenChange={setShowBatchDeleteConfirm}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>确认删除选中记录？</AlertDialogTitle>
						<AlertDialogDescription>
							此操作将删除 {selection.selectedIds.size}{' '}
							条选中的记录，且无法恢复。
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>取消</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={handleBatchDelete}
						>
							确认删除
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* 图片预览弹窗 */}
			<AnimatePresence>
				{previewItem && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md"
						onClick={() => setPreviewItem(null)}
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="relative max-w-2xl w-full"
							onClick={(e) => e.stopPropagation()}
						>
							<Button
								variant="ghost"
								size="icon"
								className="absolute -top-12 right-0"
								onClick={() => setPreviewItem(null)}
								aria-label="关闭预览"
								tabIndex={0}
							>
								<X className="h-5 w-5" />
							</Button>

							<div className="rounded-2xl overflow-hidden border border-border shadow-2xl">
								<img
									src={previewItem.resultUrl}
									alt="预览图片"
									className="w-full h-auto"
								/>
							</div>

							{/* 预览信息 */}
							<div className="mt-4 p-4 rounded-lg bg-card/80 backdrop-blur-sm border border-border">
								<div className="grid grid-cols-2 gap-4 text-sm">
									<div>
										<span className="text-muted-foreground">风格:</span>
										<span className="ml-2 font-medium">
											{previewItem.styleName}
										</span>
									</div>
									<div>
										<span className="text-muted-foreground">创建时间:</span>
										<span className="ml-2 font-medium">
											{new Date(previewItem.createdAt).toLocaleString('zh-CN')}
										</span>
									</div>
								</div>
							</div>

							<div className="mt-4 flex items-center justify-center gap-3">
								<Button variant="outline" onClick={() => setPreviewItem(null)}>
									关闭
								</Button>
								<Button
									variant="glow"
									onClick={() =>
										handleDownload(
											previewItem.resultUrl,
											`shenbimaliang-${previewItem.id}.png`
										)
									}
								>
									<Download className="h-4 w-4" />
									下载图片
								</Button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</TooltipProvider>
	)
}

export default HistoryPanel
