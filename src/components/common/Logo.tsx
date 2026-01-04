import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface LogoProps {
	className?: string
	showText?: boolean
	onClick?: () => void
}

const Logo = ({ className, showText = true, onClick }: LogoProps) => {
	return (
		<div
			className={cn(
				'flex items-center gap-2.5 select-none cursor-pointer group',
				className
			)}
			onClick={onClick}
		>
			{/* Icon Container */}
			<div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-purple-600 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300">
				{/* Inner Glow */}
				<div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

				{/* Vector S / Icon */}
				<Sparkles
					className="w-5 h-5 text-white filter drop-shadow-sm group-hover:rotate-12 transition-transform duration-300"
					strokeWidth={2.5}
				/>

				{/* Decorative Dot */}
				<div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-background border-2 border-background">
					<div className="w-full h-full rounded-full bg-green-500 animate-pulse" />
				</div>
			</div>

			{/* Text Content */}
			{showText && (
				<div className="flex flex-col -space-y-0.5">
					<div className="flex items-center">
						<span className="font-bold text-xl tracking-tight text-foreground relative">
							神笔
							<span className="text-primary/10 absolute -bottom-1 left-0 w-full h-1.5 -z-10 rounded-sm group-hover:text-primary/20 transition-colors" />
						</span>
						<span className="font-light text-xl tracking-tight text-foreground/90 ml-0.5">
							马良
						</span>
					</div>
					<span className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground/80 uppercase group-hover:text-primary/80 transition-colors pl-0.5">
						AI • Art • Gen
					</span>
				</div>
			)}
		</div>
	)
}

export default Logo
