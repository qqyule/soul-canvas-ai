import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { History, Sparkles, Github, HelpCircle } from 'lucide-react'
import Header from '@/components/layout/Header'
import SketchCanvas from '@/components/canvas/SketchCanvas'
import StyleSelector from '@/components/canvas/StyleSelector'
import BatchSelector from '@/components/canvas/BatchSelector'
import { fadeIn, slideUp, staggerChildren } from '@/config/animations'
import GenerationResultView from '@/components/canvas/GenerationResultView'
import LimitExceededDialog from '@/components/canvas/LimitExceededDialog'
import HistoryPanel from '@/components/canvas/HistoryPanel'
import OnboardingTour from '@/components/OnboardingTour'
import DraftStatusIndicator from '@/components/drafts/DraftStatusIndicator'
import DraftRecoveryDialog from '@/components/drafts/DraftRecoveryDialog'
import MaLiangIntroduction from '@/components/story/MaLiangIntroduction'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MotionButton } from '@/components/ui/motion-button'
import PageTransition from '@/components/layout/page-transition'
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
import {
	STARRED_DAILY_LIMIT,
	GITHUB_REPO_URL,
	AUTHENTICATED_DAILY_LIMIT,
} from '@/lib/storage'
import { useToast } from '@/hooks/use-toast'
import { useDailyLimit } from '@/hooks/use-daily-limit'
import { useHistory } from '@/hooks/use-history'
import { useDrafts } from '@/hooks/use-drafts'
import { generateFromSketch, AIServiceError } from '@/lib/ai-service'
import { useUser } from '@clerk/clerk-react'
import type { Draft } from '@/lib/draft-db'
import type { InspirationConfig } from '@/lib/inspiration-generator'
import { generateRandomInspiration } from '@/lib/inspiration-generator'
import { animatePathsDrawing } from '@/lib/inspiration-animation'
import type { SketchCanvasRef } from '@/components/canvas/SketchCanvas'

