/**
 * 从 prompts 模块重新导出类型和预设
 * 保持向后兼容性
 */
export type { StylePreset } from '@/prompts'
export { STYLE_PRESETS } from '@/prompts'

export type CanvasTool = 'pen' | 'eraser'

export interface GenerationResult {
	id: string
	sketchDataUrl: string
	generatedImageUrl: string
	prompt: string
	style: StylePreset
	createdAt: Date
}

export type GenerationStatus = 'idle' | 'analyzing' | 'generating' | 'complete' | 'error'
