import { useRef, useState, useCallback } from 'react'
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas'
import { motion } from 'framer-motion'
import { Pencil, Eraser, Undo2, Redo2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { CanvasTool } from '@/types/canvas'

interface SketchCanvasProps {
	onExport: (dataUrl: string) => void
	isGenerating: boolean
}

const SketchCanvas = ({ onExport, isGenerating }: SketchCanvasProps) => {
	const canvasRef = useRef<ReactSketchCanvasRef>(null)
	const [currentTool, setCurrentTool] = useState<CanvasTool>('pen')
	const [strokeWidth, setStrokeWidth] = useState(4)
	const [hasDrawn, setHasDrawn] = useState(false)

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
		{ id: 'clear', icon: Trash2, label: '清空 (Clear)', onClick: handleClear },
	]

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
			className="relative flex flex-col gap-4 pb-20 md:pb-0"
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
									className={cn(
										'transition-all',
										currentTool === tool.id && 'shadow-glow-sm'
									)}
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
			<div
				className={cn(
					'canvas-container overflow-hidden relative',
					isGenerating && 'shimmer'
				)}
			>
				<ReactSketchCanvas
					ref={canvasRef}
					width="100%"
					height="400px"
					strokeWidth={strokeWidth}
					strokeColor="#1a1a2e"
					canvasColor="#ffffff"
					onChange={(paths) => setHasDrawn(paths.length > 0)}
					style={{
						borderRadius: 'var(--radius)',
					}}
				/>

				{/* Generating Overlay */}
				{isGenerating && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg"
					>
						<div className="flex flex-col items-center gap-3">
							<div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
							<span className="text-sm text-muted-foreground">处理中...</span>
						</div>
					</motion.div>
				)}
			</div>

			{/* Export Button */}
			<motion.div
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				className="fixed bottom-6 left-6 right-6 z-30 md:static md:w-full"
			>
				<Button
					variant="glow"
					size="xl"
					onClick={handleExport}
					disabled={isGenerating}
					className="w-full shadow-lg md:shadow-none backdrop-blur-sm"
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
				</Button>
			</motion.div>
		</motion.div>
	)
}

export default SketchCanvas
