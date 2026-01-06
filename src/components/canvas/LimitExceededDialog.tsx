/**
 * 每日限制提示弹窗
 * 当用户达到每日生成限制时显示
 */

import { useUser } from '@clerk/clerk-react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowUpCircle, Clock, LogIn, Share2, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { AUTHENTICATED_DAILY_LIMIT, BASE_DAILY_LIMIT } from '@/lib/storage'

interface LimitExceededDialogProps {
	/** 是否显示弹窗 */
	open: boolean
	/** 关闭弹窗回调 */
	onClose: () => void
	/** 当前每日限制 */
	dailyLimit?: number
}

/**
 * 每日限制提示弹窗组件
 */
const LimitExceededDialog = ({
	open,
	onClose,
	dailyLimit = BASE_DAILY_LIMIT,
}: LimitExceededDialogProps) => {
	const { isSignedIn } = useUser()
	const navigate = useNavigate()

	// 是否可以升级（当前未登录）
	const canUpgrade = !isSignedIn

	const handleLogin = () => {
		onClose()
		navigate('/auth/sign-in')
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
								{canUpgrade ? '登录解锁更多次数' : '今日次数已用完'}
							</h3>

							{/* 描述 */}
							<p className="text-muted-foreground mb-6">
								{canUpgrade ? (
									<span>
										当前为游客模式，每日仅限 {BASE_DAILY_LIMIT} 次。
										<br />
										<span className="text-foreground font-medium">登录账号</span>
										即可升级至每日 {AUTHENTICATED_DAILY_LIMIT} 次生成机会！
									</span>
								) : (
									`您今天的 ${dailyLimit} 次生成机会已全部用完，请明天再来继续创作！`
								)}
							</p>

							{/* 升级按钮 或 倒计时 */}
							{canUpgrade ? (
								<div className="mb-8">
									<Button size="lg" className="w-full gap-2" onClick={handleLogin}>
										<LogIn className="h-5 w-5" />
										<span>立即登录升级权益</span>
									</Button>
									<p className="text-xs text-muted-foreground mt-3">* 登录即刻生效，无需等待</p>
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
									{canUpgrade ? '暂不登录' : '我知道了'}
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
