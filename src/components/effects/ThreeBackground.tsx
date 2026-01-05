/**
 * @file src/components/effects/ThreeBackground.tsx
 * @description 高级 3D 科技感背景 - 动态粒子生肖
 * - 粒子连线网络 (Particle Network with Lines)
 * - 粒子自动汇聚生成动物图案 (Animal Shape Formation)
 * - 波浪扰动效果 (Wave Distortion)
 * - 鼠标交互 (Mouse Interaction)
 */

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ANIMAL_PATHS, AnimalType } from '@/constants/animal-paths'
import {
	samplePointsFromPath,
	generateRandomParticles,
} from '@/utils/particle-shapes'

/** 粒子数量 */
const PARTICLE_COUNT = 1500
/** 连线距离阈值 */
const CONNECTION_DISTANCE = 0.25
/** 鼠标影响半径 */
const MOUSE_RADIUS = 0.5
/** 鼠标排斥力度 */
const MOUSE_FORCE = 0.02
/** 点击冲击波速度 */
const SHOCKWAVE_SPEED = 2.0
/** 点击冲击波力度 */
const SHOCKWAVE_FORCE = 0.08
/** 冲击波持续时间 (秒) */
const SHOCKWAVE_DURATION = 1.0

// 动画状态定义
type AnimationState = 'IDLE' | 'GATHERING' | 'HOLDING' | 'DISPERSING'

interface ParticleData {
	positions: Float32Array
	velocities: Float32Array
	randomPositions: Float32Array // 散乱状态的随机位置
	targetPositions: Float32Array | null // 目标形状的位置
}

