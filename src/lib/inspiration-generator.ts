import type { CanvasPath } from 'react-sketch-canvas'

/**
 * 灵感类型分类
 */
export type InspirationCategory = 'geometric' | 'organic' | 'sketch' | 'pattern'

/**
 * 复杂度等级
 */
export type InspirationComplexity = 'simple' | 'medium' | 'complex'

/**
 * 灵感生成配置
 */
export interface InspirationConfig {
	category: InspirationCategory
	complexity: InspirationComplexity
	canvasWidth: number
	canvasHeight: number
}

/**
 * 灵感生成结果
 */
export interface InspirationResult {
	paths: CanvasPath[]
	suggestedPrompts: string[]
	animationDuration: number
}

/**
 * 提示词建议映射表
 */
const PROMPT_SUGGESTIONS: Record<InspirationCategory, string[]> = {
	geometric: [
		'未来城市的赛博朋克蓝图',
		'悬浮在虚空中的晶体几何岛屿',
		'多维空间的数学结构可视化',
		'极简主义的包豪斯建筑立面',
		'霓虹光线构成的数字迷宫',
		'量子纠缠的抽象几何表达',
		'低多边形风格的山川与河流',
		'精密机械手表的内部齿轮构造',
		'宇宙空间站的结构剖面图',
		'神经网络节点的复杂连接艺术',
		'错视艺术风格的无尽阶梯',
		'甚至可能是一个四维超立方体',
		'漂浮的反重力几何装置',
		'棱镜折射出的七彩光束',
		'古代神庙的几何平面图',
	],
	organic: [
		'晨雾缭绕的魔法森林深处',
		'深海中发光的生物荧光水母',
		'外星星球上的奇异植物生态',
		'显微镜下绚丽的细胞分裂',
		'如丝绸般流动的极光夜空',
		'废墟上顽强生长的藤蔓与花朵',
		'巨大的生命之树与能量脉络',
		'云端之上遨游的幻想生物',
		'微观视角下的蝴蝶翅膀纹理',
		'沙漠中海市蜃楼般的绿洲',
		'随风摇曳的水底珊瑚礁',
		'火山喷发时的壮丽岩浆流动',
		'雨后挂着露珠的蜘蛛网',
		'正在破茧而出的新生蝴蝶',
		'由水滴汇聚成的海洋之心',
	],
	sketch: [
		'午后咖啡馆角落的慵懒速写',
		'戴着复古飞行员眼镜的猫咪',
		'正在演奏小提琴的街头艺人',
		'充满故事的旧皮箱和旅行地图',
		'雨中撑伞行走的孤独背影',
		'童话书中的蒸汽朋克飞船',
		'窗台上沐浴阳光的盆栽植物',
		'正在奔跑的野马轮廓',
		'凌乱但充满灵感的画家书桌',
		'老式胶片相机与散落的照片',
		'海边灯塔与飞翔的海鸥',
		'森林中若隐若现的小鹿',
		'骑着自行车的追风少年',
		'复杂的机械甲虫设计草图',
		'漂浮在空中的热气球嘉年华',
	],
	pattern: [
		'复古艺术装饰(Art Deco)风格壁纸',
		'繁复精美的波斯地毯花纹',
		'象征永恒的凯尔特绳结图腾',
		'80年代孟菲斯(Memphis)设计与其跳跃色彩',
		'日式青海波(Seigaiha)传统纹样',
		'极具迷幻色彩的佩斯利(Paisley)旋涡',
		'哥特式教堂的彩色玻璃窗花',
		'现代主义的极简网格与色彩块',
		'玛雅文明的古老石刻符号',
		'电子电路板的精密布线纹理',
		'印象派风格的点彩画笔触',
		'编织细密的藤条与竹纹',
		'满天繁星构成的抽象星座图',
		'流体画般的油墨扩散纹理',
		'数学分形生成的无限重复图案',
	],
}

/**
 * 根据复杂度获取基础参数
 */
function getComplexityParams(complexity: InspirationComplexity) {
	switch (complexity) {
		case 'simple':
			return { density: 0.3, iterations: 3, pointCount: 20 }
		case 'medium':
			return { density: 0.6, iterations: 6, pointCount: 40 }
		case 'complex':
			return { density: 1.0, iterations: 10, pointCount: 80 }
	}
}

