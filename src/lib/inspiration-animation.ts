import type { RefObject } from 'react'
import type { CanvasPath } from 'react-sketch-canvas'

/**
 * 画布 Ref 接口（与 SketchCanvas 暴露的方法一致）
 */
export interface SketchCanvasRef {
	loadPaths: (paths: CanvasPath[]) => void
	clearCanvas: () => void
	exportImage: (type: 'png' | 'jpeg') => Promise<string>
}

/**
 * 延迟函数
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 渐进式绘制动画
 * 将路径数组分批加载到画布，模拟逐笔绘制效果
 */
export async function animatePathsDrawing(
	canvasRef: RefObject<SketchCanvasRef>,
	paths: CanvasPath[],
	totalDuration: number
): Promise<void> {
	if (!canvasRef.current || paths.length === 0) return

	// 逐个绘制路径
	const delayPerPath = totalDuration / paths.length
	const accumulatedPaths: CanvasPath[] = []

	for (const path of paths) {
		accumulatedPaths.push(path)
		canvasRef.current.loadPaths([...accumulatedPaths])
		await sleep(delayPerPath)
	}
}