const Index = () => {
	const [selectedStyle, setSelectedStyle] = useState<StylePreset>(
		STYLE_PRESETS[0]
	)
	const [status, setStatus] = useState<GenerationStatus>('idle')
	const [results, setResults] = useState<GenerationResult[] | null>(null)
	const [batchSize, setBatchSize] = useState(1)
	const [showStory, setShowStory] = useState(false)
	const [userPrompt, setUserPrompt] = useState('')
	const [showLimitDialog, setShowLimitDialog] = useState(false)
	const [showHistory, setShowHistory] = useState(false)
	const [showRecoveryDialog, setShowRecoveryDialog] = useState(false)
	const [draftToRecover, setDraftToRecover] = useState<Draft | null>(null)

	// 用于取消请求的 AbortController
	const abortControllerRef = useRef<AbortController | null>(null)
	// SketchCanvas ref
	const sketchCanvasRef = useRef<SketchCanvasRef>(null)

	const { toast } = useToast()
	const { isSignedIn } = useUser()
	const { remainingCount, dailyLimit, isLimitReached, consumeGeneration } =
		useDailyLimit()
	const {
		history,
		filteredHistory,
		filter,
		setFilter,
		availableStyles,
		addToHistory,
		deleteFromHistory,
		deleteMultiple,
		clearAllHistory,
	} = useHistory()
	const { saveStatus, saveDraft, checkLatestDraft, deleteDraft } = useDrafts()

	/**
	 * 处理画布数据变化，触发自动保存
	 */
	const handleCanvasChange = useCallback(
		(canvasData: string) => {
			saveDraft({
				canvasData,
				styleId: selectedStyle.id,
				prompt: userPrompt,
			})
		},
		[saveDraft, selectedStyle.id, userPrompt]
	)

	/**
	 * 处理灵感生成
	 */
	/**
	 * 直接生成随机灵感
	 */
	const handleRandomInspiration = useCallback(async () => {
		try {
			// 随机配置
			// 随机配置 (加权随机：偏好 sketch 和 organic)
			const weightedCategories: InspirationCategory[] = [
				'sketch',
				'sketch',
				'sketch',
				'sketch', // 40%
				'organic',
				'organic',
				'organic', // 30%
				'pattern',
				'pattern', // 20%
				'geometric', // 10%
			]
			const category =
				weightedCategories[
					Math.floor(Math.random() * weightedCategories.length)
				]

			const complexities = ['simple', 'medium', 'complex'] as const
			const config: InspirationConfig = {
				category,
				complexity:
					complexities[Math.floor(Math.random() * complexities.length)],
				canvasWidth: 800,
				canvasHeight: 400,
			}

			// 生成灵感
			const result = generateRandomInspiration(config)

			// 清空画布并加载新路径
			sketchCanvasRef.current?.clearCanvas()
			await animatePathsDrawing(
				sketchCanvasRef,
				result.paths,
				result.animationDuration
			)

			// 填充推荐提示词
			if (result.suggestedPrompts.length > 0) {
				setUserPrompt(result.suggestedPrompts[0])
			}

			toast({
				title: '灵感已生成！✨',
				description: 'AI 已为您绘制了草图并填写了提示词',
			})
		} catch (error) {
			console.error('Failed to generate inspiration:', error)
			toast({
				title: '生成失败',
				description: '无法生成灵感，请重试',
				variant: 'destructive',
			})
		}
	}, [userPrompt, toast])

	/**
	 * 恢复草稿
	 */
	const handleRecoverDraft = useCallback(
		async (draft: Draft) => {
			try {
				// TODO: 将草稿数据恢复到画布
				// 需要 SketchCanvas 暴露 loadPaths 方法
				console.log('Recovering draft:', draft)

				// 恢复提示词和风格
				if (draft.prompt) setUserPrompt(draft.prompt)
				const style = STYLE_PRESETS.find((s) => s.id === draft.styleId)
				if (style) setSelectedStyle(style)

				toast({
					title: '草稿已恢复',
					description: '已恢复上次未完成的作品',
				})
			} catch (error) {
				console.error('Failed to recover draft:', error)
				toast({
					title: '恢复失败',
					description: '无法恢复草稿，请重新开始',
					variant: 'destructive',
				})
			}
		},
		[toast]
	)

	/**
	 * 放弃草稿
	 */
	const handleDiscardDraft = useCallback(
		async (draft: Draft) => {
			try {
				await deleteDraft(draft.id)
				toast({
					title: '已放弃草稿',
					description: '草稿已删除',
				})
			} catch (error) {
				console.error('Failed to discard draft:', error)
			}
		},
		[deleteDraft, toast]
	)

	/**
	 * 页面加载时检查是否有未完成的草稿
	 */
	useEffect(() => {
		const checkDraft = async () => {
			const latest = await checkLatestDraft()
			if (latest) {
				setDraftToRecover(latest)
				setShowRecoveryDialog(true)
			}
		}
		checkDraft()
	}, [checkLatestDraft])

	const handleGenerate = useCallback(
		async (sketchDataUrl: string) => {
			// 检查是否达到限制（预检查）
			if (checkLatestDraft === undefined) {
				// skip
			}

			// 检查剩余次数是否足够
			if (isLimitReached || remainingCount < batchSize) {
				setShowLimitDialog(true)
				return
			}

			setStatus('analyzing')
			setResults(null)

			// 创建新的 AbortController
			abortControllerRef.current = new AbortController()
			const signal = abortControllerRef.current.signal

			try {
				// 简单的输入清洗：去除首尾空格
				const sanitizedPrompt = userPrompt.trim()

				// 长度截断（虽然前端限制了 input 长度，但 API 层再做一次防御）
				const finalPrompt = sanitizedPrompt.slice(0, 500)

				// 调用真实 AI 服务（图生图模式）
				setStatus('generating')

				// 并行执行批量生成
				const generatePromise = generateFromSketch(
					sketchDataUrl,
					selectedStyle,
					finalPrompt,
					signal
				)

				const promises = Array(batchSize)
					.fill(null)
					.map(() => generatePromise)
				// 注意：这里简单的重复调用 generateFromSketch 并不能保证随机性，
				// 除非后端支持或每次调用生成不同的 seed (但在 generateFromSketch 内部目前没暴露 seed 参数)。
				// 现在的 AI Service 会调用 OpenRouter，如果 OpenRouter 侧没有传 seed，通常是随机的。
				// *为了确保变体，实际上应该并发调用*。

				// 修正：上面的 promises map 应该每次创建新的 Promise 调用
				const actualPromises = Array.from({ length: batchSize }).map(() =>
					generateFromSketch(sketchDataUrl, selectedStyle, finalPrompt, signal)
				)

				const results = await Promise.all(actualPromises)

				// 批量扣分
				const success = consumeGeneration(batchSize)
				if (!success) {
					setShowLimitDialog(true)
					// 虽然生成成功了但扣分失败（并发边界情况），展示结果但提示耗尽
				}

				setResults(results)
				setStatus('complete')

				// 批量保存到历史记录
				results.forEach((res) => {
					addToHistory(sketchDataUrl, res.generatedImageUrl, selectedStyle)
				})

				toast({
					title: '生成成功! ✨',
					description: `已为您生成 ${batchSize} 张 AI 艺术作品`,
				})
			} catch (error) {
				// 请求被取消时静默处理
				if (error instanceof DOMException && error.name === 'AbortError') {
					console.log('[Index] 请求已取消')
					return
				}

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
			} finally {
				abortControllerRef.current = null
			}
		},
		[
			selectedStyle,
			userPrompt,
			toast,
			isLimitReached,
			remainingCount,
			batchSize,
			consumeGeneration,
			addToHistory,
		]
	)

	const handleCloseResult = useCallback(() => {
		// 如果有进行中的请求，取消它
		if (abortControllerRef.current) {
			abortControllerRef.current.abort()
			abortControllerRef.current = null
		}
		setStatus('idle')
		setResults(null)
	}, [])

	return (
		<div className="min-h-screen animated-gradient">
			<OnboardingTour />
			<Header onLogoClick={() => setShowStory(true)} />

			{/* Background Grid */}
			<div className="fixed inset-0 bg-grid-pattern bg-grid opacity-5 pointer-events-none" />

			{/* Main Content */}
			<PageTransition className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
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
							<motion.span
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2, duration: 0.5 }}
								className="inline-block"
							>
								画出想法
							</motion.span>
							<span className="text-gradient">，</span>
							<br />
							<motion.span
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4, duration: 0.5 }}
								className="inline-block text-gradient"
							>
								AI 来实现
							</motion.span>
							<motion.span
								initial={{ opacity: 0, scale: 0 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.8, type: 'spring' }}
								className="ml-3 inline-flex align-top"
								onMouseEnter={() => setShowStory(true)}
							>
								<div className="h-6 w-6 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center cursor-help transition-colors">
									<HelpCircle className="h-4 w-4 text-primary" />
								</div>
							</motion.span>
						</h2>

						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.6 }}
							className="text-lg text-muted-foreground max-w-2xl mx-auto"
						>
							无需复杂提示词，简单几笔涂鸦，让 AI 理解你的创意并生成专业级图像
						</motion.p>
					</motion.div>

					{/* Main App Grid */}
					<motion.div
						variants={staggerChildren}
						initial="initial"
						animate="animate"
						className="grid grid-cols-1 lg:grid-cols-3 gap-8"
					>
						{/* Canvas Section */}
						<motion.div variants={slideUp} className="lg:col-span-2 space-y-4">
							{/* 顶部工具栏：剩余次数 + 历史记录 */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.3 }}
								className="flex items-center justify-end md:justify-between"
							>
								<div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground flex-1">
									<span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
									在画板上自由绘制您的想法
								</div>

								<div className="flex items-center gap-3">
									{/* 批量生成选择器 */}
									<BatchSelector
										value={batchSize}
										onChange={setBatchSize}
										disabled={remainingCount < 1}
										maxBatchSize={4}
									/>

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
											<TooltipContent>
												{isSignedIn ? (
													<p>
														每日享有 {dailyLimit} 次生成机会
														{dailyLimit < STARRED_DAILY_LIMIT &&
															' (Star 项目可解锁 1000 次)'}
													</p>
												) : (
													<p>
														当前为游客模式 (每日 {dailyLimit} 次)
														<br />
														<span className="font-bold text-primary">
															登录
														</span>{' '}
														立即升级至每日 {AUTHENTICATED_DAILY_LIMIT} 次！
													</p>
												)}
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									{/* 历史记录按钮 */}
									<MotionButton
										variant="outline"
										size="sm"
										className="gap-2"
										onClick={() => setShowHistory(true)}
										aria-label="打开历史记录"
										tabIndex={0}
										id="tour-history"
									>
										<History className="h-4 w-4" />
										<span className="hidden sm:inline">历史记录</span>
										{history.length > 0 && (
											<span className="h-5 w-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center">
												{history.length}
											</span>
										)}
									</MotionButton>
								</div>
							</motion.div>

							{/* Prompt Input Box */}
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.35 }}
								className="relative group"
							>
								<div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
								<div className="relative">
									<Input
										placeholder="输入提示词描述你的草图（例如：一艘在星际穿梭的飞船）..."
										value={userPrompt}
										onChange={(e) => setUserPrompt(e.target.value)}
										maxLength={500}
										className="w-full bg-card/50 border-border/60 hover:border-primary/30 focus-visible:ring-primary/30 backdrop-blur-sm pr-10"
										id="tour-prompt"
									/>
									<div className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground/50 pointer-events-none">
										{userPrompt.length}/500
									</div>
									{userPrompt && (
										<button
											onClick={() => setUserPrompt('')}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
											aria-label="清空提示词"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<line x1="18" y1="6" x2="6" y2="18"></line>
												<line x1="6" y1="6" x2="18" y2="18"></line>
											</svg>
										</button>
									)}
								</div>
							</motion.div>

							<div id="tour-canvas">
								<SketchCanvas
									ref={sketchCanvasRef}
									onExport={handleGenerate}
									isGenerating={
										status === 'analyzing' || status === 'generating'
									}
									onCanvasChange={handleCanvasChange}
									onInspirationClick={handleRandomInspiration}
								/>
							</div>
						</motion.div>

						{/* Style Selector */}
						<motion.div variants={slideUp} className="lg:col-span-1">
							<div id="tour-style">
								<StyleSelector
									selectedStyle={selectedStyle}
									onSelectStyle={setSelectedStyle}
								/>
							</div>

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
						</motion.div>
					</motion.div>
				</div>
			</PageTransition>

			<footer className="pt-6 pb-24 md:py-6 text-center space-y-4">
				<p className="text-sm text-muted-foreground/60">
					大模型版本：Google Nano Banana Pro
				</p>
				<div className="flex justify-center">
					<a
						href={GITHUB_REPO_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 text-sm text-muted-foreground/80 hover:text-foreground transition-colors"
					>
						<Github className="h-4 w-4" />
						<span>GitHub</span>
					</a>
				</div>
			</footer>

			{/* Generation Result Modal */}
			<GenerationResultView
				results={results}
				status={status}
				batchCount={batchSize}
				onClose={handleCloseResult}
			/>

			{/* 每日限制弹窗 */}
			<LimitExceededDialog
				open={showLimitDialog}
				onClose={() => setShowLimitDialog(false)}
				dailyLimit={dailyLimit}
			/>

			{/* 历史记录面板 */}
			<HistoryPanel
				open={showHistory}
				onClose={() => setShowHistory(false)}
				history={history}
				filteredHistory={filteredHistory}
				filter={filter}
				onFilterChange={setFilter}
				availableStyles={availableStyles}
				onDelete={deleteFromHistory}
				onDeleteMultiple={deleteMultiple}
				onClearAll={clearAllHistory}
			/>

			{/* 草稿恢复对话框 */}
			<DraftRecoveryDialog
				draft={draftToRecover}
				open={showRecoveryDialog}
				onClose={() => setShowRecoveryDialog(false)}
				onRecover={handleRecoverDraft}
				onDiscard={handleDiscardDraft}
			/>

			{/* 神笔马良故事弹窗 */}
			<MaLiangIntroduction
				open={showStory}
				onClose={() => setShowStory(false)}
			/>
		</div>
	)
}

export default Index
