import { motion } from 'framer-motion'
import { ChevronDown, Copy } from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface BatchSelectorProps {
	value: number
	onChange: (value: number) => void
	disabled?: boolean
	maxBatchSize?: number
}

const BatchSelector = ({
	value,
	onChange,
	disabled = false,
	maxBatchSize = 4,
}: BatchSelectorProps) => {
	const options = [1, 2, 3, 4].filter((n) => n <= maxBatchSize)

	return (
		<>
			{/* Desktop View: Button Group */}
			<div className="hidden md:flex items-center gap-2 p-1 bg-muted/30 rounded-lg border border-border/50">
				<div className="px-2 text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
					<Copy className="w-3.5 h-3.5" />
					<span>生成数量</span>
				</div>
				<div className="flex items-center gap-1">
					{options.map((num) => (
						<button
							type="button"
							key={num}
							onClick={() => onChange(num)}
							disabled={disabled}
							className={cn(
								'relative w-8 h-8 rounded-md text-xs font-medium transition-all duration-200',
								'hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20',
								value === num
									? 'text-primary bg-primary/10 shadow-sm'
									: 'text-muted-foreground hover:text-foreground'
							)}
						>
							{value === num && (
								<motion.div
									layoutId="batch-selector-active"
									className="absolute inset-0 rounded-md border border-primary/20 bg-primary/5"
									transition={{ type: 'spring', stiffness: 400, damping: 30 }}
								/>
							)}
							<span className="relative z-10">{num}x</span>
						</button>
					))}
				</div>
			</div>

			{/* Mobile View: Dropdown Menu */}
			<div className="md:hidden">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							disabled={disabled}
							className={cn(
								'flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/30 border border-border/50 text-xs font-medium transition-colors',
								'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
								disabled && 'opacity-50 cursor-not-allowed'
							)}
						>
							<Copy className="w-3.5 h-3.5 text-primary" />
							<span>{value}x</span>
							<ChevronDown className="w-3 h-3 text-muted-foreground/70" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-[120px]">
						{options.map((num) => (
							<DropdownMenuItem
								key={num}
								onClick={() => onChange(num)}
								className={cn(
									'justify-between cursor-pointer',
									value === num && 'bg-primary/10 text-primary focus:bg-primary/15'
								)}
							>
								<span>生成 {num} 张</span>
								{value === num && (
									<motion.div
										layoutId="batch-selector-check"
										className="w-1.5 h-1.5 rounded-full bg-primary"
									/>
								)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</>
	)
}

export default BatchSelector
