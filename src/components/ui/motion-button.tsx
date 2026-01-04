/**
 * @file src/components/ui/motion-button.tsx
 * @description 带动效的按钮组件 (封装 Shadcn Button)
 */

import { motion, HTMLMotionProps } from 'framer-motion'
import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

// 结合 ButtonProps 和 HTMLMotionProps
// 注意: Button 的 ref 通常是 HTMLButtonElement
type MotionButtonProps = ButtonProps & HTMLMotionProps<'button'>

const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
	({ className, children, ...props }, ref) => {
		return (
			<Button
				asChild
				ref={ref}
				className={cn('active:scale-95 transition-transform', className)} // Shadcn 默认已有部分 transition
				{...props}
			>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					transition={{ type: 'spring', stiffness: 400, damping: 10 }}
				>
					{children}
				</motion.button>
			</Button>
		)
	}
)

MotionButton.displayName = 'MotionButton'

export { MotionButton }
