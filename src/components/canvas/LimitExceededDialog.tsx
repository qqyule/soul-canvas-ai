/**
 * 每日限制提示弹窗
 * 当用户达到每日生成限制时显示
 */

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Clock, Share2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LimitExceededDialogProps {
	/** 是否显示弹窗 */
	open: boolean
	/** 关闭弹窗回调 */
	onClose: () => void
}

/**
 * 每日限制提示弹窗组件
 */
const LimitExceededDialog = ({ open, onClose }: LimitExceededDialogProps) => {
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
							{/* 图标 */}
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: 'spring', delay: 0.1 }}
								className="mx-auto mb-6 h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center"
							>
								<AlertTriangle className="h-8 w-8 text-amber-500" />
							</motion.div>

							{/* 标题 */}
							<h3 className="text-xl font-bold text-foreground mb-2">
								今日次数已用完
							</h3>

							{/* 描述 */}
							<p className="text-muted-foreground mb-6">
								您今天的 20 次免费生成次数已全部用完，请明天再来继续创作！
							</p>

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

							{/* 按钮组 */}
							<div className="flex flex-col sm:flex-row gap-3">
								<Button variant="outline" className="flex-1" onClick={onClose}>
									我知道了
								</Button>
								<Button
									variant="glow"
									className="flex-1"
									onClick={() => {
										if (navigator.share) {
											navigator.share({
												title: '神笔马良 - AI 绘画',
												text: '一笔成画，AI 帮你实现！来试试用简笔画生成专业图像吧~',
												url: window.location.href,
											})
										} else {
											// 复制链接到剪贴板
											navigator.clipboard.writeText(window.location.href)
										}
									}}
								>
									<Share2 className="h-4 w-4" />
									分享给朋友
								</Button>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export default LimitExceededDialog
