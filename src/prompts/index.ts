/**
 * Prompts 模块统一入口
 * 集中导出所有提示词相关的函数和常量
 */

// 系统级提示词模板
export {
	SKETCH_PRESERVATION_INSTRUCTIONS,
	ENHANCEMENT_INSTRUCTIONS,
	QUALITY_INSTRUCTIONS,
	buildFinalPrompt,
	buildCompactPrompt,
} from './system-prompts'

// 风格预设
export {
	STYLE_PRESETS,
	getStyleById,
	getDefaultStyle,
	type StylePreset,
} from './style-presets'
