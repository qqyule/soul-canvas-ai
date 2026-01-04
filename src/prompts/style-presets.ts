/**
 * 风格预设配置
 * 集中管理所有 AI 图像生成的风格选项
 * 每个风格都针对草图融合进行了优化
 */

// ==================== 类型定义 ====================

/**
 * 风格分类
 */
export type StyleCategory = 'all' | 'realistic' | 'anime' | '3d' | 'artistic'

/**
 * 风格预设接口
 */
export interface StylePreset {
	/** 唯一标识符 */
	id: string
	/** 英文名称 */
	name: string
	/** 中文名称 */
	nameZh: string
	/** 英文描述 */
	description: string
	/** 核心提示词 - 针对草图转换优化 */
	prompt: string
	/** 渐变色样式（Tailwind CSS） */
	gradient: string
	/** 图标符号 */
	icon: string
	/** 预览图路径 */
	imageUrl: string
	/** 风格分类 */
	category: StyleCategory
}

// ==================== 风格预设列表 ====================

/**
 * 所有可用的风格预设
 * 每个 prompt 都经过优化以更好地融入用户的简笔画
 */
export const STYLE_PRESETS: StylePreset[] = [
	{
		id: 'logo',
		name: 'Logo Design',
		nameZh: 'Logo 设计',
		description: 'Clean, professional logo with modern aesthetics',
		prompt:
			'Professional minimalist vector logo design, Paul Rand style, golden ratio composition, clean geometric shapes, modern corporate identity, flat design, vector art, high contrast, elegant typography, award-winning logo, scalable vector graphics, abstract interpretation of the subject, negative space mastery',
		gradient: 'from-cyan-400 via-blue-500 to-purple-600',
		icon: '✦',
		imageUrl: '/styles/logo.png',
		category: 'artistic',
	},
	{
		id: 'realistic',
		name: 'Ultra Realistic',
		nameZh: '超写实摄影',
		description: 'Photorealistic imagery with stunning detail',
		prompt:
			'National Geographic photography, 8k resolution, photorealistic masterpiece, cinematic lighting, volumetric atmosphere, highly detailed textures, depth of field, ray tracing, shot on Sony A7R IV, 85mm lens, f/1.8, professional color grading, hyperrealism, intricate details',
		gradient: 'from-amber-400 via-orange-500 to-red-600',
		icon: '◎',
		imageUrl: '/styles/realistic.png',
		category: 'realistic',
	},
	{
		id: 'flat-icon',
		name: 'Flat SVG Icon',
		nameZh: '扁平化图标',
		description: 'Simple, colorful flat design icons',
		prompt:
			'High-quality flat vector icon, Dribbble trending, Material Design 3.0, vibrant color palette, clean vector paths, soft drop shadows, rounded corners, ui/ux design element, illustrator output, perfect geometry, simple and expressive, vector illustration',
		gradient: 'from-green-400 via-emerald-500 to-teal-600',
		icon: '◆',
		imageUrl: '/styles/flat-icon.png',
		category: 'artistic',
	},
	{
		id: 'ghibli',
		name: 'Ghibli Style',
		nameZh: '吉卜力动漫',
		description: 'Magical anime style inspired by Studio Ghibli',
		prompt:
			'Studio Ghibli movie scene, Hayao Miyazaki art style, hand-painted watercolor background, cel shading, whimsical atmosphere, cumulus clouds, lush greenery, magical realism, anime masterpiece, detailed scenery, Spirited Away aesthetic, vibrant and comforting colors, 2D animation style',
		gradient: 'from-pink-400 via-rose-500 to-purple-600',
		icon: '❋',
		imageUrl: '/styles/ghibli.png',
		category: 'anime',
	},
	{
		id: 'cyberpunk',
		name: 'Cyberpunk',
		nameZh: '赛博朋克',
		description: 'Futuristic neon-lit dystopian aesthetic',
		prompt:
			'Futuristic Cyberpunk Cityscape, Blade Runner 2049 aesthetic, neon lights reflecting on rain-slicked streets, high-tech machinery, holographic displays, dystopian atmosphere, cyan and magenta color scheme, cinematic composition, sci-fi concept art, intricate mechanical details, volumetric fog',
		gradient: 'from-violet-400 via-purple-500 to-fuchsia-600',
		icon: '⬡',
		imageUrl: '/styles/cyberpunk.png',
		category: 'artistic',
	},
	{
		id: '3d-render',
		name: '3D Render',
		nameZh: '3D 渲染',
		description: 'Polished 3D rendered objects with perfect lighting',
		prompt:
			'3D cute styling, Pixar animation style, C4D render, Octane render, clay material, soft studio lighting, pastel colors, 3d icon, blind box toy style, smooth edges, high detail, ambient occlusion, best quality, 3d masterpiece, delightful composition',
		gradient: 'from-blue-400 via-indigo-500 to-violet-600',
		icon: '◇',
		imageUrl: '/styles/3d-render.png',
		category: '3d',
	},
]

// ==================== 工具函数 ====================

/**
 * 根据 ID 获取风格预设
 * @param id - 风格 ID
 * @returns 风格预设对象，未找到返回 undefined
 */
export const getStyleById = (id: string): StylePreset | undefined => {
	return STYLE_PRESETS.find((style) => style.id === id)
}

/**
 * 获取默认风格（第一个）
 * @returns 默认风格预设
 */
export const getDefaultStyle = (): StylePreset => {
	return STYLE_PRESETS[0]
}
