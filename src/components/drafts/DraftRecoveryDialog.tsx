/**
 * 草稿恢复对话框
 * @description 在检测到未完成草稿时显示，提供恢复或放弃选项
 */

import { motion } from 'framer-motion'
import { FileWarning, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import type { Draft } from '@/lib/draft-db'

interface DraftRecoveryDialogProps {
	/** 草稿数据 */
	draft: Draft | null
	/** 是否显示对话框 */
	open: boolean
	/** 对话框关闭回调 */
	onClose: () => void
	/** 恢复草稿回调 */
	onRecover: (draft: Draft) => void
	/** 放弃草稿回调 */
	onDiscard: (draft: Draft) => void
}

/**
 * 草稿恢复对话框组件
 */
const DraftRecoveryDialog = ({
	draft,
	open,
	onClose,
	onRecover,
	onDiscard,
}: DraftRecoveryDialogProps) => {
	const [isRecovering, setIsRecovering] = useState(false)
	const [isDiscarding, setIsDiscarding] = useState(false)

	if (!draft) return null

	const handleRecover = async () => {
		setIsRecovering(true)
		try {
			await onRecover(draft)
		} finally {
			setIsRecovering(false)
			onClose()
		}
	}

	const handleDiscard = async () => {
		setIsDiscarding(true)
		try {
			await onDiscard(draft)
		} finally {
			setIsDiscarding(false)
			onClose()
		}
	}

	const formatTime = (timestamp: number) => {
		const date = new Date(timestamp)
		const now = new Date()
		const diffMs = now.getTime() - date.getTime()
		const diffMins = Math.floor(diffMs / 60000)

		if (diffMins < 1) return '刚刚'
		if (diffMins < 60) return `${diffMins} 分钟前`
		if (diffMins < 1440) return `${Math.floor(diffMins / 60)} 小时前`
		return `${Math.floor(diffMins / 1440)} 天前`
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<FileWarning className="h-5 w-5 text-amber-500" />
						发现未完成的草稿
					</DialogTitle>
					<DialogDescription>
						检测到 {formatTime(draft.updatedAt)} 自动保存的草稿，是否要恢复？
					</DialogDescription>
				</DialogHeader>

				{/* 草稿预览 */}
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					className="relative aspect-video rounded-lg border bg-muted/30 overflow-hidden"
				>
					{draft.thumbnailBlob ? (
						<img
							src={URL.createObjectURL(draft.thumbnailBlob)}
							alt="草稿预览"
							className="w-full h-full object-contain"
						/>
					) : (
						<div className="flex items-center justify-center h-full text-sm text-muted-foreground">
							无预览图
						</div>
					)}
				</motion.div>

				<DialogFooter className="flex-col sm:flex-row gap-2">
					<Button
						variant="outline"
						onClick={handleDiscard}
						disabled={isRecovering || isDiscarding}
						className="w-full sm:w-auto"
					>
						{isDiscarding ? (
							<>
								<div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin mr-2" />
								删除中...
							</>
						) : (
							<>
								<Trash2 className="h-4 w-4 mr-2" />
								放弃草稿
							</>
						)}
					</Button>
					<Button
						variant="glow"
						onClick={handleRecover}
						disabled={isRecovering || isDiscarding}
						className="w-full sm:w-auto"
					>
						{isRecovering ? (
							<>
								<div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2" />
								恢复中...
							</>
						) : (
							<>
								<span className="mr-2">✨</span>
								恢复草稿
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

export default DraftRecoveryDialog
