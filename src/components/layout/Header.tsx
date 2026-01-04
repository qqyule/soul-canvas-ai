import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import UserProfile from '@/components/auth/UserProfile'

interface HeaderProps {
	onLogoClick?: () => void
}

const Header = ({ onLogoClick }: HeaderProps) => {
	const [isScrolled, setIsScrolled] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10)
		}
		window.addEventListener('scroll', handleScroll)
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<motion.header
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className={cn(
				'fixed top-0 left-0 right-0 z-40 px-6 py-4 transition-all duration-300',
				isScrolled
					? 'bg-background/80 backdrop-blur-md shadow-sm py-3'
					: 'bg-transparent'
			)}
		>
			<div className="max-w-7xl mx-auto flex items-center justify-between">
				{/* Logo */}
				<motion.div
					whileHover={{ scale: 1.02 }}
					className="flex items-center gap-3 cursor-pointer"
					onClick={onLogoClick}
				>
					<div className="relative">
						<div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-sm">
							<span className="text-xl">✦</span>
						</div>
						<motion.div
							animate={{
								opacity: [0.5, 1, 0.5],
								scale: [1, 1.1, 1],
							}}
							transition={{ duration: 2, repeat: Infinity }}
							className="absolute inset-0 rounded-xl bg-gradient-primary blur-lg opacity-50"
						/>
					</div>
					<div>
						<h1 className="text-xl font-bold text-gradient">神笔马良</h1>
						<p className="text-xs text-muted-foreground">
							一笔成画，AI 帮你实现
						</p>
					</div>
				</motion.div>

				{/* Nav */}
				<div className="flex items-center gap-3">
					<UserProfile />
				</div>
			</div>
		</motion.header>
	)
}

export default Header
