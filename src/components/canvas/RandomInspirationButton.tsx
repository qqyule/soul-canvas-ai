import { Dice5 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface RandomInspirationButtonProps {
	onClick: () => void
	disabled?: boolean
}

export default function RandomInspirationButton({
	onClick,
	disabled,
}: RandomInspirationButtonProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					onClick={onClick}
					disabled={disabled}
					className={cn(
						'transition-all hover:scale-105',
						!disabled && 'hover:border-primary/50 hover:shadow-glow-sm'
					)}
				>
					<Dice5 className="h-4 w-4" />
				</Button>
			</TooltipTrigger>
			<TooltipContent>随机灵感</TooltipContent>
		</Tooltip>
	)
}
