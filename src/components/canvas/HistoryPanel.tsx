/**
 * 历史记录面板
 * 侧边抽屉式显示用户的生成历史
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
	History,
	Download,
	Trash2,
	X,
	ImageIcon,
	Clock,
	Palette,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { HistoryItem } from '@/lib/history-db'
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

interface HistoryPanelProps {
	/** 是否显示面板 */
	open: boolean
	/** 关闭面板回调 */
	onClose: () => void
	/** 历史记录列表 */
	history: HistoryItem[]
	/** 删除记录回调 */
	onDelete: (id: string) => void
	/** 清空全部回调 */
	onClearAll: () => void
}

/**
 * 下载图片
 */
const handleDownload = async (url: string, filename: string) => {
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
		// Ignore error
	}
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
 * 历史记录面板组件
 */
const HistoryPanel = ({
	open,
	onClose,
	history,
	onDelete,
	onClearAll,
}: HistoryPanelProps) => {
	const [showClearConfirm, setShowClearConfirm] = useState(false)
	const [previewItem, setPreviewItem] = useState<HistoryItem | null>(null)

	return (
		<>
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
							className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col"
						>
							{/* Header */}
							<div className="flex items-center justify-between p-4 border-b border-border">
								<div className="flex items-center gap-2">
									<History className="h-5 w-5 text-primary" />
									<span className="font-semibold">历史记录</span>
									<span className="text-sm text-muted-foreground">
										({history.length})
									</span>
								</div>
								<div className="flex items-center gap-2">
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

							{/* Content */}
							<ScrollArea className="flex-1">
								{history.length === 0 ? (
									<div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
										<ImageIcon className="h-12 w-12 mb-4 opacity-50" />
										<p>暂无历史记录</p>
										<p className="text-sm">开始创作，记录会自动保存到这里</p>
									</div>
								) : (
									<div className="p-4 space-y-3">
										{history.map((item) => (
											<motion.div
												key={item.id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												className="group relative p-3 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
											>
												<div className="flex gap-3">
													{/* 缩略图 */}
													<button
														className="relative h-16 w-16 rounded-lg overflow-hidden bg-canvas-bg border border-border flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
														onClick={() => setPreviewItem(item)}
														aria-label="预览图片"
														tabIndex={0}
														onKeyDown={(e) => {
															if (e.key === 'Enter' || e.key === ' ') {
																setPreviewItem(item)
															}
														}}
													>
														<img
															src={item.resultUrl}
															alt="生成结果"
															className="w-full h-full object-cover"
														/>
													</button>

													{/* 信息 */}
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
															<Palette className="h-3 w-3" />
															<span className="truncate">{item.styleName}</span>
														</div>
														<div className="flex items-center gap-2 text-xs text-muted-foreground">
															<Clock className="h-3 w-3" />
															<span>{formatDate(item.createdAt)}</span>
														</div>
													</div>

													{/* 操作按钮 */}
													<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
														<Button
															variant="ghost"
															size="icon-sm"
															onClick={() =>
																handleDownload(
																	item.resultUrl,
																	`shenbimaliang-${item.id}.png`
																)
															}
															aria-label="下载图片"
															tabIndex={0}
														>
															<Download className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon-sm"
															className="text-destructive hover:text-destructive"
															onClick={() => onDelete(item.id)}
															aria-label="删除记录"
															tabIndex={0}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</div>
											</motion.div>
										))}
									</div>
								)}
							</ScrollArea>
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
							此操作将删除所有历史记录，且无法恢复。
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>取消</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							onClick={() => {
								onClearAll()
								setShowClearConfirm(false)
							}}
						>
							确认清空
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
		</>
	)
}

export default HistoryPanel