/**
 * 创建单个路径
 */
function createPath(
	points: { x: number; y: number }[],
	strokeColor: string = '#1a1a2e',
	strokeWidth: number = 2
): CanvasPath {
	return {
		paths: points,
		strokeWidth,
		strokeColor,
		drawMode: true,
	}
}

/**
 * 生成同心圆
 */
function generateConcentricCircles(
	centerX: number,
	centerY: number,
	complexity: InspirationComplexity,
	canvasWidth: number,
	canvasHeight: number
): CanvasPath[] {
	const params = getComplexityParams(complexity)
	const paths: CanvasPath[] = []
	const maxRadius = Math.min(canvasWidth, canvasHeight) * 0.35
	const circleCount = params.iterations

	for (let i = 0; i < circleCount; i++) {
		const radius = (maxRadius / circleCount) * (i + 1)
		const points: { x: number; y: number }[] = []
		const segments = Math.max(32, params.pointCount)

		for (let angle = 0; angle <= Math.PI * 2; angle += (Math.PI * 2) / segments) {
			points.push({
				x: centerX + Math.cos(angle) * radius,
				y: centerY + Math.sin(angle) * radius,
			})
		}

		paths.push(createPath(points))
	}

	return paths
}

/**
 * 生成六边形蜂巢
 */
function generateHoneycomb(
	startX: number,
	startY: number,
	complexity: InspirationComplexity,
	canvasWidth: number,
	canvasHeight: number
): CanvasPath[] {
	const params = getComplexityParams(complexity)
	const paths: CanvasPath[] = []
	const size = Math.min(canvasWidth, canvasHeight) * 0.08
	const rows = Math.floor(params.iterations / 2) + 1
	const cols = params.iterations

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const offsetX = col * size * 1.5
			const offsetY = row * size * Math.sqrt(3) + (col % 2) * (size * Math.sqrt(3) * 0.5)
			const points: { x: number; y: number }[] = []

			for (let i = 0; i <= 6; i++) {
				const angle = (Math.PI / 3) * i
				points.push({
					x: startX + offsetX + Math.cos(angle) * size,
					y: startY + offsetY + Math.sin(angle) * size,
				})
			}

			paths.push(createPath(points))
		}
	}

	return paths
}

/**
 * 生成螺旋线
 */
function generateSpiral(
	centerX: number,
	centerY: number,
	complexity: InspirationComplexity,
	canvasWidth: number,
	canvasHeight: number
): CanvasPath[] {
	const params = getComplexityParams(complexity)
	const points: { x: number; y: number }[] = []
	const maxRadius = Math.min(canvasWidth, canvasHeight) * 0.35
	const turns = params.iterations
	const segmentsPerTurn = params.pointCount

	for (let i = 0; i <= turns * segmentsPerTurn; i++) {
		const angle = (i / segmentsPerTurn) * Math.PI * 2
		const radius = (i / (turns * segmentsPerTurn)) * maxRadius
		points.push({
			x: centerX + Math.cos(angle) * radius,
			y: centerY + Math.sin(angle) * radius,
		})
	}

	return [createPath(points)]
}

/**
 * 生成波浪线
 */
function generateWaves(
	startY: number,
	complexity: InspirationComplexity,
	canvasWidth: number,
	canvasHeight: number
): CanvasPath[] {
	const params = getComplexityParams(complexity)
	const paths: CanvasPath[] = []
	const waveCount = params.iterations
	const amplitude = canvasHeight * 0.1
	const frequency = params.density * 4

	for (let w = 0; w < waveCount; w++) {
		const points: { x: number; y: number }[] = []
		const yOffset = startY + (w * canvasHeight) / (waveCount + 1)
		const segments = params.pointCount * 2

		for (let i = 0; i <= segments; i++) {
			const x = (i / segments) * canvasWidth
			const y = yOffset + Math.sin((i / segments) * Math.PI * 2 * frequency + w) * amplitude
			points.push({ x, y })
		}

		paths.push(createPath(points))
	}

	return paths
}

/**
 * 生成树枝分形
 */
