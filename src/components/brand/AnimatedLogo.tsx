import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Logo 尺寸配置
 */
const sizeConfig = {
	sm: { container: 32, icon: 20, viewBox: 48 },
	md: { container: 40, icon: 24, viewBox: 48 },
	lg: { container: 80, icon: 48, viewBox: 48 },
} as const

/**
 * AnimatedLogo 组件 Props
 */
interface AnimatedLogoProps {
	/** 尺寸变体 */
	size?: 'sm' | 'md' | 'lg'
	/** 是否启用动画 */
	animated?: boolean
	/** 自定义样式类 */
	className?: string
}

/**
 * 科技化动态 Logo 组件
 * 融合毛笔笔尖 + AI 神经网络节点的抽象图形
 */
const AnimatedLogo = ({
	size = 'md',
	animated = true,
	className,
}: AnimatedLogoProps) => {
	const config = sizeConfig[size]

	// 节点脉冲动画配置
	const pulseVariants = {
		idle: {
			scale: 1,
			opacity: 0.8,
		},
		pulse: {
			scale: [1, 1.2, 1],
			opacity: [0.8, 1, 0.8],
			transition: {
				duration: 2,
				repeat: Infinity,
				ease: 'easeInOut',
			},
		},
	}

	// 连线流动动画配置
	const lineVariants = {
		idle: {
			pathLength: 1,
			opacity: 0.6,
		},
		flow: {
			pathLength: [0, 1],
			opacity: [0.3, 0.8, 0.3],
			transition: {
				duration: 3,
				repeat: Infinity,
				ease: 'linear',
			},
		},
	}

	// 笔尖渐变动画
	const penVariants = {
		idle: { rotate: 0 },
		hover: {
			rotate: [0, -5, 5, 0],
			transition: { duration: 0.5 },
		},
	}

	return (
		<motion.div
			className={cn(
				'relative flex items-center justify-center',
				'rounded-xl',
				'bg-gradient-to-br from-primary via-primary/90 to-purple-600',
				'shadow-lg shadow-primary/25',
				'group-hover:shadow-primary/40 group-hover:scale-105',
				'transition-shadow duration-300',
				className
			)}
			style={{
				width: config.container,
				height: config.container,
			}}
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.98 }}
		>
			{/* 背景光效层 */}
			<div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

			{/* 动态粒子效果（悬停时显示） */}
			<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
				{[...Array(3)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-1 h-1 rounded-full bg-white/60"
						initial={{ x: '50%', y: '50%', scale: 0 }}
						whileInView={{
							x: `${30 + i * 20}%`,
							y: `${20 + i * 25}%`,
							scale: [0, 1, 0],
						}}
						transition={{
							duration: 1.5,
							delay: i * 0.2,
							repeat: Infinity,
						}}
					/>
				))}
			</div>

			{/* SVG Logo 主体 */}
			<motion.svg
				viewBox={`0 0 ${config.viewBox} ${config.viewBox}`}
				style={{
					width: config.icon,
					height: config.icon,
				}}
				className="relative z-10"
				variants={penVariants}
				initial="idle"
				whileHover="hover"
			>
				<defs>
					{/* 渐变定义 */}
					<linearGradient
						id="logo-gradient"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"
					>
						<stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
						<stop offset="100%" stopColor="#e0e7ff" stopOpacity="0.9" />
					</linearGradient>

					{/* 发光滤镜 */}
					<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="1" result="coloredBlur" />
						<feMerge>
							<feMergeNode in="coloredBlur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{/* 神经网络连线 */}
				<g filter="url(#glow)">
					{/* 连线 1: 左上节点 → 中心 */}
					<motion.path
						d="M12 14 L24 24"
						stroke="url(#logo-gradient)"
						strokeWidth="1.5"
						strokeLinecap="round"
						fill="none"
						variants={animated ? lineVariants : undefined}
						initial="idle"
						animate={animated ? 'flow' : 'idle'}
					/>

					{/* 连线 2: 右上节点 → 中心 */}
					<motion.path
						d="M36 14 L24 24"
						stroke="url(#logo-gradient)"
						strokeWidth="1.5"
						strokeLinecap="round"
						fill="none"
						variants={animated ? lineVariants : undefined}
						initial="idle"
						animate={animated ? 'flow' : 'idle'}
						style={{ animationDelay: '0.5s' }}
					/>

					{/* 连线 3: 中心 → 笔尖 */}
					<motion.path
						d="M24 24 L24 38"
						stroke="url(#logo-gradient)"
						strokeWidth="2"
						strokeLinecap="round"
						fill="none"
						variants={animated ? lineVariants : undefined}
						initial="idle"
						animate={animated ? 'flow' : 'idle'}
						style={{ animationDelay: '1s' }}
					/>
				</g>

				{/* 神经网络节点 */}
				<g filter="url(#glow)">
					{/* 左上节点 */}
					<motion.circle
						cx="12"
						cy="14"
						r="4"
						fill="url(#logo-gradient)"
						variants={animated ? pulseVariants : undefined}
						initial="idle"
						animate={animated ? 'pulse' : 'idle'}
					/>

					{/* 右上节点 */}
					<motion.circle
						cx="36"
						cy="14"
						r="4"
						fill="url(#logo-gradient)"
						variants={animated ? pulseVariants : undefined}
						initial="idle"
						animate={animated ? 'pulse' : 'idle'}
						style={{ animationDelay: '0.3s' }}
					/>

					{/* 中心节点 */}
					<motion.circle
						cx="24"
						cy="24"
						r="5"
						fill="url(#logo-gradient)"
						variants={animated ? pulseVariants : undefined}
						initial="idle"
						animate={animated ? 'pulse' : 'idle'}
						style={{ animationDelay: '0.6s' }}
					/>
				</g>

				{/* 笔尖形态 */}
				<motion.path
					d="M24 28 L20 40 L24 44 L28 40 Z"
					fill="url(#logo-gradient)"
					filter="url(#glow)"
					initial={{ opacity: 0.9 }}
					whileHover={{ opacity: 1 }}
				/>

				{/* 笔尖墨点 */}
				<motion.circle
					cx="24"
					cy="46"
					r="1.5"
					fill="url(#logo-gradient)"
					initial={{ opacity: 0, scale: 0 }}
					whileHover={{
						opacity: [0, 1, 0],
						scale: [0, 1.5, 0],
						transition: { duration: 0.8, repeat: Infinity },
					}}
				/>
			</motion.svg>

			{/* 状态指示灯 */}
			<div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-background border-2 border-background">
				<div className="w-full h-full rounded-full bg-green-500 animate-pulse" />
			</div>
		</motion.div>
	)
}

export default AnimatedLogo
