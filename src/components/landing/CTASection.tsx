import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { MotionButton } from '@/components/ui/motion-button'

/**
 * 底部 CTA 区组件
 * 行动号召，引导用户开始创作
 */
export const CTASection = () => {
	const handleScrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' })
	}

	return (
		<section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
			{/* 渐变背景 */}
			<div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-primary/10 to-secondary/10 pointer-events-none" />

			{/* 装饰光晕 */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
			<div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

			<div className="max-w-4xl mx-auto text-center relative">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-100px' }}
					transition={{ duration: 0.6 }}
				>
					{/* 徽章 */}
					<span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6">
						<Sparkles className="w-4 h-4" />
						<span>准备好了吗？</span>
					</span>

					{/* 主标题 */}
					<h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
						开始你的
						<br />
						<span className="text-gradient">AI 艺术之旅</span>
					</h2>

					{/* 副标题 */}
					<p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
						无需注册，无需下载，打开即用
						<br />让 AI 帮你把想象变成现实
					</p>

					{/* CTA 按钮 */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.3, duration: 0.5 }}
					>
						<MotionButton
							size="lg"
							onClick={handleScrollToTop}
							className="group px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-glow"
						>
							<span>立即开始创作</span>
							<ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
						</MotionButton>
					</motion.div>

					{/* 补充说明 */}
					<p className="mt-6 text-sm text-muted-foreground">
						🎁 免费试用 · ⚡ 秒级生成 · 🔒 隐私保护
					</p>
				</motion.div>
			</div>
		</section>
	)
}