function generateTree(
	startX: number,
	startY: number,
	complexity: InspirationComplexity,
	canvasWidth: number,
	canvasHeight: number
): CanvasPath[] {
	const params = getComplexityParams(complexity)
	const paths: CanvasPath[] = []
	const maxDepth = Math.min(params.iterations, 6)

	function branch(x: number, y: number, angle: number, length: number, depth: number) {
		if (depth === 0) return

		const endX = x + Math.cos(angle) * length
		const endY = y + Math.sin(angle) * length

		paths.push(
			createPath([
				{ x, y },
				{ x: endX, y: endY },
			])
		)

		const newLength = length * 0.7
		const angleOffset = Math.PI / 6

		branch(endX, endY, angle - angleOffset, newLength, depth - 1)
		branch(endX, endY, angle + angleOffset, newLength, depth - 1)
	}

	const trunkLength = canvasHeight * 0.25
	branch(startX, startY, -Math.PI / 2, trunkLength, maxDepth)

	return paths
}

/**
 * 生成简笔画猫咪
 */
function generateSimpleCat(centerX: number, centerY: number, scale: number): CanvasPath[] {
	const paths: CanvasPath[] = []

	// 头部（圆形）
	const headRadius = 40 * scale
	const headPoints: { x: number; y: number }[] = []
	for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
		headPoints.push({
			x: centerX + Math.cos(angle) * headRadius,
			y: centerY + Math.sin(angle) * headRadius,
		})
	}
	paths.push(createPath(headPoints))

	// 左耳
	paths.push(
		createPath([
			{ x: centerX - 25 * scale, y: centerY - 35 * scale },
			{ x: centerX - 35 * scale, y: centerY - 60 * scale },
			{ x: centerX - 15 * scale, y: centerY - 40 * scale },
		])
	)

	// 右耳
	paths.push(
		createPath([
			{ x: centerX + 25 * scale, y: centerY - 35 * scale },
			{ x: centerX + 35 * scale, y: centerY - 60 * scale },
			{ x: centerX + 15 * scale, y: centerY - 40 * scale },
		])
	)

	// 眼睛（两个小点）
	paths.push(
		createPath(
			[
				{ x: centerX - 15 * scale, y: centerY - 5 * scale },
				{ x: centerX - 15 * scale, y: centerY - 5 * scale },
			],
			'#1a1a2e',
			4
		)
	)
	paths.push(
		createPath(
			[
				{ x: centerX + 15 * scale, y: centerY - 5 * scale },
				{ x: centerX + 15 * scale, y: centerY - 5 * scale },
			],
			'#1a1a2e',
			4
		)
	)

	// 鼻子和嘴巴
	paths.push(
		createPath([
			{ x: centerX, y: centerY + 5 * scale },
			{ x: centerX - 10 * scale, y: centerY + 15 * scale },
		])
	)
	paths.push(
		createPath([
			{ x: centerX, y: centerY + 5 * scale },
			{ x: centerX + 10 * scale, y: centerY + 15 * scale },
		])
	)

	return paths
}

/**
 * 生成简笔画小鸟
 */
function generateSimpleBird(centerX: number, centerY: number, scale: number): CanvasPath[] {
	const paths: CanvasPath[] = []

	// 身体（椭圆）
	const bodyPoints: { x: number; y: number }[] = []
	for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
		bodyPoints.push({
			x: centerX + Math.cos(angle) * 50 * scale,
			y: centerY + Math.sin(angle) * 30 * scale,
		})
	}
	paths.push(createPath(bodyPoints))

	// 头部（小圆）
	const headPoints: { x: number; y: number }[] = []
	const headCenterX = centerX + 40 * scale
	const headCenterY = centerY - 20 * scale
	for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
		headPoints.push({
			x: headCenterX + Math.cos(angle) * 20 * scale,
			y: headCenterY + Math.sin(angle) * 20 * scale,
		})
	}
	paths.push(createPath(headPoints))

	// 嘴巴
	paths.push(
		createPath([
			{ x: headCenterX + 20 * scale, y: headCenterY },
			{ x: headCenterX + 35 * scale, y: headCenterY },
		])
	)

	// 眼睛
	paths.push(
		createPath(
			[
				{ x: headCenterX + 5 * scale, y: headCenterY - 5 * scale },
				{ x: headCenterX + 5 * scale, y: headCenterY - 5 * scale },
			],
			'#1a1a2e',
			3
		)
	)

	// 翅膀
	paths.push(
		createPath([
			{ x: centerX - 20 * scale, y: centerY },
			{ x: centerX - 60 * scale, y: centerY - 30 * scale },
			{ x: centerX - 40 * scale, y: centerY },
		])
	)

	// 尾巴
	paths.push(
		createPath([
			{ x: centerX - 50 * scale, y: centerY },
			{ x: centerX - 80 * scale, y: centerY + 20 * scale },
		])
	)

	return paths
}

