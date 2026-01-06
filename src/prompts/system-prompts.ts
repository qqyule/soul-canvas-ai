/**
 * 系统级提示词模板
 * 用于构建发送给 AI 的核心提示词
 * 重点：保留草图结构，让用户的简笔画融入生成的画作中
 */

// ==================== 核心指令常量 ====================

/**
 * 草图保留核心指令
 * 确保用户的手绘草图作为生成图像的基础和主体
 */
export const SKETCH_PRESERVATION_INSTRUCTIONS = [
	'Use the provided sketch as a composition reference and structural guide',
	'Interpret the shapes and forms creatively rather than strictly tracing lines',
	'Transform the hand-drawn elements into fully rendered, professional objects',
	'Maintain the overall composition and placement of elements',
	'Do not show the original sketch lines or strokes in the final output',
	'Ensure the final result looks like a finished artwork, not a colored sketch',
].join('. ')

/**
 * 融合增强指令
 * 在保留草图的基础上进行艺术化增强
 */
export const ENHANCEMENT_INSTRUCTIONS = [
	'Refine details to professional artistic standards',
	'Apply sophisticated lighting, volumetric shadows, and rich textures',
	'Ensure stylistic consistency across the entire image',
	'Enhance depth and dimensionality',
	'Make even simple shapes look intentional and artistic',
].join('. ')

/**
 * 质量提升指令
 */
export const QUALITY_INSTRUCTIONS =
	'Masterpiece, best quality, highly detailed, trending on ArtStation, award-winning, 8k resolution, unreal engine 5 render, cinematic lighting, sharp focus'

/**
 * 负面提示词
 * 避免生成低质量或错误的图像
 */
export const NEGATIVE_INSTRUCTIONS =
	'low quality, bad anatomy, worst quality, text, watermark, signature, ugly, bad proportions, deformed, disconnected limbs, blurry, out of focus, sketch lines, pencil strokes, grid lines, monochrome, simple background, flat'

// ==================== Prompt 构建函数 ====================

/**
 * 构建最终发送给 AI 的提示词
 * 将草图保留指令、用户自定义内容和风格描述组合在一起
 *
 * @param stylePrompt - 风格描述提示词
 * @param userPrompt - 用户自定义提示词（可选）
 * @returns 完整的提示词字符串
 */
export const buildFinalPrompt = (stylePrompt: string, userPrompt?: string): string => {
	const sanitizedUserPrompt = userPrompt?.trim().slice(0, 500)

	// 优先展示风格描述，将用户输入作为补充细节
	const contentAndStyle = sanitizedUserPrompt
		? `${stylePrompt}. Subject description: ${sanitizedUserPrompt}`
		: stylePrompt

	// 组合所有指令
	// 注意：对于某些模型，负面提示词最好放在 explicit 字段，但通用 prompt engineering 中
	// 往往通过 "Negative prompt: ..." 也能生效，或者直接描述 "Do not include..."
	// 这里通过自然语言强化 "Do not..." 指令
	return [
		SKETCH_PRESERVATION_INSTRUCTIONS,
		contentAndStyle,
		ENHANCEMENT_INSTRUCTIONS,
		QUALITY_INSTRUCTIONS,
		`Exclude: ${NEGATIVE_INSTRUCTIONS}`,
	].join('. ')
}

/**
 * 为特定场景构建简化版提示词
 * 适用于需要更短 prompt 的场景
 *
 * @param stylePrompt - 风格描述
 * @param userPrompt - 用户描述（可选）
 * @returns 简化版提示词
 */
export const buildCompactPrompt = (stylePrompt: string, userPrompt?: string): string => {
	const sanitizedUserPrompt = userPrompt?.trim().slice(0, 500)

	const base = 'Transform sketch into artwork, preserve original structure and shapes'

	if (sanitizedUserPrompt) {
		return `${base}. ${sanitizedUserPrompt}. Style: ${stylePrompt}. High quality, detailed.`
	}

	return `${base}. Style: ${stylePrompt}. High quality, detailed.`
}
