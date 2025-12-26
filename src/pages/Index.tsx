import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { History, Sparkles } from 'lucide-react'
import Header from '@/components/layout/Header'
import SketchCanvas from '@/components/canvas/SketchCanvas'
import StyleSelector from '@/components/canvas/StyleSelector'
import GenerationResultView from '@/components/canvas/GenerationResultView'
import LimitExceededDialog from '@/components/canvas/LimitExceededDialog'
import HistoryPanel from '@/components/canvas/HistoryPanel'
import { Button } from '@/components/ui/button'
import {
	STYLE_PRESETS,
	type StylePreset,
	type GenerationResult,
	type GenerationStatus,
} from '@/types/canvas'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { STARRED_DAILY_LIMIT } from '@/lib/storage'
import { useToast } from '@/hooks/use-toast'
import { useDailyLimit } from '@/hooks/use-daily-limit'
import { useHistory } from '@/hooks/use-history'
import { generateFromSketch, AIServiceError } from '@/lib/ai-service'

const Index = () => {
	const [selectedStyle, setSelectedStyle] = useState<StylePreset>(
		STYLE_PRESETS[0]
	)
	const [status, setStatus] = useState<GenerationStatus>('idle')
	const [result, setResult] = useState<GenerationResult | null>(null)
	const [showLimitDialog, setShowLimitDialog] = useState(false)
	const [showHistory, setShowHistory] = useState(false)

	const { toast } = useToast()
	const {
		remainingCount,
		dailyLimit,
		isLimitReached,
		consumeGeneration,
		upgradeQuota,
	} = useDailyLimit()
	const { history, addToHistory, deleteFromHistory, clearAllHistory } =
		useHistory()

	const handleUpgrade = useCallback(() => {
		upgradeQuota()
		toast({
			title: '权益升级成功！🎉',
			description: `感谢您的支持，您已获得每日 ${dailyLimit} -> 1000 次生成次数`,
		})
	}, [upgradeQuota, dailyLimit, toast])

	const handleGenerate = useCallback(
		async (sketchDataUrl: string) => {
			// 检查是否达到限制
			if (isLimitReached) {
				setShowLimitDialog(true)
				return
			}

			// 消耗一次生成次数
			const success = consumeGeneration()
			if (!success) {
				setShowLimitDialog(true)
				return
			}

			setStatus('analyzing')
			setResult(null)

			try {
				// 调用真实 AI 服务（图生图模式）
				setStatus('generating')
				const aiResult = await generateFromSketch(sketchDataUrl, selectedStyle)

				setResult(aiResult)
				setStatus('complete')

				// 保存到历史记录
				addToHistory(sketchDataUrl, aiResult.generatedImageUrl, selectedStyle)

				toast({
					title: '生成成功! ✨',
					description: '您的 AI 艺术作品已准备就绪',
				})
			} catch (error) {
				setStatus('error')

				// 根据错误类型显示不同的提示
				const errorMessage =
					error instanceof AIServiceError
						? error.message
						: '请检查网络连接后重试'

				toast({
					title: '生成失败',
					description: errorMessage,
					variant: 'destructive',
				})
			}
		},
		[selectedStyle, toast, isLimitReached, consumeGeneration, addToHistory]
	)

	const handleCloseResult = useCallback(() => {
		setStatus('idle')
		setResult(null)
	}, [])

	return (
		<div className="min-h-screen animated-gradient">
			<Header />

			{/* Background Grid */}
			<div className="fixed inset-0 bg-grid-pattern bg-grid opacity-5 pointer-events-none" />

			{/* Main Content */}
			<main className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					{/* Hero Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-center mb-12"
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6"
						>
							<span className="animate-pulse">✦</span>
							<span>草图即灵感，AI 来绘制</span>
						</motion.div>

						<h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
							画出想法
							<span className="text-gradient">，</span>
							<br />
							<span className="text-gradient">AI 来实现</span>
						</h2>

						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							无需复杂提示词，简单几笔涂鸦，让 AI 理解你的创意并生成专业级图像
						</p>
					</motion.div>

					{/* Main App Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Canvas Section */}
						<div className="lg:col-span-2 space-y-4">
							{/* 顶部工具栏：剩余次数 + 历史记录 */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.3 }}
								className="flex items-center justify-end md:justify-between"
							>
								<div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
									<span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
									在画板上自由绘制您的想法
								</div>

								<div className="flex items-center gap-3">
									{/* 剩余次数显示 */}
									<TooltipProvider delayDuration={0}>
										<Tooltip>
											<TooltipTrigger asChild>
												<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30 border border-border/50 text-sm cursor-help hover:bg-muted/50 transition-colors">
													<Sparkles className="h-4 w-4 text-primary" />
													<span className="text-muted-foreground">
														今日剩余{' '}
														<span
															className={
																remainingCount <= 5
																	? 'text-amber-500 font-medium'
																	: 'text-foreground font-medium'
															}
														>
															{remainingCount}
														</span>
														/{dailyLimit} 次
													</span>
												</div>
											</TooltipTrigger>
											{dailyLimit < STARRED_DAILY_LIMIT && (
												<TooltipContent>
													<p>
														前往右上角 GitHub 点个 Star ⭐️
														支持一下，解锁更多生成次数！
													</p>
												</TooltipContent>
											)}
										</Tooltip>
									</TooltipProvider>

									{/* 历史记录按钮 */}
									<Button
										variant="outline"
										size="sm"
										className="gap-2"
										onClick={() => setShowHistory(true)}
										aria-label="打开历史记录"
										tabIndex={0}
									>
										<History className="h-4 w-4" />
										<span className="hidden sm:inline">历史记录</span>
										{history.length > 0 && (
											<span className="h-5 w-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
												{history.length}
											</span>
										)}
									</Button>
								</div>
							</motion.div>

							<SketchCanvas
								onExport={handleGenerate}
								isGenerating={status === 'analyzing' || status === 'generating'}
							/>
						</div>

						{/* Style Selector */}
						<div className="lg:col-span-1">
							<StyleSelector
								selectedStyle={selectedStyle}
								onSelectStyle={setSelectedStyle}
							/>

							{/* Tips Section */}
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.5 }}
								className="mt-8 p-4 rounded-xl bg-card/30 border border-border/50"
							>
								<h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
									<span>💡</span>
									小贴士
								</h4>
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										简单的形状也能产生惊艳效果
									</li>
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										尝试不同风格获得不同效果
									</li>
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										线条清晰能帮助 AI 更好识别
									</li>
								</ul>
							</motion.div>
						</div>
					</div>
				</div>
			</main>

			<footer className="pt-6 pb-24 md:py-6 text-center">
				<p className="text-sm text-muted-foreground/60">
					大模型版本：Google Nano Banana Pro
				</p>
			</footer>

			{/* Generation Result Modal */}
			<GenerationResultView
				result={result}
				status={status}
				onClose={handleCloseResult}
			/>

			{/* 每日限制弹窗 */}
			<LimitExceededDialog
				open={showLimitDialog}
				onClose={() => setShowLimitDialog(false)}
				dailyLimit={dailyLimit}
				onUpgrade={handleUpgrade}
			/>

			{/* 历史记录面板 */}
			<HistoryPanel
				open={showHistory}
				onClose={() => setShowHistory(false)}
				history={history}
				onDelete={deleteFromHistory}
				onClearAll={clearAllHistory}
			/>
		</div>
	)
}

export default Index
