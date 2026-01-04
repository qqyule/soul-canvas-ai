import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import UserProfile from '@/components/auth/UserProfile'
import Logo from '@/components/common/Logo'

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
				<Logo onClick={onLogoClick} />

				{/* Nav */}
				<div className="flex items-center gap-3">
					<UserProfile />
				</div>
			</div>
		</motion.header>
	)
}

export default Header