/**
 * 生成简笔画兔子
 */
function generateSimpleRabbit(centerX: number, centerY: number, scale: number): CanvasPath[] {
	const paths: CanvasPath[] = []

	// 身体 (椭圆)
	const bodyPoints: { x: number; y: number }[] = []
	for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
		bodyPoints.push({
			x: centerX + Math.cos(angle) * 35 * scale,
			y: centerY + 20 * scale + Math.sin(angle) * 25 * scale,
		})
	}
	paths.push(createPath(bodyPoints))

	// 头部 (圆形)
	const headPoints: { x: number; y: number }[] = []
	for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
		headPoints.push({
			x: centerX + Math.cos(angle) * 22 * scale,
			y: centerY - 15 * scale + Math.sin(angle) * 22 * scale,
		})
	}
	paths.push(createPath(headPoints))

	// 耳朵 (长椭圆)
	const leftEar: { x: number; y: number }[] = []
	for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
		leftEar.push({
			x: centerX - 10 * scale + Math.cos(angle) * 8 * scale,
			y: centerY - 50 * scale + Math.sin(angle) * 25 * scale,
		})
	}
	paths.push(createPath(leftEar))

	const rightEar: { x: number; y: number }[] = []
	for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
		rightEar.push({
			x: centerX + 10 * scale + Math.cos(angle) * 8 * scale,
			y: centerY - 50 * scale + Math.sin(angle) * 25 * scale,
		})
	}
	paths.push(createPath(rightEar))

	// 眼睛
	paths.push(
		createPath(
			[
				{ x: centerX - 8 * scale, y: centerY - 20 * scale },
				{ x: centerX - 8 * scale, y: centerY - 20 * scale },
			],
			'#1a1a2e',
			3
		)
	)
	paths.push(
		createPath(
			[
				{ x: centerX + 8 * scale, y: centerY - 20 * scale },
				{ x: centerX + 8 * scale, y: centerY - 20 * scale },
			],
			'#1a1a2e',
			3
		)
	)

	// 尾巴
	const tailPoints: { x: number; y: number }[] = []
	for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
		tailPoints.push({
			x: centerX + 35 * scale + Math.cos(angle) * 8 * scale,
			y: centerY + 25 * scale + Math.sin(angle) * 8 * scale,
		})
	}
	paths.push(createPath(tailPoints))

	return paths
}

/**
 * 生成简笔画鱼
 */
function generateSimpleFish(centerX: number, centerY: number, scale: number): CanvasPath[] {
	const paths: CanvasPath[] = []

	// 身体
	const bodyPoints: { x: number; y: number }[] = []
	for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
		bodyPoints.push({
			x: centerX + Math.cos(angle) * 45 * scale,
			y: centerY + Math.sin(angle) * 25 * scale,
		})
	}
	paths.push(createPath(bodyPoints))

	// 尾巴 (三角形)
	paths.push(
		createPath([
			{ x: centerX - 42 * scale, y: centerY },
			{ x: centerX - 65 * scale, y: centerY - 15 * scale },
			{ x: centerX - 65 * scale, y: centerY + 15 * scale },
			{ x: centerX - 42 * scale, y: centerY },
		])
	)

	// 眼睛
	paths.push(
		createPath(
			[
				{ x: centerX + 25 * scale, y: centerY - 5 * scale },
				{ x: centerX + 25 * scale, y: centerY - 5 * scale },
			],
			'#1a1a2e',
			4
		)
	)

	// 鱼鳍
	paths.push(
		createPath([
			{ x: centerX, y: centerY - 25 * scale },
			{ x: centerX - 10 * scale, y: centerY - 35 * scale },
			{ x: centerX + 10 * scale, y: centerY - 25 * scale },
		])
	)

	return paths
}

