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
			'Convert the sketch into a minimalist vector logo design. Use the drawn shape as the logo icon. Clean lines, professional branding, flat design, modern corporate identity, high contrast, scalable vector style, sharp edges based on the original outline',
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
			'Transform the sketch into an ultra realistic photograph. The drawn subject becomes a photorealistic object or scene. 8K resolution, cinematic lighting, professional DSLR quality, hyperrealistic textures, natural shadows and reflections based on the sketch composition',
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
			'Convert the drawn shape into a flat design icon. Transform sketch lines into clean geometric shapes. SVG style, minimal forms, bold vibrant colors, material design inspired, perfect symmetry where applicable, crisp edges following the original outline',
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
			'Animate the sketch in Studio Ghibli style. Transform the drawing into a whimsical anime scene. Hayao Miyazaki inspired, soft watercolor textures, dreamy magical atmosphere, hand-drawn animation quality, the sketch subject becomes a charming Ghibli character or element',
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
			'Incorporate the sketch into a cyberpunk scene. The drawn subject becomes a neon-lit futuristic element. Vibrant neon colors (pink, cyan, purple), holographic effects, rain-slicked surfaces reflecting the sketch shape, Blade Runner inspired, high tech dystopian atmosphere',
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
			'Render the sketch as a 3D object. Transform the drawing into a polished 3D model. Octane render quality, glossy materials, professional studio lighting, soft shadows, the sketch shape becomes a tangible 3D form with realistic materials and depth',
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
