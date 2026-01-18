/**
 * 绘本创作入口组件
 * @description 用于创建个性化绘本的向导式界面
 */

import { motion, AnimatePresence } from 'framer-motion'
import {
	BookOpen,
	ChevronRight,
	Download,
	Globe,
	Mic,
	Sparkles,
} from 'lucide-react'
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, schema } from '@/db'
import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { generateSpeech } from '@/lib/tts-client'
import { downloadStorybookPDF } from '@/lib/pdf-export'
import {
	type StoryGenre,
	type StorybookData,
	type StoryPage,
	GENRE_CONFIGS,
	SUPPORTED_LANGUAGES,
} from '@/types/storybook'

interface StorybookCreatorProps {
	/** 是否打开 */
	open: boolean
	/** 关闭回调 */
	onClose: () => void
	/** 作品图片列表（用于创建绘本） */
	artworkImages?: string[]
}

/**
 * 绘本创作向导步骤
 */
type CreatorStep = 'genre' | 'details' | 'preview'

/**
 * 绘本创作入口组件
 */
const StorybookCreator = ({
	open,
	onClose,
	artworkImages = [],
}: StorybookCreatorProps) => {
	const { toast } = useToast()
	const navigate = useNavigate()

	// 向导步骤
	const [step, setStep] = useState<CreatorStep>('genre')

	// 表单状态
	const [selectedGenre, setSelectedGenre] = useState<StoryGenre>('adventure')
	const [title, setTitle] = useState('')
	const [language, setLanguage] = useState('zh-CN')
	const [enableTTS, setEnableTTS] = useState(true)
	const [isGenerating, setIsGenerating] = useState(false)
	const [generationProgress, setGenerationProgress] = useState(0)
	const [generationStatus, setGenerationStatus] = useState('')

	/**
	 * 重置状态
	 */
	const handleClose = useCallback(() => {
		setStep('genre')
		setTitle('')
		setSelectedGenre('adventure')
		setLanguage('zh-CN')
		onClose()
	}, [onClose])

	/**
	 * 下一步
	 */
	const handleNext = useCallback(() => {
		if (step === 'genre') {
			setStep('details')
		} else if (step === 'details') {
			if (!title.trim()) {
				toast({
					title: '请输入绘本标题',
					variant: 'destructive',
				})
				return
			}
			setStep('preview')
		}
	}, [step, title, toast])

	/**
	 * 上一步
	 */
	const handleBack = useCallback(() => {
		if (step === 'details') {
			setStep('genre')
		} else if (step === 'preview') {
			setStep('details')
		}
	}, [step])

	/**
	 * 开始生成绘本
	 */
	const handleGenerate = useCallback(async () => {
		setIsGenerating(true)
		setGenerationProgress(0)

		try {
			// 步骤 1: 模拟生成故事文本
			setGenerationStatus('📝 生成故事内容...')
			setGenerationProgress(10)
			await new Promise((resolve) => setTimeout(resolve, 1000))

			// 模拟的故事页面（5 页完整故事）
			const demoPages: StoryPage[] = [
				{
					id: '1',
					pageNumber: 1,
					imageUrl: artworkImages[0] || '',
					text: `从前，在一个美丽的小村庄里，住着一个勇敢的小主人公。「${title}」的故事就这样开始了...`,
				},
				{
					id: '2',
					pageNumber: 2,
					imageUrl: artworkImages[0] || '',
					text: '有一天，小主人公在森林里发现了一道神秘的光芒，那是通往魔法世界的入口。',
				},
				{
					id: '3',
					pageNumber: 3,
					imageUrl: artworkImages[0] || '',
					text: '在魔法世界里，小主人公遇到了一位智慧的老者，学会了勇气和善良的真谛。',
				},
				{
					id: '4',
					pageNumber: 4,
					imageUrl: artworkImages[0] || '',
					text: '经历了重重考验后，小主人公终于找到了回家的路，带着满满的收获和回忆。',
				},
				{
					id: '5',
					pageNumber: 5,
					imageUrl: artworkImages[0] || '',
					text: '从此以后，小主人公成为了村庄里最受尊敬的人，而这段奇妙的冒险故事也被永远传颂着。',
				},
			]

			setGenerationProgress(30)

			// 步骤 2: 生成 TTS 配音（如果启用）
			if (enableTTS) {
				setGenerationStatus('🎙️ 生成语音配音...')
				try {
					// 为每一页生成配音
					for (let i = 0; i < demoPages.length; i++) {
						const ttsResult = await generateSpeech({
							text: demoPages[i].text,
							languageCode: language,
						})
						demoPages[i].audioUrl = ttsResult.audioUrl
						setGenerationProgress(30 + ((i + 1) / demoPages.length) * 30)
					}
				} catch (ttsError) {
					console.warn('TTS 生成失败:', ttsError)
					// TTS 失败不阻止整体流程
				}
			}

			setGenerationProgress(65)

			// 步骤 3: 保存到数据库
			setGenerationStatus('💾 保存绘本数据...')

			const [savedStorybook] = await db
				.insert(schema.storybooks)
				.values({
					title,
					genre: selectedGenre,
					coverUrl: artworkImages[0] || null,
					pages: demoPages,
					language,
				})
				.returning()

			setGenerationProgress(80)

			// 步骤 4: 生成 PDF（可选下载）
			setGenerationStatus('📖 生成 PDF 绘本...')

			const storybook: StorybookData = {
				id: savedStorybook.id,
				title,
				genre: selectedGenre,
				coverUrl: artworkImages[0] || '',
				pages: demoPages,
				language,
				createdAt: savedStorybook.createdAt,
				updatedAt: savedStorybook.updatedAt,
			}

			await downloadStorybookPDF(storybook, undefined, (progress) => {
				setGenerationProgress(80 + progress * 0.2)
			})

			setGenerationProgress(100)
			setGenerationStatus('✨ 完成!')

			toast({
				title: '绘本创建成功! 📚',
				description: 'PDF 已下载，正在跳转到在线阅读器...',
			})

			// 跳转到阅读器页面
			setTimeout(() => {
				handleClose()
				navigate(`/storybook/${savedStorybook.id}`)
			}, 1000)
		} catch (error) {
			console.error('绘本生成失败:', error)
			toast({
				title: '生成失败',
				description: '请稍后重试',
				variant: 'destructive',
			})
		} finally {
			setIsGenerating(false)
			setGenerationProgress(0)
			setGenerationStatus('')
		}
	}, [
		toast,
		handleClose,
		navigate,
		title,
		selectedGenre,
		language,
		artworkImages,
		enableTTS,
	])

	const genreConfig = GENRE_CONFIGS.find((g) => g.id === selectedGenre)

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<BookOpen className="w-5 h-5 text-primary" />
						创作绘本
					</DialogTitle>
					<DialogDescription>
						将您的艺术作品变成一本独特的故事书
					</DialogDescription>
				</DialogHeader>

				{/* 步骤指示器 */}
				<div className="flex items-center justify-center gap-2 py-4">
					{(['genre', 'details', 'preview'] as CreatorStep[]).map((s, i) => (
						<div key={s} className="flex items-center">
							<div
								className={cn(
									'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
									step === s
										? 'bg-primary text-primary-foreground'
										: i < ['genre', 'details', 'preview'].indexOf(step)
										? 'bg-primary/20 text-primary'
										: 'bg-muted text-muted-foreground'
								)}
							>
								{i + 1}
							</div>
							{i < 2 && (
								<div
									className={cn(
										'w-12 h-0.5 mx-1',
										i < ['genre', 'details', 'preview'].indexOf(step)
											? 'bg-primary/50'
											: 'bg-muted'
									)}
								/>
							)}
						</div>
					))}
				</div>

				<AnimatePresence mode="wait">
					{/* 步骤 1: 选择故事类型 */}
					{step === 'genre' && (
						<motion.div
							key="genre"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							className="space-y-4"
						>
							<Label>选择故事类型</Label>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
								{GENRE_CONFIGS.map((genre) => (
									<motion.button
										key={genre.id}
										type="button"
										onClick={() => setSelectedGenre(genre.id)}
										className={cn(
											'relative p-4 rounded-xl border-2 transition-all text-left card-float',
											selectedGenre === genre.id
												? 'border-primary bg-primary/5'
												: 'border-border hover:border-primary/50'
										)}
										whileTap={{ scale: 0.98 }}
									>
										<div className="text-2xl mb-2">{genre.icon}</div>
										<div className="font-medium text-sm">{genre.nameZh}</div>
										<div className="text-xs text-muted-foreground mt-1 line-clamp-2">
											{genre.description}
										</div>
									</motion.button>
								))}
							</div>
						</motion.div>
					)}

					{/* 步骤 2: 填写详情 */}
					{step === 'details' && (
						<motion.div
							key="details"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							className="space-y-6"
						>
							{/* 标题 */}
							<div className="space-y-2">
								<Label htmlFor="storybook-title">绘本标题</Label>
								<Input
									id="storybook-title"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="例如：小星星的冒险之旅"
									maxLength={30}
								/>
							</div>

							{/* 语言选择 */}
							<div className="space-y-2">
								<Label className="flex items-center gap-1.5">
									<Globe className="w-4 h-4" />
									配音语言
								</Label>
								<Select value={language} onValueChange={setLanguage}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{SUPPORTED_LANGUAGES.map((lang) => (
											<SelectItem key={lang.code} value={lang.code}>
												{lang.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* TTS 开关 */}
							<div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
								<div className="flex items-center gap-2">
									<Mic className="w-4 h-4 text-primary" />
									<div>
										<div className="text-sm font-medium">启用语音配音</div>
										<div className="text-xs text-muted-foreground">
											使用 ElevenLabs TTS 生成旁白
										</div>
									</div>
								</div>
								<Switch checked={enableTTS} onCheckedChange={setEnableTTS} />
							</div>

							{/* 选中的类型预览 */}
							{genreConfig && (
								<div className="p-4 rounded-xl bg-muted/30 border border-border/50">
									<div className="flex items-center gap-2 mb-2">
										<span className="text-xl">{genreConfig.icon}</span>
										<span className="font-medium">{genreConfig.nameZh}</span>
									</div>
									<p className="text-sm text-muted-foreground">
										{genreConfig.description}
									</p>
								</div>
							)}
						</motion.div>
					)}

					{/* 步骤 3: 预览确认 */}
					{step === 'preview' && (
						<motion.div
							key="preview"
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							className="space-y-6"
						>
							<div className="text-center py-8">
								<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
									<Sparkles className="w-8 h-8 text-primary" />
								</div>
								<h3 className="text-xl font-bold mb-2">准备创作绘本</h3>
								<p className="text-muted-foreground">
									AI 将为您的故事生成精美插图和文字
								</p>
							</div>

							{/* 摘要信息 */}
							<div className="p-4 rounded-xl bg-card border border-border space-y-3">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">标题</span>
									<span className="font-medium">「{title}」</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">类型</span>
									<span className="font-medium">
										{genreConfig?.icon} {genreConfig?.nameZh}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">语言</span>
									<span className="font-medium">
										{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.name}
									</span>
								</div>
								{artworkImages.length > 0 && (
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">素材图片</span>
										<span className="font-medium">
											{artworkImages.length} 张
										</span>
									</div>
								)}
							</div>

							{/* 生成进度（如果正在生成） */}
							{isGenerating && (
								<div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">
											{generationStatus}
										</span>
										<span className="font-mono text-primary">
											{generationProgress}%
										</span>
									</div>
									<Progress value={generationProgress} className="h-2" />
								</div>
							)}

							{!isGenerating && (
								<div className="text-center text-xs text-muted-foreground">
									✨ 将生成 PDF 绘本并自动下载
								</div>
							)}
						</motion.div>
					)}
				</AnimatePresence>

				{/* 底部操作 */}
				<div className="flex justify-between pt-4 border-t border-border">
					<Button
						variant="ghost"
						onClick={step === 'genre' ? handleClose : handleBack}
					>
						{step === 'genre' ? '取消' : '上一步'}
					</Button>

					{step !== 'preview' ? (
						<Button onClick={handleNext} className="gap-1">
							下一步
							<ChevronRight className="w-4 h-4" />
						</Button>
					) : (
						<Button
							onClick={handleGenerate}
							disabled={isGenerating}
							className="gap-2"
						>
							{isGenerating ? (
								<>
									<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									生成中...
								</>
							) : (
								<>
									<Sparkles className="w-4 h-4" />
									开始创作
								</>
							)}
						</Button>
					)}
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default StorybookCreator
