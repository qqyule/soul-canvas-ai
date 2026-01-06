import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ANIMAL_DATA } from '@/constants/animal-paths'

const ANIMALS = [
	{ id: 'horse', ...ANIMAL_DATA.HORSE },
	{ id: 'pig', ...ANIMAL_DATA.PIG },
	{ id: 'bird', ...ANIMAL_DATA.BIRD },
	{ id: 'elephant', ...ANIMAL_DATA.ELEPHANT },
	{ id: 'butterfly', ...ANIMAL_DATA.BUTTERFLY },
]

export const MorphingAnimalIcon = () => {
	const [index, setIndex] = useState(0)

	useEffect(() => {
		const timer = setInterval(() => {
			setIndex((prev) => (prev + 1) % ANIMALS.length)
		}, 3000)

		return () => clearInterval(timer)
	}, [])

	const currentAnimal = ANIMALS[index]

	return (
		<div className="relative w-12 h-12 inline-block align-middle mr-2 -mt-2">
			{/* Shared Gradient Definition */}
			<svg width="0" height="0" className="absolute">
				<defs>
					<linearGradient id="animal-gradient-shared" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="hsl(192 95% 55%)" />
						<stop offset="100%" stopColor="hsl(260 80% 60%)" />
					</linearGradient>
				</defs>
			</svg>

			<AnimatePresence mode="popLayout">
				<motion.div
					key={currentAnimal.id}
					className="absolute inset-0 w-full h-full"
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.8 }}
					transition={{
						duration: 0.8,
						ease: 'easeInOut',
					}}
				>
					<svg viewBox={currentAnimal.viewBox} className="w-full h-full overflow-visible">
						<path d={currentAnimal.d} fill="url(#animal-gradient-shared)" />
					</svg>
				</motion.div>
			</AnimatePresence>
		</div>
	)
}