const ParticleNetwork = () => {
	const pointsRef = useRef<THREE.Points>(null)
	const linesRef = useRef<THREE.LineSegments>(null)
	const mouseRef = useRef(new THREE.Vector2(9999, 9999))
	const mouse3DRef = useRef(new THREE.Vector3(9999, 9999, 0))
	const shockwaveRef = useRef<{
		position: THREE.Vector3
		startTime: number
	} | null>(null)

	const { size } = useThree()

	// 动画状态管理
	const [animState, setAnimState] = useState<AnimationState>('IDLE')
	const stateTimerRef = useRef(0)
	const currentAnimalRef = useRef<AnimalType>('DRAGON')

	// 预计算所有动物的粒子位置
	const animalShapes = useMemo(() => {
		const shapes: Record<string, Float32Array> = {}
		const keys = Object.keys(ANIMAL_PATHS) as AnimalType[]

		keys.forEach((key) => {
			// 采样点，缩放 0.015 适应屏幕，向上偏移 0.5 使其位于上半部分
			// 注意: SVG 坐标系 Y 轴向下，samplePointsFromPath 已经处理了翻转，但可能需要微调位置
			const offset = new THREE.Vector3(0, 0.8, 0)
			shapes[key] = samplePointsFromPath(
				ANIMAL_PATHS[key],
				PARTICLE_COUNT,
				0.012,
				offset
			)
		})
		return shapes
	}, [])

	// 初始化粒子数据
	const particleData = useMemo<ParticleData>(() => {
		// 初始随机位置 (分布更广一些)
		const randomPositions = generateRandomParticles(PARTICLE_COUNT, 5, 4, 1)

		// 实际使用的位置缓存
		const positions = new Float32Array(randomPositions)
		const velocities = new Float32Array(PARTICLE_COUNT * 3)

		return {
			positions,
			velocities,
			randomPositions,
			targetPositions: null,
		}
	}, [])

	// 连线几何体
	const lineGeometry = useMemo(() => {
		const geometry = new THREE.BufferGeometry()
		const maxLines = PARTICLE_COUNT * 8 // 适度减少最大连线数优化性能
		const linePositions = new Float32Array(maxLines * 6)
		const lineColors = new Float32Array(maxLines * 6)
		geometry.setAttribute(
			'position',
			new THREE.BufferAttribute(linePositions, 3)
		)
		geometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3))
		return geometry
	}, [])

	// 鼠标监听
	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			mouseRef.current.x = (event.clientX / size.width) * 2 - 1
			mouseRef.current.y = -(event.clientY / size.height) * 2 + 1
			mouse3DRef.current.set(
				mouseRef.current.x * 2,
				mouseRef.current.y * 1.5,
				0
			)
		}

		const handleMouseLeave = () => {
			mouseRef.current.set(9999, 9999)
			mouse3DRef.current.set(9999, 9999, 0)
		}

		const handleClick = (event: MouseEvent) => {
			const x = (event.clientX / size.width) * 2 - 1
			const y = -(event.clientY / size.height) * 2 + 1
			shockwaveRef.current = {
				position: new THREE.Vector3(x * 2, y * 1.5, 0),
				startTime: performance.now() / 1000,
			}
		}

		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseleave', handleMouseLeave)
		window.addEventListener('click', handleClick)

		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseleave', handleMouseLeave)
			window.removeEventListener('click', handleClick)
		}
	}, [size])

	// 状态机循环
	useFrame((state, delta) => {
		stateTimerRef.current += delta
		const time = state.clock.elapsedTime
		const { positions, velocities, randomPositions, targetPositions } =
			particleData

		// === 状态转换逻辑 ===
		switch (animState) {
			case 'IDLE':
				if (stateTimerRef.current > 8.0) {
					const animals = Object.keys(ANIMAL_PATHS) as AnimalType[]
					const nextAnimal = animals[Math.floor(Math.random() * animals.length)]
					currentAnimalRef.current = nextAnimal
					particleData.targetPositions = animalShapes[nextAnimal]
					setAnimState('GATHERING')
					stateTimerRef.current = 0
				}
				break
			case 'GATHERING':
				if (stateTimerRef.current > 3.0) {
					setAnimState('HOLDING')
					stateTimerRef.current = 0
				}
				break
			case 'HOLDING':
				if (stateTimerRef.current > 5.0) {
					setAnimState('DISPERSING')
					stateTimerRef.current = 0
				}
				break
			case 'DISPERSING':
				if (stateTimerRef.current > 2.0) {
					particleData.targetPositions = null
					setAnimState('IDLE')
					stateTimerRef.current = 0
				}
				break
		}

		// === 计算动态亮度因子 ===
		let brightness = 1.0
		let pointOpacity = 0.6 // 默认较暗，形成对比

		if (animState === 'GATHERING') {
			// 汇聚过程中逐渐变亮 (1.0 -> 3.0)
			const progress = Math.min(stateTimerRef.current / 3.0, 1.0)
			brightness = 1.0 + progress * 2.5 // 增强亮度倍数
			pointOpacity = 0.6 + progress * 0.4 // 不透明度 0.6 -> 1.0
		} else if (animState === 'HOLDING') {
			// 保持高亮+呼吸感
			const breath = Math.sin(time * 3) * 0.2 + 0.8 // 0.6 ~ 1.0
			brightness = 3.5 * breath
			pointOpacity = 1.0
		} else if (animState === 'DISPERSING') {
			// 散开时衰减
			const progress = Math.min(stateTimerRef.current / 2.0, 1.0)
			brightness = 3.5 * (1.0 - progress) + 1.0 * progress
			pointOpacity = 1.0 - progress * 0.4
		} else {
			// IDLE 状态偶尔闪烁一下？或者保持柔和
			brightness = 1.0 + Math.sin(time) * 0.2
		}

		// === 粒子物理更新 ===
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			const i3 = i * 3

			// 1. 计算基准目标位置
			let tx = 0,
				ty = 0,
				tz = 0

			if (animState === 'IDLE' || animState === 'DISPERSING') {
				tx = randomPositions[i3]
				ty = randomPositions[i3 + 1]
				tz = randomPositions[i3 + 2]

				if (animState === 'IDLE') {
					tx += Math.sin(time * 0.2 + ty) * 0.2
					ty += Math.cos(time * 0.15 + tx) * 0.2
				}
			} else if (targetPositions) {
				tx = targetPositions[i3]
				ty = targetPositions[i3 + 1]
				tz = targetPositions[i3 + 2]

				if (animState === 'HOLDING') {
					const breath = Math.sin(time * 2) * 0.02
					tx *= 1 + breath
					ty *= 1 + breath
				}
			}

			// 2. 计算吸引力/弹力
			const px = positions[i3]
			const py = positions[i3 + 1]
			const pz = positions[i3 + 2]

			const k = animState === 'GATHERING' ? 2.0 : 0.5
			const ax = (tx - px) * k
			const ay = (ty - py) * k
			const az = (tz - pz) * k

			velocities[i3] += ax * delta
			velocities[i3 + 1] += ay * delta
			velocities[i3 + 2] += az * delta

			// 3. 外部力场
			const mx = mouse3DRef.current.x
			const my = mouse3DRef.current.y
			const dx = px - mx
			const dy = py - my
			const dist = Math.sqrt(dx * dx + dy * dy)

			if (dist < MOUSE_RADIUS && dist > 0.001) {
				const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * MOUSE_FORCE * 2
				velocities[i3] += (dx / dist) * force
				velocities[i3 + 1] += (dy / dist) * force
			}

			// 冲击波
			if (shockwaveRef.current) {
				const { position: shockPos, startTime } = shockwaveRef.current
				const elapsed = performance.now() / 1000 - startTime
				if (elapsed < SHOCKWAVE_DURATION) {
					const ringRadius = elapsed * SHOCKWAVE_SPEED
					const ringWidth = 0.3
					const sdx = px - shockPos.x
					const sdy = py - shockPos.y
					const sDist = Math.sqrt(sdx * sdx + sdy * sdy)

					if (Math.abs(sDist - ringRadius) < ringWidth && sDist > 0.001) {
						const intensity = 1 - elapsed / SHOCKWAVE_DURATION
						const force = SHOCKWAVE_FORCE * intensity * 3
						velocities[i3] += (sdx / sDist) * force
						velocities[i3 + 1] += (sdy / sDist) * force
					}
				} else {
					shockwaveRef.current = null
				}
			}

			// 4. DISPERSING 爆发
			if (animState === 'DISPERSING' && stateTimerRef.current < 0.1) {
				velocities[i3] += (Math.random() - 0.5) * 5.0 * delta
				velocities[i3 + 1] += (Math.random() - 0.5) * 5.0 * delta
				velocities[i3 + 2] += (Math.random() - 0.5) * 5.0 * delta
			}

			// 5. 阻尼
			const damping = 0.92
			velocities[i3] *= damping
			velocities[i3 + 1] *= damping
			velocities[i3 + 2] *= damping

			positions[i3] += velocities[i3] * delta * 5
			positions[i3 + 1] += velocities[i3 + 1] * delta * 5
			positions[i3 + 2] += velocities[i3 + 2] * delta * 5
		}

		// === 更新几何体 ===
		if (pointsRef.current) {
			pointsRef.current.geometry.attributes.position.needsUpdate = true

			// 动态更新点材质不透明度
			const mat = pointsRef.current.material as THREE.PointsMaterial
			if (mat) {
				// 平滑过渡不透明度
				mat.opacity += (pointOpacity - mat.opacity) * 0.1
				mat.size = animState === 'IDLE' ? 0.015 : 0.025 // 汇聚时变大一点
				mat.needsUpdate = true
			}
		}

		// === 更新连线 ===
		const currentDistThreshold =
			animState === 'HOLDING' || animState === 'GATHERING'
				? CONNECTION_DISTANCE * 0.3
				: CONNECTION_DISTANCE

		if (linesRef.current) {
			const linePositions = lineGeometry.attributes.position
				.array as Float32Array
			const lineColors = lineGeometry.attributes.color.array as Float32Array
			let lineIndex = 0
			// 动态调整遍历数量：HOLDING 状态下增加连线计算量以保证形状清晰，但减少范围
			const maxLines = linePositions.length / 6

			for (let i = 0; i < PARTICLE_COUNT; i++) {
				if (
					Math.abs(positions[i * 3]) > 4 ||
					Math.abs(positions[i * 3 + 1]) > 3
				)
					continue

				for (let j = i + 1; j < PARTICLE_COUNT; j++) {
					if (lineIndex >= maxLines) break

					const i3 = i * 3
					const j3 = j * 3
					const dx = positions[i3] - positions[j3]
					const dy = positions[i3 + 1] - positions[j3 + 1]
					const dz = positions[i3 + 2] - positions[j3 + 2]
					const distSq = dx * dx + dy * dy + dz * dz

					if (distSq < currentDistThreshold * currentDistThreshold) {
						const dist = Math.sqrt(distSq)
						const alpha = (1 - dist / currentDistThreshold) * 0.6

						// 赋值位置
						linePositions[lineIndex * 6] = positions[i3]
						linePositions[lineIndex * 6 + 1] = positions[i3 + 1]
						linePositions[lineIndex * 6 + 2] = positions[i3 + 2]
						linePositions[lineIndex * 6 + 3] = positions[j3]
						linePositions[lineIndex * 6 + 4] = positions[j3 + 1]
						linePositions[lineIndex * 6 + 5] = positions[j3 + 2]

						// 颜色 - 应用动态亮度
						// 基础色: 紫调 [0.6, 0.4, 1.0]
						// 高亮色: 青白调 [0.5, 0.8, 1.0]
						let r, g, b

						if (animState === 'HOLDING' || animState === 'GATHERING') {
							// 混合颜色向青色偏移，显得更"能量化"
							r = 0.6 * alpha * brightness
							g = 0.6 * alpha * brightness // 增加绿色分量
							b = 1.0 * alpha * brightness
						} else {
							r = 0.6 * alpha * brightness
							g = 0.4 * alpha * brightness
							b = 1.0 * alpha * brightness
						}

						lineColors[lineIndex * 6] = Math.min(r, 1.0)
						lineColors[lineIndex * 6 + 1] = Math.min(g, 1.0)
						lineColors[lineIndex * 6 + 2] = Math.min(b, 1.0)
						lineColors[lineIndex * 6 + 3] = Math.min(r, 1.0)
						lineColors[lineIndex * 6 + 4] = Math.min(g, 1.0)
						lineColors[lineIndex * 6 + 5] = Math.min(b, 1.0)

						lineIndex++
					}
				}
			}

			lineGeometry.setDrawRange(0, lineIndex * 2)
			lineGeometry.attributes.position.needsUpdate = true
			lineGeometry.attributes.color.needsUpdate = true

			// 确保 lineBasicMaterial 支持顶点颜色
			const lineMat = linesRef.current.material as THREE.LineBasicMaterial
			if (lineMat) {
				// 也可以根据状态微调材质不透明度
				lineMat.opacity = pointOpacity * 0.8
			}
		}
	})

	return (
		<group>
			<points ref={pointsRef}>
				<bufferGeometry>
					<bufferAttribute
						attach="attributes-position"
						count={PARTICLE_COUNT}
						array={particleData.positions}
						itemSize={3}
					/>
				</bufferGeometry>
				<pointsMaterial
					size={0.02}
					color="#8b5cf6"
					sizeAttenuation={true}
					transparent={true}
					opacity={0.95}
					depthWrite={false}
				/>
			</points>

			<lineSegments ref={linesRef} geometry={lineGeometry}>
				<lineBasicMaterial
					vertexColors={true}
					transparent={true}
					opacity={0.8}
					depthWrite={false}
				/>
			</lineSegments>
		</group>
	)
}

const ThreeBackground = () => {
	return (
		<div className="fixed inset-0 z-[-1] pointer-events-none opacity-60">
			<Canvas
				camera={{ position: [0, 0, 2], fov: 60 }}
				gl={{ antialias: true, alpha: true }}
				style={{ pointerEvents: 'auto' }}
				dpr={[1, 2]} // 优化高分屏性能
			>
				<ParticleNetwork />
			</Canvas>
		</div>
	)
}

export default ThreeBackground
