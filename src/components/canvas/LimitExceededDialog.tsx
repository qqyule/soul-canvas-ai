/**
 * 每日限制提示弹窗
 * 当用户达到每日生成限制时显示
 */

import { motion, AnimatePresence } from 'framer-motion'
import {
	AlertTriangle,
	Clock,
	Share2,
	X,
	Github,
	ArrowUpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	GITHUB_REPO_URL,
	STARRED_DAILY_LIMIT,
	BASE_DAILY_LIMIT,
} from '@/lib/storage'

interface LimitExceededDialogProps {
	/** 是否显示弹窗 */
	open: boolean
	/** 关闭弹窗回调 */
	onClose: () => void
	/** 当前每日限制 */
	dailyLimit?: number
	/** 升级权益回调 */
	onUpgrade?: () => void
}

/**
 * 每日限制提示弹窗组件
 */
const LimitExceededDialog = ({
	open,
	onClose,
	dailyLimit = BASE_DAILY_LIMIT,
	onUpgrade,
}: LimitExceededDialogProps) => {
	const canUpgrade = dailyLimit < STARRED_DAILY_LIMIT && onUpgrade

	const handleUpgrade = () => {
		// 1. 打开 GitHub
		window.open(GITHUB_REPO_URL, '_blank')
		// 2. 升级权益 (假设用户去 Star 了)
		onUpgrade?.()
		// 3. 关闭弹窗
		onClose()
	}

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
					onClick={onClose}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{ type: 'spring', duration: 0.5 }}
						className="relative w-full max-w-md bg-card rounded-2xl border border-border overflow-hidden shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						{/* 关闭按钮 */}
						<Button
							variant="ghost"
							size="icon"
							className="absolute top-4 right-4"
							onClick={onClose}
							aria-label="关闭弹窗"
							tabIndex={0}
						>
							<X className="h-4 w-4" />
						</Button>

						{/* 内容 */}
						<div className="p-8 text-center">
							{/* 图标 - 可升级时显示更积极的图标 */}
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: 'spring', delay: 0.1 }}
								className={`mx-auto mb-6 h-16 w-16 rounded-full flex items-center justify-center ${
									canUpgrade ? 'bg-primary/10' : 'bg-amber-500/10'
								}`}
							>
								{canUpgrade ? (
									<ArrowUpCircle className="h-8 w-8 text-primary" />
								) : (
									<AlertTriangle className="h-8 w-8 text-amber-500" />
								)}
							</motion.div>

							{/* 标题 */}
							<h3 className="text-xl font-bold text-foreground mb-2">
								{canUpgrade ? '解锁每日 1000 次生成' : '今日次数已用完'}
							</h3>

							{/* 描述 */}
							<p className="text-muted-foreground mb-6">
								{canUpgrade ? (
									<span>
										当前每日限制为 {BASE_DAILY_LIMIT} 次。
										<br />
										在 GitHub 上为我们要一颗 Star ⭐️
										<br />
										即可永久免费升级至每日 {STARRED_DAILY_LIMIT} 次！
									</span>
								) : (
									'您今天的免费生成次数已全部用完，请明天再来继续创作！'
								)}
							</p>

							{/* 升级按钮 或 倒计时 */}
							{canUpgrade ? (
								<div className="mb-8">
									<Button
										size="lg"
										className="w-full gap-2 bg-gradient-to-r from-gray-900 to-gray-700 hover:from-black hover:to-gray-800 text-white dark:from-white dark:to-gray-200 dark:text-black dark:hover:from-gray-100 dark:hover:to-gray-300"
										onClick={handleUpgrade}
									>
										<Github className="h-5 w-5" />
										<span>去 GitHub Star 并升级权益</span>
									</Button>
									<p className="text-xs text-muted-foreground mt-3">
										* 点击跳转后，权益将自动生效
									</p>
								</div>
							) : (
								<>
									{/* 倒计时提示 */}
									<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
										<Clock className="h-4 w-4" />
										<span>次数将在每日 00:00 重置</span>
									</div>

									{/* 分享提示 */}
									<div className="p-4 rounded-xl bg-muted/30 border border-border/50 mb-6">
										<p className="text-sm text-muted-foreground">
											💡 分享给朋友，一起体验 AI 绘画的乐趣！
										</p>
									</div>
								</>
							)}

							{/* 底部按钮组 */}
							<div className="flex flex-col sm:flex-row gap-3">
								<Button variant="outline" className="flex-1" onClick={onClose}>
									{canUpgrade ? '暂不升级' : '我知道了'}
								</Button>

								{/* 只有不可升级时才显示分享按钮作为主要操作之一 */}
								{!canUpgrade && (
									<Button
										variant="ghost"
										className="flex-1 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
										onClick={() => {
											if (navigator.share) {
												navigator.share({
													title: '神笔马良 - AI 绘画',
													text: '一笔成画，AI 帮你实现！来试试用简笔画生成专业图像吧~',
													url: window.location.href,
												})
											} else {
												navigator.clipboard.writeText(window.location.href)
											}
										}}
									>
										<Share2 className="h-4 w-4" />
										分享给朋友
									</Button>
								)}
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export default LimitExceededDialog
