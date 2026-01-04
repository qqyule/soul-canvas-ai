/**
 * @file src/config/animations.ts
 * @description 全局动效配置 (Framer Motion)
 */

import { Variants } from 'framer-motion'

// -----------------------------------------------------------------------------
// Transition Defaults
// -----------------------------------------------------------------------------

export const SPRING_TRANSITION = {
	type: 'spring',
	stiffness: 300,
	damping: 30,
}

export const SMOOTH_TRANSITION = {
	type: 'tween',
	duration: 0.3,
	ease: 'easeInOut',
}

// -----------------------------------------------------------------------------
// Variants
// -----------------------------------------------------------------------------

export const fadeIn: Variants = {
	initial: { opacity: 0 },
	animate: { opacity: 1, transition: SMOOTH_TRANSITION },
	exit: { opacity: 0, transition: SMOOTH_TRANSITION },
}

export const slideUp: Variants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0, transition: SPRING_TRANSITION },
	exit: { opacity: 0, y: 20, transition: SMOOTH_TRANSITION },
}

export const scaleIn: Variants = {
	initial: { opacity: 0, scale: 0.95 },
	animate: { opacity: 1, scale: 1, transition: SPRING_TRANSITION },
	exit: { opacity: 0, scale: 0.95, transition: SMOOTH_TRANSITION },
}

export const staggerChildren: Variants = {
	animate: {
		transition: {
			staggerChildren: 0.1,
		},
	},
}
