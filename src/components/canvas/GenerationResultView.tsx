import { AnimatePresence, motion } from 'framer-motion'
import { Download, Loader2, Share2, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { usePublishArtwork } from '@/hooks/use-community'
import { useToast } from '@/hooks/use-toast'
import type { GenerationResult, GenerationStatus } from '@/types/canvas'
import PaintingLoading from './PaintingLoading'

interface GenerationResultViewProps {
	results: GenerationResult[] | null
	status: GenerationStatus
	batchCount?: number
	onClose: () => void
}

const statusMessages: Record<GenerationStatus, string> = {
	idle: '',
	analyzing: '🔍 AI 正在识别您的草图...',
	generating: '🎨 正在生成精美图像...',
	complete: '✨ 生成完成!',
	error: '❌ 生成失败，请重试',
}

const GenerationResultView = ({
	results,
	status,
	batchCount = 1,
	onClose,
}: GenerationResultViewProps) => {
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [publishedIds, setPublishedIds] = useState<Set<number>>(new Set())
	const { toast } = useToast()
	const { publish, isPublishing } = usePublishArtwork()

	// 当结果更新时，重置选中项
	useEffect(() => {
		if (results && results.length > 0) {
			setSelectedIndex(0)
			setPublishedIds(new Set())
		}
	}, [results])

	const activeResult = results ? results[selectedIndex] : null

	/**
	 * 发布当前作品到社区
	 */
	const handlePublish = useCallback(async () => {
		if (!activeResult) return

		const result = await publish({
			resultUrl: activeResult.generatedImageUrl,
			sketchUrl: activeResult.sketchDataUrl,
			styleId: activeResult.style.id,
			styleName: activeResult.style.nameZh,
			prompt: activeResult.prompt,
		})

		if (result) {
			setPublishedIds((prev) => new Set(prev).add(selectedIndex))
		}
	}, [activeResult, publish, selectedIndex])

	const isCurrentPublished = publishedIds.has(selectedIndex)

	const handleDownload = async (targetUrl: string = activeResult?.generatedImageUrl || '') => {
		if (!targetUrl) return

		try {
			const response = await fetch(targetUrl)
			const blob = await response.blob()
			const blobUrl = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = blobUrl
			a.download = `shenbimaliang-${Date.now()}.png`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			URL.revokeObjectURL(blobUrl)
		} catch (error) {
			console.error('Download failed, fallback to direct link:', error)
			const a = document.createElement('a')
			a.href = targetUrl
			a.download = `shenbimaliang-${Date.now()}.png`
			a.target = '_blank'
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
		}
	}

	const handleDownloadAll = async () => {
		if (!results) return
		for (const res of results) {
			await handleDownload(res.generatedImageUrl)
			// 简单延时防止浏览器拦截
			await new Promise((resolve) => setTimeout(resolve, 300))
		}
	}

	return (
		<AnimatePresence mode="wait">
			{(status !== 'idle' || (results && results.length > 0)) && (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95 }}
					transition={{ duration: 0.3 }}
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
				>
					<motion.div
						initial={{ y: 20 }}
						animate={{ y: 0 }}
						className="relative w-full max-w-4xl bg-card rounded-2xl border border-border/50 shadow-2xl flex flex-col max-h-[90dvh] overflow-hidden"
					>
						{/* Header */}
						<div className="flex items-center justify-between p-4 border-b border-border">
							<div className="flex items-center gap-2">
								<Sparkles className="h-5 w-5 text-primary" />
								<span className="font-semibold">马良正在创作</span>
							</div>
							<Button variant="ghost" size="icon-sm" onClick={onClose}>
								<X className="h-4 w-4" />
							</Button>
						</div>

						{/* Content */}
						<div className="p-6 flex-1 overflow-y-auto">
							{status === 'analyzing' || status === 'generating' ? (
								<div className="flex flex-col items-center justify-center py-10 gap-8">
									<PaintingLoading className="scale-125" />

									{/* Progress Steps */}
									<div className="flex items-center gap-4 mt-8 opacity-80 scale-90">
										{['识别中', '构思中', '渲染中'].map((step, i) => (
											<div
												key={step}
												className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
													(status === 'analyzing' && i === 0) || (status === 'generating' && i <= 1)
														? 'text-primary font-medium'
														: 'text-muted-foreground'
												}`}
											>
												<div
													className={`h-2 w-2 rounded-full transition-all duration-300 ${
														(status === 'analyzing' && i === 0) ||
														(status === 'generating' && i <= 1)
															? 'bg-primary scale-125'
															: 'bg-muted'
													}`}
												/>
												{step}
											</div>
										))}
									</div>
								</div>
							) : status === 'complete' && activeResult ? (
								<div className="space-y-6">
									{/* Image Comparison */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{/* Original Sketch */}
										<div className="space-y-2">
											<h4 className="text-sm font-medium text-muted-foreground">您的草图</h4>
											<div className="aspect-[4/3] rounded-xl overflow-hidden bg-canvas-bg border border-border">
												<img
													src={activeResult.sketchDataUrl}
													alt="Original sketch"
													className="w-full h-full object-contain"
												/>
											</div>
										</div>

										{/* Generated Image */}
										<div className="space-y-2">
											<h4 className="text-sm font-medium text-muted-foreground flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Sparkles className="h-4 w-4 text-primary" />
													AI 生成
													{results && results.length > 1 && (
														<span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
															{selectedIndex + 1} / {results.length}
														</span>
													)}
												</div>
												{results && results.length > 1 && (
													<div className="flex gap-1">
														{results.map((_, idx) => (
															<button
																type="button"
																key={idx}
																onClick={() => setSelectedIndex(idx)}
																className={`w-2 h-2 rounded-full transition-all ${
																	idx === selectedIndex
																		? 'bg-primary scale-125'
																		: 'bg-muted hover:bg-primary/50'
																}`}
															/>
														))}
													</div>
												)}
											</h4>
											<motion.div
												key={activeResult.generatedImageUrl}
												initial={{ opacity: 0, scale: 0.95 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ duration: 0.3 }}
												className="aspect-[4/3] rounded-xl overflow-hidden border border-primary/30 shadow-glow relative group"
											>
												<img
													src={activeResult.generatedImageUrl}
													alt="AI 生成的艺术作品"
													className="w-full h-full object-cover"
												/>
												<div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
													<Button
														size="sm"
														variant="secondary"
														className="h-8 text-xs backdrop-blur-md bg-white/10 hover:bg-white/20 text-white border-white/20"
														onClick={() => handleDownload(activeResult.generatedImageUrl)}
													>
														<Download className="h-3 w-3 mr-1.5" />
														下载
													</Button>
												</div>
											</motion.div>
										</div>
									</div>

									{/* Thumbnails Grid (Only if > 1) */}
									{results && results.length > 1 && (
										<div className="space-y-2">
											<h4 className="text-sm font-medium text-muted-foreground">变体预览</h4>
											<div className="grid grid-cols-4 gap-3">
												{results.map((res, idx) => (
													<button
														type="button"
														key={idx}
														onClick={() => setSelectedIndex(idx)}
														className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
															idx === selectedIndex
																? 'border-primary ring-2 ring-primary/20 scale-105 z-10'
																: 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
														}`}
													>
														<img
															src={res.generatedImageUrl}
															alt={`Variant ${idx + 1}`}
															className="w-full h-full object-cover"
														/>
													</button>
												))}
											</div>
										</div>
									)}

									{/* Style & Prompt Info */}
									<div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
										<div className="flex items-center gap-2 text-sm">
											<span className="text-muted-foreground">风格:</span>
											<span className="font-medium text-foreground">
												{activeResult.style.icon} {activeResult.style.nameZh}
											</span>
										</div>
										<div className="text-xs text-muted-foreground font-mono line-clamp-2">
											{activeResult.prompt}
										</div>
									</div>
								</div>
							) : status === 'error' ? (
								<div className="flex flex-col items-center justify-center py-20 gap-4">
									<div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
										<X className="h-8 w-8 text-destructive" />
									</div>
									<p className="text-lg font-medium text-foreground">生成失败</p>
									<p className="text-sm text-muted-foreground">请检查网络连接后重试</p>
									<Button variant="outline" onClick={onClose}>
										返回
									</Button>
								</div>
							) : null}
						</div>

						{/* Footer Actions - Sticky Bottom */}
						{status === 'complete' && activeResult && (
							<div className="p-4 border-t border-border bg-card/95 backdrop-blur-sm sticky bottom-0 z-10 flex items-center justify-between gap-3">
								<Button variant="outline" onClick={onClose}>
									继续创作
								</Button>
								<div className="flex items-center gap-2">
									{/* 发布到社区按钮 */}
									<Button
										variant={isCurrentPublished ? 'outline' : 'default'}
										onClick={handlePublish}
										disabled={isPublishing || isCurrentPublished}
										className="gap-2"
									>
										{isPublishing ? (
											<>
												<Loader2 className="h-4 w-4 animate-spin" />
												发布中...
											</>
										) : isCurrentPublished ? (
											<>
												<Share2 className="h-4 w-4" />
												已发布
											</>
										) : (
											<>
												<Share2 className="h-4 w-4" />
												发布到社区
											</>
										)}
									</Button>
									<Button variant="glow" onClick={() => handleDownload()}>
										<Download className="h-4 w-4 mr-2" />
										下载图像
									</Button>
									{results && results.length > 1 && (
										<Button variant="outline" onClick={handleDownloadAll}>
											<Download className="h-4 w-4 mr-2" />
											下载全部 ({results.length})
										</Button>
									)}
								</div>
							</div>
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export default GenerationResultView
