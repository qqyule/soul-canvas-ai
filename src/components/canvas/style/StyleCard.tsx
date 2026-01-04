import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { StylePreset } from '@/prompts/style-presets'
import { Check } from 'lucide-react'

interface StyleCardProps {
	style: StylePreset
	isSelected: boolean
	onClick: () => void
}

export const StyleCard = forwardRef<HTMLButtonElement, StyleCardProps>(
	({ style, isSelected, onClick }, ref) => {
		return (
			<motion.button
				ref={ref}
				layout
				onClick={onClick}
				className={cn(
					'group relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 text-left transition-all',
					isSelected
						? 'border-primary shadow-glow-sm'
						: 'border-transparent hover:border-primary/50'
				)}
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
			>
				{/* Background Image */}
				<div className="absolute inset-0">
					<img
						src={style.imageUrl}
						alt={style.name}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
						loading="lazy"
					/>
				</div>

				{/* Gradient Overlay */}
				<div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90" />

				{/* Minimal Floating Label */}
				<div className="absolute bottom-3 left-0 right-0 flex flex-col items-center justify-end px-2 text-center">
					<span className="truncate text-sm font-semibold tracking-wide text-white drop-shadow-md">
						{style.nameZh}
					</span>
				</div>

				{/* Active State Border Glow Animation */}
				{isSelected && (
					<motion.div
						layoutId="active-style-glow"
						className="absolute inset-0 z-10 rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background"
						transition={{ duration: 0.2 }}
					/>
				)}

				{/* Selection Indicator - Fixed Position independent of glow */}
				{isSelected && (
					<motion.div
						initial={{ scale: 0, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className="absolute right-2 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
					>
						<Check className="h-4 w-4" />
					</motion.div>
				)}
			</motion.button>
		)
	}
)

StyleCard.displayName = 'StyleCard'
