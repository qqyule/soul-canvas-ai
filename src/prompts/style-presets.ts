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
	// ==================== 新增风格 ====================
	{
		id: 'watercolor',
		name: 'Watercolor Art',
		nameZh: '水彩画风',
		description: 'Translucent, flowing watercolor painting effect',
		prompt:
			'Beautiful watercolor painting, soft transparent washes, delicate paper texture, wet-on-wet technique, gentle color bleeding, artistic composition, fine art watercolor, loose impressionistic style, light and airy atmosphere, delicate brushstrokes, traditional watercolor medium',
		gradient: 'from-sky-300 via-blue-400 to-indigo-500',
		icon: '💧',
		imageUrl: '/styles/watercolor.png',
		category: 'artistic',
	},
	{
		id: 'claymation',
		name: 'Claymation',
		nameZh: '粘土动画',
		description: 'Stop-motion clay animation style',
		prompt:
			'Claymation stop-motion style, Aardman animations aesthetic, plasticine texture, handcrafted clay figurine, fingerprints visible, warm studio lighting, Wallace and Gromit style, tactile 3D model, charming imperfections, playful character design, miniature set design',
		gradient: 'from-orange-300 via-amber-400 to-yellow-500',
		icon: '🎭',
		imageUrl: '/styles/claymation.png',
		category: '3d',
	},
	{
		id: 'pixel-art',
		name: 'Pixel Art',
		nameZh: '像素艺术',
		description: 'Retro 8-bit/16-bit game pixel style',
		prompt:
			'Retro pixel art, 16-bit video game style, limited color palette, clean pixel edges, nostalgic gaming aesthetic, sprite art, dithering technique, NES/SNES era graphics, crisp pixels, indie game art style, detailed pixel work, vibrant retro colors',
		gradient: 'from-green-400 via-lime-500 to-emerald-600',
		icon: '🎮',
		imageUrl: '/styles/pixel-art.png',
		category: 'artistic',
	},
	{
		id: 'anime',
		name: 'Modern Anime',
		nameZh: '现代动漫',
		description: 'Contemporary Japanese anime character style',
		prompt:
			'Modern anime illustration, trending on Pixiv, beautiful anime character, clean lineart, vibrant cel shading, large expressive eyes, dynamic pose, detailed hair rendering, professional anime key visual, light novel cover art style, soft gradient coloring, high quality anime artwork',
		gradient: 'from-pink-400 via-fuchsia-500 to-purple-600',
		icon: '✨',
		imageUrl: '/styles/anime.png',
		category: 'anime',
	},
	{
		id: 'oil-painting',
		name: 'Oil Painting',
		nameZh: '油画大师',
		description: 'Classic oil painting with rich textures',
		prompt:
			'Classical oil painting masterpiece, rich impasto texture, visible brushstrokes, museum quality fine art, dramatic chiaroscuro lighting, Renaissance masters technique, canvas texture, warm color palette, gallery exhibition piece, timeless artistic composition, old masters style',
		gradient: 'from-amber-600 via-orange-700 to-red-800',
		icon: '🖼️',
		imageUrl: '/styles/oil-painting.png',
		category: 'artistic',
	},
	{
		id: 'christmas',
		name: 'Christmas Magic',
		nameZh: '圣诞魔法',
		description: 'Festive holiday theme with magical atmosphere',
		prompt:
			'Magical Christmas scene, festive holiday atmosphere, sparkling snow, warm golden lights, cozy winter wonderland, candy canes and ornaments, enchanted North Pole, twinkling fairy lights, rich red and green colors, heartwarming holiday spirit, whimsical Christmas magic, seasonal celebration',
		gradient: 'from-red-500 via-green-600 to-red-700',
		icon: '🎄',
		imageUrl: '/styles/christmas.png',
		category: 'artistic',
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
