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
	'Transform this hand-drawn sketch into a complete artwork',
	'Preserve the original sketch structure, outlines, shapes, and composition',
	'Use the sketch lines as the foundation and main subject of the image',
	'Maintain the proportions and positioning from the original drawing',
	'Keep the core elements and silhouette of the sketch recognizable',
].join('. ')

/**
 * 融合增强指令
 * 在保留草图的基础上进行艺术化增强
 */
export const ENHANCEMENT_INSTRUCTIONS = [
	'Enhance and refine the sketch with professional quality details',
	'Add appropriate lighting, shadows, and depth while respecting the original forms',
	'Seamlessly blend the artistic style with the user creation',
	'Fill in details naturally based on the sketch context',
].join('. ')

/**
 * 质量提升指令
 */
export const QUALITY_INSTRUCTIONS =
	'High quality, detailed, professional artwork'

// ==================== Prompt 构建函数 ====================

/**
 * 构建最终发送给 AI 的提示词
 * 将草图保留指令、用户自定义内容和风格描述组合在一起
 *
 * @param stylePrompt - 风格描述提示词
 * @param userPrompt - 用户自定义提示词（可选）
 * @returns 完整的提示词字符串
 */
export const buildFinalPrompt = (
	stylePrompt: string,
	userPrompt?: string
): string => {
	// 用户自定义内容 + 风格描述
	const sanitizedUserPrompt = userPrompt?.trim().slice(0, 500)

	const contentAndStyle = sanitizedUserPrompt
		? `User description: ${sanitizedUserPrompt}. Apply style: ${stylePrompt}`
		: `Apply style: ${stylePrompt}`

	// 组合所有指令
	return [
		SKETCH_PRESERVATION_INSTRUCTIONS,
		ENHANCEMENT_INSTRUCTIONS,
		contentAndStyle,
		QUALITY_INSTRUCTIONS,
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
export const buildCompactPrompt = (
	stylePrompt: string,
	userPrompt?: string
): string => {
	const sanitizedUserPrompt = userPrompt?.trim().slice(0, 500)

	const base =
		'Transform sketch into artwork, preserve original structure and shapes'

	if (sanitizedUserPrompt) {
		return `${base}. ${sanitizedUserPrompt}. Style: ${stylePrompt}. High quality, detailed.`
	}

	return `${base}. Style: ${stylePrompt}. High quality, detailed.`
}
