/**
 * @file src/components/layout/page-transition.tsx
 * @description 页面切换过渡组件
 */

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeIn } from '@/config/animations'

interface PageTransitionProps {
	children: ReactNode
	className?: string
}

const PageTransition = ({ children, className }: PageTransitionProps) => {
	return (
		<motion.div
			initial="initial"
			animate="animate"
			exit="exit"
			variants={fadeIn}
			className={className}
		>
			{children}
		</motion.div>
	)
}

export default PageTransition
