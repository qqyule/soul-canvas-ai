import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Images } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import UserProfile from '@/components/auth/UserProfile'
import Logo from '@/components/common/Logo'

interface HeaderProps {
	onLogoClick?: () => void
}

const Header = ({ onLogoClick }: HeaderProps) => {
	const [isScrolled, setIsScrolled] = useState(false)
	const location = useLocation()
	const isCommunityPage = location.pathname.startsWith('/community')

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
					{/* 社区画廊入口 */}
					<Link
						to="/community"
						className={cn(
							'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
							isCommunityPage
								? 'bg-primary/10 text-primary'
								: 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
						)}
					>
						<Images className="w-4 h-4" />
						<span className="hidden sm:inline">社区画廊</span>
					</Link>

					<UserProfile />
				</div>
			</div>
		</motion.header>
	)
}

export default Header
