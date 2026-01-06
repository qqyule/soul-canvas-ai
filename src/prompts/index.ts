/**
 * Prompts 模块统一入口
 * 集中导出所有提示词相关的函数和常量
 */

// 风格预设
export {
	getDefaultStyle,
	getStyleById,
	STYLE_PRESETS,
	type StylePreset,
} from './style-presets'
// 系统级提示词模板
export {
	buildCompactPrompt,
	buildFinalPrompt,
	ENHANCEMENT_INSTRUCTIONS,
	QUALITY_INSTRUCTIONS,
	SKETCH_PRESERVATION_INSTRUCTIONS,
} from './system-prompts'
