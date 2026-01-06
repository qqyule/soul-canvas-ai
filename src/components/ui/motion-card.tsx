/**
 * @file src/components/ui/motion-card.tsx
 * @description 带悬停浮起效果的卡片容器
 */

import { type HTMLMotionProps, motion } from 'framer-motion'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface MotionCardProps extends HTMLMotionProps<'div'> {
	hoverScale?: number
}

const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
	({ className, children, hoverScale = 1.02, ...props }, ref) => {
		return (
			<motion.div
				ref={ref}
				className={cn('bg-card text-card-foreground rounded-xl border shadow-sm', className)}
				whileHover={{
					scale: hoverScale,
					y: -4,
					boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
				}}
				transition={{ type: 'spring', stiffness: 300, damping: 20 }}
				{...props}
			>
				{children}
			</motion.div>
		)
	}
)

MotionCard.displayName = 'MotionCard'

export { MotionCard }
