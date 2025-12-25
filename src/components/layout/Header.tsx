import { motion } from 'framer-motion'

const Header = () => {
	return (
		<motion.header
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="fixed top-0 left-0 right-0 z-40 px-6 py-4"
		>
			<div className="max-w-7xl mx-auto flex items-center justify-between">
				{/* Logo */}
				<motion.div
					whileHover={{ scale: 1.02 }}
					className="flex items-center gap-3"
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

				{/* Nav (placeholder for future features) */}
				<div className="flex items-center gap-4">
					<motion.div
						whileHover={{ scale: 1.05 }}
						className="px-4 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm text-muted-foreground"
					>
						<span className="hidden sm:inline">无需登录即可体验</span>
						<span className="sm:hidden">免费体验</span>
					</motion.div>
				</div>
			</div>
		</motion.header>
	)
}

export default Header
