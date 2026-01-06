import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MaLiangIntroductionProps {
	open: boolean
	onClose: () => void
}

const MaLiangIntroduction = ({ open, onClose }: MaLiangIntroductionProps) => {
	return (
		<AnimatePresence>
			{open && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
					onClick={onClose}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{ type: 'spring', duration: 0.7, bounce: 0.3 }}
						className="relative w-full max-w-2xl bg-card rounded-2xl border border-border overflow-hidden shadow-2xl"
						onClick={(e) => e.stopPropagation()}
					>
						<Button
							variant="ghost"
							size="icon"
							className="absolute top-4 right-4 z-10 text-white/80 hover:text-white md:text-foreground/50 md:hover:text-foreground"
							onClick={onClose}
						>
							<X className="h-5 w-5" />
						</Button>

						<div className="grid md:grid-cols-2 gap-0">
							{/* Left: Image */}
							<div className="relative h-64 md:h-auto bg-muted">
								<img src="/ma-liang.png" alt="神笔马良" className="w-full h-full object-cover" />
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-card" />
								<div className="absolute bottom-4 left-4 text-white md:hidden">
									<h3 className="text-xl font-bold">神笔马良的故事</h3>
								</div>
							</div>

							{/* Right: Content */}
							<div className="p-6 md:p-8 flex flex-col justify-center">
								<div className="hidden md:block mb-6">
									<h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600 mb-2">
										神笔马良的故事
									</h3>
									<div className="h-1 w-12 bg-primary rounded-full" />
								</div>

								<div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
									<p>
										相传古时候有个放牛娃叫马良，他酷爱画画但家贫买不起笔。
										一天神仙送给他一支神笔，画出的鸟能飞，画出的鱼能游。
									</p>
									<p>
										马良用神笔为穷人画画，帮助大家过上了好日子。 现在，这款{' '}
										<span className="text-foreground font-medium">AI 画板</span>{' '}
										就是你手中的“神笔”。
									</p>
									<p>只要简单几笔勾勒轮廓，AI 就能为你“注入灵魂”，让创意跃然纸上。</p>
								</div>

								<div className="mt-8">
									<Button className="w-full gap-2 group" onClick={onClose}>
										<Sparkles className="h-4 w-4 group-hover:animate-pulse" />
										开始创作奇迹
									</Button>
								</div>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	)
}

export default MaLiangIntroduction
