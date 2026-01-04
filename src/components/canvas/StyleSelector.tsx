import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { StylePreset, StyleCategory } from '@/prompts/style-presets'
import { STYLE_PRESETS } from '@/prompts/style-presets'
import { StyleCard } from './style/StyleCard'
import { StyleCategoryNav } from './style/StyleCategoryNav'

interface StyleSelectorProps {
	selectedStyle: StylePreset
	onSelectStyle: (style: StylePreset) => void
}

const StyleSelector = ({
	selectedStyle,
	onSelectStyle,
}: StyleSelectorProps) => {
	return (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.5, delay: 0.3 }}
			className="space-y-4"
		>
			<div className="flex items-center justify-between">
				<div className="space-y-1">
					<h3 className="text-lg font-semibold text-foreground">选择风格</h3>
					<p className="text-sm text-muted-foreground">
						Choose a style for your creation
					</p>
				</div>
			</div>

			<motion.div
				layout
				className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3"
			>
				<AnimatePresence mode="popLayout">
					{STYLE_PRESETS.map((style) => (
						<StyleCard
							key={style.id}
							style={style}
							isSelected={selectedStyle.id === style.id}
							onClick={() => onSelectStyle(style)}
						/>
					))}
				</AnimatePresence>
			</motion.div>
		</motion.div>
	)
}

export default StyleSelector
