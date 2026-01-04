/**
 * 草稿保存状态指示器
 * @description 显示在画布工具栏旁，实时反馈自动保存状态
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, HardDrive, Check, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SaveStatus } from '@/hooks/use-drafts'

interface DraftStatusIndicatorProps {
	/** 保存状态 */
	status: SaveStatus
	/** 是否已登录（登录用户显示云图标） */
	isSignedIn?: boolean
	/** 自定义类名 */
	className?: string
}

/**
 * 草稿保存状态指示器组件
 */
const DraftStatusIndicator = ({
	status,
	isSignedIn = false,
	className,
}: DraftStatusIndicatorProps) => {
	// idle 状态不显示
	if (status === 'idle') {
		return null
	}

	const getIcon = () => {
		switch (status) {
			case 'saving':
				return <Loader2 className="h-3 w-3 animate-spin" />
			case 'saved':
				return (
					<>
						<Check className="h-3 w-3" />
						{isSignedIn ? (
							<Cloud className="h-3 w-3 ml-1" />
						) : (
							<HardDrive className="h-3 w-3 ml-1" />
						)}
					</>
				)
			case 'error':
				return <AlertCircle className="h-3 w-3" />
			default:
				return null
		}
	}

	const getText = () => {
		switch (status) {
			case 'saving':
				return '保存中...'
			case 'saved':
				return isSignedIn ? '已同步' : '已保存'
			case 'error':
				return '保存失败'
			default:
				return ''
		}
	}

	const getColorClass = () => {
		switch (status) {
			case 'saving':
				return 'text-muted-foreground bg-muted/50'
			case 'saved':
				return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30'
			case 'error':
				return 'text-destructive bg-destructive/10'
			default:
				return ''
		}
	}

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				className={cn(
					'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
					getColorClass(),
					className
				)}
			>
				{getIcon()}
				<span>{getText()}</span>
			</motion.div>
		</AnimatePresence>
	)
}

export default DraftStatusIndicator
