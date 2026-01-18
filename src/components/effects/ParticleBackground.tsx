/**
 * 浮动粒子背景组件
 * @description 轻量级装饰性粒子效果，营造梦幻氛围
 */

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface ParticleBackgroundProps {
	/** 粒子数量，默认 20 */
	count?: number
	/** 自定义类名 */
	className?: string
	/** 是否启用，默认 true */
	enabled?: boolean
}

/**
 * 生成随机粒子配置
 */
const generateParticles = (count: number) => {
	return Array.from({ length: count }, (_, i) => ({
		id: i,
		left: `${Math.random() * 100}%`,
		top: `${Math.random() * 100}%`,
		size: 4 + Math.random() * 6,
		delay: Math.random() * 10,
		duration: 12 + Math.random() * 8,
	}))
}

/**
 * 浮动粒子背景
 * 使用 CSS 动画实现轻量级粒子效果
 */
const ParticleBackground = ({
	count = 20,
	className,
	enabled = true,
}: ParticleBackgroundProps) => {
	// 使用 useMemo 缓存粒子配置，避免重新渲染时重新生成
	const particles = useMemo(() => generateParticles(count), [count])

	if (!enabled) return null

	return (
		<div className={cn('floating-particles', className)} aria-hidden="true">
			{particles.map((particle) => (
				<div
					key={particle.id}
					className="particle"
					style={{
						left: particle.left,
						top: particle.top,
						width: particle.size,
						height: particle.size,
						animationDelay: `${particle.delay}s`,
						animationDuration: `${particle.duration}s`,
					}}
				/>
			))}
		</div>
	)
}

export default ParticleBackground
