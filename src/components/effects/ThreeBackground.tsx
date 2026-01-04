/**
 * @file src/components/effects/ThreeBackground.tsx
 * @description 高级 3D 科技感背景
 * - 粒子连线网络 (Particle Network with Lines)
 * - 波浪扰动效果 (Wave Distortion)
 * - 鼠标交互 (Mouse Interaction)
 */

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/** 粒子数量 */
const PARTICLE_COUNT = 800
/** 连线距离阈值 */
const CONNECTION_DISTANCE = 0.3
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

interface ParticleData {
	positions: Float32Array
	originalPositions: Float32Array
	velocities: Float32Array
}

const ParticleNetwork = () => {
	const pointsRef = useRef<THREE.Points>(null)
	const linesRef = useRef<THREE.LineSegments>(null)
	const mouseRef = useRef(new THREE.Vector2(9999, 9999))
	const mouse3DRef = useRef(new THREE.Vector3(9999, 9999, 0))
	// 冲击波状态: { position, startTime }
	const shockwaveRef = useRef<{
		position: THREE.Vector3
		startTime: number
	} | null>(null)

	const { size, camera } = useThree()

	// 初始化粒子数据
	const particleData = useMemo<ParticleData>(() => {
		const positions = new Float32Array(PARTICLE_COUNT * 3)
		const originalPositions = new Float32Array(PARTICLE_COUNT * 3)
		const velocities = new Float32Array(PARTICLE_COUNT * 3)

		for (let i = 0; i < PARTICLE_COUNT; i++) {
			// 在平面上均匀分布粒子
			const x = (Math.random() - 0.5) * 4
			const y = (Math.random() - 0.5) * 3
			const z = (Math.random() - 0.5) * 0.5

			positions[i * 3] = x
			positions[i * 3 + 1] = y
			positions[i * 3 + 2] = z

			originalPositions[i * 3] = x
			originalPositions[i * 3 + 1] = y
			originalPositions[i * 3 + 2] = z

			// 初始速度
			velocities[i * 3] = (Math.random() - 0.5) * 0.001
			velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.001
			velocities[i * 3 + 2] = 0
		}

		return { positions, originalPositions, velocities }
	}, [])

	// 连线几何体
	const lineGeometry = useMemo(() => {
		const geometry = new THREE.BufferGeometry()
		// 预分配足够的连线空间
		const maxLines = PARTICLE_COUNT * 10
		const linePositions = new Float32Array(maxLines * 6)
		const lineColors = new Float32Array(maxLines * 6)
		geometry.setAttribute(
			'position',
			new THREE.BufferAttribute(linePositions, 3)
		)
		geometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3))
		geometry.setDrawRange(0, 0)
		return geometry
	}, [])

	// 鼠标移动处理
	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			// 标准化鼠标坐标到 [-1, 1]
			mouseRef.current.x = (event.clientX / size.width) * 2 - 1
			mouseRef.current.y = -(event.clientY / size.height) * 2 + 1

			// 转换到 3D 空间
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

		// 点击触发冲击波
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

	// 动画帧
	useFrame((state) => {
		const time = state.clock.elapsedTime
		const { positions, originalPositions, velocities } = particleData

		// === 更新粒子位置 ===
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			const i3 = i * 3
			const ox = originalPositions[i3]
			const oy = originalPositions[i3 + 1]
			const oz = originalPositions[i3 + 2]

			// 波浪扰动
			const waveX = Math.sin(time * 0.5 + oy * 2) * 0.02
			const waveY = Math.cos(time * 0.3 + ox * 2) * 0.015
			const waveZ = Math.sin(time * 0.4 + ox + oy) * 0.01

			// 目标位置 = 原始位置 + 波浪
			let targetX = ox + waveX
			let targetY = oy + waveY
			let targetZ = oz + waveZ

			// 鼠标交互 - 排斥效果
			const mx = mouse3DRef.current.x
			const my = mouse3DRef.current.y
			const dx = positions[i3] - mx
			const dy = positions[i3 + 1] - my
			const dist = Math.sqrt(dx * dx + dy * dy)

			if (dist < MOUSE_RADIUS && dist > 0.001) {
				const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * MOUSE_FORCE
				velocities[i3] += (dx / dist) * force
				velocities[i3 + 1] += (dy / dist) * force
			}

			// 冲击波效果 - 扩散环推开粒子
			if (shockwaveRef.current) {
				const { position: shockPos, startTime } = shockwaveRef.current
				const elapsed = performance.now() / 1000 - startTime

				if (elapsed < SHOCKWAVE_DURATION) {
					const ringRadius = elapsed * SHOCKWAVE_SPEED
					const ringWidth = 0.3

					const sdx = positions[i3] - shockPos.x
					const sdy = positions[i3 + 1] - shockPos.y
					const sDist = Math.sqrt(sdx * sdx + sdy * sdy)

					// 检查粒子是否在扩散环内
					if (Math.abs(sDist - ringRadius) < ringWidth && sDist > 0.001) {
						const intensity = 1 - elapsed / SHOCKWAVE_DURATION
						const force = SHOCKWAVE_FORCE * intensity
						velocities[i3] += (sdx / sDist) * force
						velocities[i3 + 1] += (sdy / sDist) * force
					}
				} else {
					// 冲击波结束
					shockwaveRef.current = null
				}
			}

			// 应用速度
			targetX += velocities[i3]
			targetY += velocities[i3 + 1]

			// 速度衰减
			velocities[i3] *= 0.95
			velocities[i3 + 1] *= 0.95

			// 平滑插值到目标位置
			positions[i3] += (targetX - positions[i3]) * 0.1
			positions[i3 + 1] += (targetY - positions[i3 + 1]) * 0.1
			positions[i3 + 2] += (targetZ - positions[i3 + 2]) * 0.1
		}

		// 更新点几何体
		if (pointsRef.current) {
			const posAttr = pointsRef.current.geometry.attributes
				.position as THREE.BufferAttribute
			posAttr.array = positions
			posAttr.needsUpdate = true
		}

		// === 更新连线 ===
		if (linesRef.current) {
			const linePositions = lineGeometry.attributes.position
				.array as Float32Array
			const lineColors = lineGeometry.attributes.color.array as Float32Array
			let lineIndex = 0

			for (let i = 0; i < PARTICLE_COUNT; i++) {
				for (let j = i + 1; j < PARTICLE_COUNT; j++) {
					const i3 = i * 3
					const j3 = j * 3

					const dx = positions[i3] - positions[j3]
					const dy = positions[i3 + 1] - positions[j3 + 1]
					const dz = positions[i3 + 2] - positions[j3 + 2]
					const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

					if (dist < CONNECTION_DISTANCE) {
						const alpha = 1 - dist / CONNECTION_DISTANCE

						// 线段起点
						linePositions[lineIndex * 6] = positions[i3]
						linePositions[lineIndex * 6 + 1] = positions[i3 + 1]
						linePositions[lineIndex * 6 + 2] = positions[i3 + 2]
						// 线段终点
						linePositions[lineIndex * 6 + 3] = positions[j3]
						linePositions[lineIndex * 6 + 4] = positions[j3 + 1]
						linePositions[lineIndex * 6 + 5] = positions[j3 + 2]

						// 颜色渐变 (紫色调)
						const r = 0.545 * alpha
						const g = 0.361 * alpha
						const b = 0.965 * alpha

						lineColors[lineIndex * 6] = r
						lineColors[lineIndex * 6 + 1] = g
						lineColors[lineIndex * 6 + 2] = b
						lineColors[lineIndex * 6 + 3] = r
						lineColors[lineIndex * 6 + 4] = g
						lineColors[lineIndex * 6 + 5] = b

						lineIndex++
					}
				}
			}

			lineGeometry.setDrawRange(0, lineIndex * 2)
			lineGeometry.attributes.position.needsUpdate = true
			lineGeometry.attributes.color.needsUpdate = true
		}
	})

	return (
		<group>
			{/* 粒子 */}
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
					size={0.015}
					color="#8b5cf6"
					sizeAttenuation={true}
					transparent={true}
					opacity={0.8}
					depthWrite={false}
				/>
			</points>

			{/* 连线 */}
			<lineSegments ref={linesRef} geometry={lineGeometry}>
				<lineBasicMaterial
					vertexColors={true}
					transparent={true}
					opacity={0.6}
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
			>
				<ParticleNetwork />
			</Canvas>
		</div>
	)
}

export default ThreeBackground
