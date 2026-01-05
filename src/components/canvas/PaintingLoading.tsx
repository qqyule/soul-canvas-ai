/**
 * PaintingLoading - 画笔作画加载动画组件
 * 显示画笔在画布上作画的动效，配合有趣的提示文案
 */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * 有趣的加载提示文案数组
 */
const LOADING_MESSAGES = [
	'马良正在挥毫泼墨...',
	'神笔正在编织梦想...',
	'AI 正在施展魔法...',
	'灵感正在涌现...',
	'创意正在绽放...',
	'画卷即将呈现...',
	'妙笔正在生花...',
	'奇迹正在发生...',
	'给点时间，好饭不怕晚...',
	'正在为像素注入灵魂...',
	'正在调配五彩斑斓的黑...',
	'让子弹再飞一会儿...',
	'正在与缪斯女神通话中...',
	'正在搬运彩虹...',
	'精彩即将上演...',
	'嘘... 艺术家正在思考...',
]

interface PaintingLoadingProps {
	className?: string
}

/**
 * 画笔作画加载动画
 * @param props - 组件属性
 * @returns 加载动画组件
 */
const PaintingLoading = ({ className }: PaintingLoadingProps) => {
	const [messageIndex, setMessageIndex] = useState(
		Math.floor(Math.random() * LOADING_MESSAGES.length)
	)

	useEffect(() => {
		const interval = setInterval(() => {
			setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
		}, 3000)

		return () => clearInterval(interval)
	}, [])

	return (
		<div className={cn('flex flex-col items-center gap-4', className)}>
			{/* 画笔动画容器 */}
			<div className="relative w-24 h-24">
				{/* 画布/纸张背景 */}
				<motion.div
					className="absolute inset-2 bg-white/80 rounded-lg shadow-inner border border-gray-200"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
				/>

				{/* 画笔 SVG */}
				<motion.svg
					viewBox="0 0 64 64"
					className="absolute w-full h-full"
					initial={{ rotate: -30, x: -8, y: -8 }}
					animate={{
						rotate: [-30, -20, -30, -25, -30],
						x: [-8, 4, -4, 8, -8],
						y: [-8, 4, 8, 0, -8],
					}}
					transition={{
						duration: 2,
						repeat: Infinity,
						ease: 'easeInOut',
					}}
				>
					{/* 画笔主体 */}
					<motion.g transform="translate(32, 32)">
						{/* 笔杆 */}
						<rect
							x="-3"
							y="-24"
							width="6"
							height="28"
							rx="1"
							className="fill-amber-700"
						/>
						{/* 笔杆装饰条纹 */}
						<rect
							x="-3"
							y="-20"
							width="6"
							height="2"
							className="fill-amber-600"
						/>
						<rect
							x="-3"
							y="-14"
							width="6"
							height="2"
							className="fill-amber-600"
						/>
						{/* 笔头金属环 */}
						<rect
							x="-4"
							y="2"
							width="8"
							height="4"
							rx="1"
							className="fill-gray-400"
						/>
						{/* 笔尖/刷毛 */}
						<motion.path
							d="M-3 6 L0 16 L3 6 Z"
							className="fill-gray-800"
							animate={{
								d: [
									'M-3 6 L0 16 L3 6 Z',
									'M-4 6 L0 18 L4 6 Z',
									'M-3 6 L0 16 L3 6 Z',
								],
							}}
							transition={{
								duration: 0.5,
								repeat: Infinity,
								ease: 'easeInOut',
							}}
						/>
					</motion.g>
				</motion.svg>

				{/* 墨迹/笔触效果 */}
				<svg
					viewBox="0 0 64 64"
					className="absolute inset-0 w-full h-full pointer-events-none"
				>
					{/* 动态笔触路径 */}
					<motion.path
						d="M 20 44 Q 32 36, 44 40"
						fill="none"
						className="stroke-primary"
						strokeWidth="2"
						strokeLinecap="round"
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{
							pathLength: [0, 1, 1, 0],
							opacity: [0, 1, 1, 0],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: 'easeInOut',
							times: [0, 0.4, 0.6, 1],
						}}
					/>
					<motion.path
						d="M 16 38 Q 28 42, 36 34"
						fill="none"
						className="stroke-primary/60"
						strokeWidth="1.5"
						strokeLinecap="round"
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{
							pathLength: [0, 1, 1, 0],
							opacity: [0, 1, 1, 0],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: 'easeInOut',
							delay: 0.3,
							times: [0, 0.4, 0.6, 1],
						}}
					/>
					<motion.path
						d="M 28 48 Q 40 44, 48 48"
						fill="none"
						className="stroke-primary/40"
						strokeWidth="1"
						strokeLinecap="round"
						initial={{ pathLength: 0, opacity: 0 }}
						animate={{
							pathLength: [0, 1, 1, 0],
							opacity: [0, 1, 1, 0],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: 'easeInOut',
							delay: 0.6,
							times: [0, 0.4, 0.6, 1],
						}}
					/>
				</svg>

				{/* 魔法粒子效果 */}
				{[...Array(6)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
						style={{
							left: '50%',
							top: '50%',
						}}
						animate={{
							x: [0, Math.cos((i * Math.PI) / 3) * 30],
							y: [0, Math.sin((i * Math.PI) / 3) * 30],
							opacity: [0, 1, 0],
							scale: [0.5, 1, 0.5],
						}}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							delay: i * 0.2,
							ease: 'easeOut',
						}}
					/>
				))}
			</div>

			{/* 提示文案 - 带切换动画 */}
			<div className="h-6 overflow-hidden relative w-full flex justify-center min-w-[200px]">
				<AnimatePresence mode="wait">
					<motion.p
						key={messageIndex}
						className="text-sm text-muted-foreground font-medium absolute w-full text-center"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.3 }}
					>
						{LOADING_MESSAGES[messageIndex]}
					</motion.p>
				</AnimatePresence>
			</div>

			{/* 进度点动画 */}
			<div className="flex gap-1">
				{[0, 1, 2].map((i) => (
					<motion.div
						key={i}
						className="w-1.5 h-1.5 rounded-full bg-primary/60"
						animate={{
							scale: [1, 1.3, 1],
							opacity: [0.4, 1, 0.4],
						}}
						transition={{
							duration: 1,
							repeat: Infinity,
							delay: i * 0.2,
						}}
					/>
				))}
			</div>
		</div>
	)
}

export default PaintingLoading