/**
 * 生成简笔画花朵
 */
function generateSimpleFlower(centerX: number, centerY: number, scale: number): CanvasPath[] {
	const paths: CanvasPath[] = []
	const petalCount = 5
	const petalDistance = 20 * scale

	// 花瓣
	for (let i = 0; i < petalCount; i++) {
		const angle = ((Math.PI * 2) / petalCount) * i
		const cx = centerX + Math.cos(angle) * petalDistance
		const cy = centerY - 30 * scale + Math.sin(angle) * petalDistance

		const pts: { x: number; y: number }[] = []
		for (let a = 0; a <= Math.PI * 2; a += 0.2) {
			pts.push({
				x: cx + Math.cos(a) * 15 * scale,
				y: cy + Math.sin(a) * 15 * scale,
			})
		}
		paths.push(createPath(pts))
	}

	// 花心
	const centerPts: { x: number; y: number }[] = []
	for (let a = 0; a <= Math.PI * 2; a += 0.2) {
		centerPts.push({
			x: centerX + Math.cos(a) * 10 * scale,
			y: centerY - 30 * scale + Math.sin(a) * 10 * scale,
		})
	}
	paths.push(createPath(centerPts))

	// 茎
	paths.push(
		createPath([
			{ x: centerX, y: centerY - 20 * scale },
			{ x: centerX, y: centerY + 60 * scale },
		])
	)

	// 叶子
	const leafStart = { x: centerX, y: centerY + 20 * scale }
	paths.push(
		createPath([
			leafStart,
			{ x: leafStart.x + 20 * scale, y: leafStart.y - 10 * scale },
			{ x: leafStart.x + 35 * scale, y: leafStart.y },
			{ x: leafStart.x + 20 * scale, y: leafStart.y + 10 * scale },
			leafStart,
		])
	)

	return paths
}

/**
 * 生成几何类型灵感
 */
function generateGeometric(config: InspirationConfig): CanvasPath[] {
	const { complexity, canvasWidth, canvasHeight } = config
	const centerX = canvasWidth / 2
	const centerY = canvasHeight / 2

	const generators = [
		() => generateConcentricCircles(centerX, centerY, complexity, canvasWidth, canvasHeight),
		() =>
			generateHoneycomb(
				canvasWidth * 0.2,
				canvasHeight * 0.2,
				complexity,
				canvasWidth,
				canvasHeight
			),
		() => generateSpiral(centerX, centerY, complexity, canvasWidth, canvasHeight),
	]

	const randomGenerator = generators[Math.floor(Math.random() * generators.length)]
	return randomGenerator()
}

/**
 * 生成有机类型灵感
 */
function generateOrganic(config: InspirationConfig): CanvasPath[] {
	const { complexity, canvasWidth, canvasHeight } = config
	const centerX = canvasWidth / 2
	const centerY = canvasHeight / 2

	const generators = [
		() => generateWaves(canvasHeight * 0.2, complexity, canvasWidth, canvasHeight),
		() => generateTree(centerX, canvasHeight * 0.85, complexity, canvasWidth, canvasHeight),
		() => generateSpiral(centerX, centerY, complexity, canvasWidth, canvasHeight),
	]

	const randomGenerator = generators[Math.floor(Math.random() * generators.length)]
	return randomGenerator()
}

/**
 * 生成简笔画类型灵感
 */
function generateSketch(config: InspirationConfig): CanvasPath[] {
	const { canvasWidth, canvasHeight } = config
	const centerX = canvasWidth / 2
	const centerY = canvasHeight / 2
	const scale = Math.min(canvasWidth, canvasHeight) / 400

	const generators = [
		() => generateSimpleCat(centerX, centerY, scale),
		() => generateSimpleBird(centerX, centerY, scale),
		() => generateSimpleRabbit(centerX, centerY, scale),
		() => generateSimpleFish(centerX, centerY, scale),
		() => generateSimpleFlower(centerX, centerY, scale),
	]

	const randomGenerator = generators[Math.floor(Math.random() * generators.length)]
	return randomGenerator()
}

/**
 * 生成图案类型灵感
 */
