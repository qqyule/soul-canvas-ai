import { motion } from 'framer-motion'
import { Eraser, Pencil, Redo2, Trash2, Undo2 } from 'lucide-react'
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import type { CanvasPath } from 'react-sketch-canvas'
import { ReactSketchCanvas, type ReactSketchCanvasRef } from 'react-sketch-canvas'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { MotionButton } from '@/components/ui/motion-button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { CanvasTool } from '@/types/canvas'
import PaintingLoading from './PaintingLoading'
import RandomInspirationButton from './RandomInspirationButton'

/**
 * SketchCanvas 暴露的方法接口
 */
export interface SketchCanvasRef {
	loadPaths: (paths: CanvasPath[]) => void
	clearCanvas: () => void
	exportImage: (type: 'png' | 'jpeg') => Promise<string>
}

interface SketchCanvasProps {
	onExport: (dataUrl: string) => void
	isGenerating: boolean
	/** 画布数据变化回调（用于自动保存） */
	onCanvasChange?: (canvasData: string) => void
	/** 随机灵感按钮点击回调 */
	onInspirationClick?: () => void
}

const SketchCanvas = forwardRef<SketchCanvasRef, SketchCanvasProps>(
	({ onExport, isGenerating, onCanvasChange, onInspirationClick }, ref) => {
		const canvasRef = useRef<ReactSketchCanvasRef>(null)
		const [currentTool, setCurrentTool] = useState<CanvasTool>('pen')
		const [strokeWidth, setStrokeWidth] = useState(4)
		const [hasDrawn, setHasDrawn] = useState(false)

		// 暴露方法给父组件
		useImperativeHandle(
			ref,
			() => ({
				loadPaths: (paths: CanvasPath[]) => {
					canvasRef.current?.loadPaths(paths)
					setHasDrawn(paths.length > 0)
				},
				clearCanvas: () => {
					canvasRef.current?.clearCanvas()
					setHasDrawn(false)
				},
				exportImage: (type: 'png' | 'jpeg') => {
					return canvasRef.current?.exportImage(type) ?? Promise.resolve('')
				},
			}),
			[]
		)

		const handleClear = useCallback(() => {
			canvasRef.current?.clearCanvas()
			// onChange handles state update
		}, [])

		const handleUndo = useCallback(() => {
			canvasRef.current?.undo()
		}, [])

		const handleRedo = useCallback(() => {
			canvasRef.current?.redo()
		}, [])

		const handleExport = useCallback(async () => {
			if (!hasDrawn) {
				toast.error('画布为空，请先绘制草图', {
					description: 'AI 需要一些线条作为灵感来源！',
				})
				return
			}

			if (canvasRef.current) {
				const dataUrl = await canvasRef.current.exportImage('png')
				onExport(dataUrl)
			}
		}, [onExport, hasDrawn])

		const tools = [
			{ id: 'pen' as const, icon: Pencil, label: '画笔 (Pen)' },
			{ id: 'eraser' as const, icon: Eraser, label: '橡皮擦 (Eraser)' },
		]

		const actions = [
			{ id: 'undo', icon: Undo2, label: '撤销 (Undo)', onClick: handleUndo },
			{ id: 'redo', icon: Redo2, label: '重做 (Redo)', onClick: handleRedo },
			{
				id: 'clear',
				icon: Trash2,
				label: '清空 (Clear)',
				onClick: handleClear,
			},
		]

		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="relative flex flex-col gap-4"
			>
				{/* Toolbar */}
				<div className="flex items-center justify-between gap-4">
					{/* Drawing Tools */}
					<div className="flex items-center gap-2 rounded-xl bg-card/50 p-2 backdrop-blur-sm border border-border/50">
						{tools.map((tool) => (
							<Tooltip key={tool.id}>
								<TooltipTrigger asChild>
									<Button
										variant={currentTool === tool.id ? 'default' : 'icon'}
										size="icon"
										onClick={() => {
											setCurrentTool(tool.id)
											canvasRef.current?.eraseMode(tool.id === 'eraser')
										}}
										className={cn('transition-all', currentTool === tool.id && 'shadow-glow-sm')}
									>
										<tool.icon className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>{tool.label}</TooltipContent>
							</Tooltip>
						))}

						<div className="h-6 w-px bg-border/50 mx-1" />

						{/* Stroke Width */}
						<div className="flex items-center gap-2 px-2">
							{[2, 4, 8].map((width) => (
								<button
									type="button"
									key={width}
									onClick={() => setStrokeWidth(width)}
									className={cn(
										'rounded-full bg-foreground transition-all',
										strokeWidth === width
											? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
											: 'opacity-50 hover:opacity-80'
									)}
									style={{ width: width + 8, height: width + 8 }}
								/>
							))}
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center gap-2 rounded-xl bg-card/50 p-2 backdrop-blur-sm border border-border/50">
						{actions.map((action) => (
							<Tooltip key={action.id}>
								<TooltipTrigger asChild>
									<Button variant="icon" size="icon" onClick={action.onClick}>
										<action.icon className="h-4 w-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent>{action.label}</TooltipContent>
							</Tooltip>
						))}
					</div>
				</div>

				{/* Canvas */}
				<div className={cn('canvas-container overflow-hidden relative', isGenerating && 'shimmer')}>
					{/* 随机灵感按钮 (悬浮右上角) */}
					{onInspirationClick && (
						<div className="absolute top-4 right-4 z-10">
							<RandomInspirationButton
								onClick={onInspirationClick}
								disabled={isGenerating}
								className="bg-transparent border-black/5 text-muted-foreground/60 hover:text-primary hover:border-primary/20 hover:bg-primary/5 shadow-none"
							/>
						</div>
					)}

					<ReactSketchCanvas
						ref={canvasRef}
						width="100%"
						height="400px"
						strokeWidth={strokeWidth}
						strokeColor="#1a1a2e"
						canvasColor="#ffffff"
						onChange={(paths) => {
							setHasDrawn(paths.length > 0)
							// 触发自动保存回调
							if (onCanvasChange && paths.length > 0) {
								onCanvasChange(JSON.stringify(paths))
							}
						}}
						style={{
							borderRadius: 'var(--radius)',
						}}
					/>

					{/* Generating Overlay */}
					{isGenerating && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center rounded-lg"
						>
							<PaintingLoading />
						</motion.div>
					)}
				</div>

				{/* Export Button */}
				{/* Export Button */}
				<div className="fixed bottom-6 left-6 right-6 z-30 md:static md:w-full">
					<MotionButton
						variant="glow"
						size="xl"
						onClick={handleExport}
						disabled={isGenerating}
						className="w-full shadow-lg md:shadow-none backdrop-blur-sm"
						id="tour-generate"
					>
						{isGenerating ? (
							<>
								<div className="h-5 w-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
								AI 正在创作...
							</>
						) : (
							<>
								<span className="text-lg">✨</span>
								生成图像 (Generate)
							</>
						)}
					</MotionButton>
				</div>
			</motion.div>
		)
	}
)

SketchCanvas.displayName = 'SketchCanvas'

export default SketchCanvas
