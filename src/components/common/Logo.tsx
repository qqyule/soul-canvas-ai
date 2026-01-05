import { cn } from '@/lib/utils'
import { AnimatedLogo } from '@/components/brand'

interface LogoProps {
	className?: string
	showText?: boolean
	onClick?: () => void
}

/**
 * Logo 组件 - 使用科技化动态 Logo
 */
const Logo = ({ className, showText = true, onClick }: LogoProps) => {
	return (
		<div
			className={cn(
				'flex items-center gap-2.5 select-none cursor-pointer group',
				className
			)}
			onClick={onClick}
		>
			{/* 科技化动态 Logo */}
			<AnimatedLogo size="sm" animated={true} />

			{/* 文字内容 */}
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