function generatePattern(config: InspirationConfig): CanvasPath[] {
	const { complexity, canvasWidth, canvasHeight } = config
	const params = getComplexityParams(complexity)
	const paths: CanvasPath[] = []

	// 随机选择模式：交叉排线 (Crosshatch) 或 编织波浪 (Weaving)
	const isCrossHatch = Math.random() > 0.5

	if (isCrossHatch) {
		const spacing = Math.max(20, 80 / params.density)
		const segmentCount = 20
		const jitterStrength = 2

		// 45度斜线
		// 范围扩大以覆盖旋转后的区域
		const limit = canvasWidth + canvasHeight
		for (let i = -canvasHeight; i < limit; i += spacing) {
			if (Math.random() > 0.9) continue // 偶尔随机断裂

			const points: { x: number; y: number }[] = []
			for (let t = 0; t <= segmentCount; t++) {
				const ratio = t / segmentCount
				// 简单的线性插值生成斜线
				const x = i + canvasHeight * ratio
				const y = canvasHeight * ratio

				points.push({
					x: x + (Math.random() - 0.5) * jitterStrength,
					y: y + (Math.random() - 0.5) * jitterStrength,
				})
			}
			paths.push(createPath(points))
		}

		// -45度斜线 (交叉)
		for (let i = -canvasHeight; i < limit; i += spacing) {
			if (Math.random() > 0.9) continue

			const points: { x: number; y: number }[] = []
			for (let t = 0; t <= segmentCount; t++) {
				const ratio = t / segmentCount
				// 反向斜率
				const x = i + canvasHeight * (1 - ratio)
				const y = canvasHeight * ratio

				points.push({
					x: x + (Math.random() - 0.5) * jitterStrength,
					y: y + (Math.random() - 0.5) * jitterStrength,
				})
			}
			paths.push(createPath(points))
		}
	} else {
		// 编织波浪 (Weaving Waves)
		const gridSize = Math.floor(params.iterations * 1.5)
		const cellH = canvasHeight / gridSize
		const cellW = canvasWidth / gridSize
		const segments = 40
		const amplitude = 8
		const jitterStrength = 3

		// 水平波浪
		for (let row = 0; row <= gridSize; row++) {
			const points: { x: number; y: number }[] = []
			const yBase = row * cellH
			// 随机相位偏移
			const phase = Math.random() * Math.PI * 2

			for (let i = 0; i <= segments; i++) {
				const ratio = i / segments
				const x = ratio * canvasWidth
				// 正弦波 + 随机抖动
				const y =
					yBase +
					Math.sin(ratio * Math.PI * 4 + phase) * amplitude +
					(Math.random() - 0.5) * jitterStrength
				points.push({ x, y })
			}
			paths.push(createPath(points))
		}

		// 垂直线条 (波浪或直线)
		for (let col = 0; col <= gridSize; col++) {
			// 在简单模式下，减少垂直线的密度
			if (complexity === 'simple' && col % 2 !== 0) continue

			const points: { x: number; y: number }[] = []
			const xBase = col * cellW
			const phase = Math.random() * Math.PI * 2

			for (let i = 0; i <= segments; i++) {
				const ratio = i / segments
				const y = ratio * canvasHeight
				const x =
					xBase +
					Math.cos(ratio * Math.PI * 4 + phase) * amplitude +
					(Math.random() - 0.5) * jitterStrength
				points.push({ x, y })
			}
			paths.push(createPath(points))
		}
	}

	return paths
}

/**
 * 主入口：生成随机灵感
 */
export function generateRandomInspiration(config: InspirationConfig): InspirationResult {
	let paths: CanvasPath[] = []

	switch (config.category) {
		case 'geometric':
			paths = generateGeometric(config)
			break
		case 'organic':
			paths = generateOrganic(config)
			break
		case 'sketch':
			paths = generateSketch(config)
			break
		case 'pattern':
			paths = generatePattern(config)
			break
	}

	// 随机选择提示词
	const categoryPrompts = PROMPT_SUGGESTIONS[config.category]
	const suggestedPrompts = [categoryPrompts[Math.floor(Math.random() * categoryPrompts.length)]]

	// 根据路径数量计算动画时长
	const animationDuration = Math.min(2000, Math.max(800, paths.length * 100))

	return {
		paths,
		suggestedPrompts,
		animationDuration,
	}
}
