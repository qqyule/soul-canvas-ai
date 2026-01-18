/**
 * 绘本历史列表组件
 * @description 显示用户创建的所有绘本，支持预览和删除
 */

import { motion } from 'framer-motion'
import { BookOpen, Loader2, Play, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { Storybook } from '@/db/schema'
import { getGenreConfig } from '@/types/storybook'

interface StorybookHistoryListProps {
	/** 绘本列表 */
	storybooks: Storybook[]
	/** 加载状态 */
	isLoading: boolean
	/** 删除绘本回调 */
	onDelete: (id: string) => void
	/** 关闭面板回调 */
	onClose: () => void
}

/**
 * 绘本历史列表组件
 */
const StorybookHistoryList = ({
	storybooks,
	isLoading,
	onDelete,
	onClose,
}: StorybookHistoryListProps) => {
	const navigate = useNavigate()

	/**
	 * 打开阅读器
	 */
	const handleOpen = (storybookId: string) => {
		onClose()
		navigate(`/storybook/${storybookId}`)
	}

	// 加载状态
	if (isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<Loader2 className="w-6 h-6 animate-spin text-primary" />
			</div>
		)
	}

	// 空状态
	if (storybooks.length === 0) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center text-center p-8">
				<BookOpen className="w-16 h-16 text-muted-foreground/30 mb-4" />
				<h3 className="text-lg font-medium text-muted-foreground mb-2">
					还没有绘本
				</h3>
				<p className="text-sm text-muted-foreground/60">
					创建画作后点击"创作绘本"开始制作您的有声书
				</p>
			</div>
		)
	}

	return (
		<div className="flex-1 overflow-y-auto space-y-3 pr-1">
			{storybooks.map((storybook, index) => {
				const genreConfig = getGenreConfig(storybook.genre)
				const pageCount = Array.isArray(storybook.pages)
					? storybook.pages.length
					: 0

				return (
					<motion.div
						key={storybook.id}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.05 }}
						className="group relative bg-muted/30 rounded-xl border border-border/50 overflow-hidden hover:border-primary/30 transition-all"
					>
						<div className="flex gap-3 p-3">
							{/* 封面缩略图 */}
							<div className="relative w-16 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
								{storybook.coverUrl ? (
									<img
										src={storybook.coverUrl}
										alt={storybook.title}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-2xl">
										{genreConfig.icon}
									</div>
								)}
							</div>

							{/* 信息 */}
							<div className="flex-1 min-w-0">
								<h4 className="font-medium text-sm truncate mb-1">
									{storybook.title}
								</h4>
								<div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
									<span>{genreConfig.icon}</span>
									<span>{genreConfig.nameZh}</span>
									<span>·</span>
									<span>{pageCount} 页</span>
								</div>
								<p className="text-xs text-muted-foreground/70">
									{new Date(storybook.createdAt).toLocaleDateString('zh-CN')}
								</p>
							</div>

							{/* 操作按钮 */}
							<div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								<Button
									size="icon"
									variant="ghost"
									className="h-8 w-8"
									onClick={() => handleOpen(storybook.id)}
									aria-label="打开阅读器"
								>
									<Play className="w-4 h-4" />
								</Button>
								<Button
									size="icon"
									variant="ghost"
									className="h-8 w-8 text-destructive hover:text-destructive"
									onClick={() => onDelete(storybook.id)}
									aria-label="删除绘本"
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</motion.div>
				)
			})}
		</div>
	)
}

export default StorybookHistoryList
