import { motion } from 'framer-motion'
import { Pencil, Wand2, Sparkles } from 'lucide-react'

/**
 * 步骤配置
 */
const steps = [
	{
		step: 1,
		icon: Pencil,
		title: '画出想法',
		description: '在画布上随意涂鸦，不需要画得完美，简单的线条就够了',
		color: 'from-cyan-400 to-cyan-600',
	},
	{
		step: 2,
		icon: Wand2,
		title: '选择风格',
		description: '从 20+ 种 AI 艺术风格中选择你喜欢的，或让 AI 为你推荐',
		color: 'from-purple-400 to-purple-600',
	},
	{
		step: 3,
		icon: Sparkles,
		title: '一键生成',
		description: 'AI 将你的草图变成令人惊艳的艺术作品，只需几秒钟',
		color: 'from-pink-400 to-pink-600',
	},
]

/**
 * 使用步骤区组件
 * 展示 1-2-3 简单操作流程
 */
export const HowItWorksSection = () => {
	return (
		<section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20 relative overflow-hidden">
			{/* 背景网格 */}
			<div className="absolute inset-0 bg-grid-pattern bg-grid opacity-5 pointer-events-none" />

			<div className="max-w-7xl mx-auto relative">
				{/* 区域标题 */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-100px' }}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-sm text-secondary mb-4">
						<span>🪄</span>
						<span>简单三步</span>
					</span>
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
						<span className="text-gradient">秒级</span>创作魔法
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						无需复杂操作，三步开启你的 AI 艺术之旅
					</p>
				</motion.div>

				{/* 步骤流程 */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative">
					{/* 连接线 (仅桌面端) */}
					<div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-30" />

					{steps.map((step, index) => (
						<motion.div
							key={step.step}
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-50px' }}
							transition={{ duration: 0.5, delay: index * 0.15 }}
							className="relative text-center"
						>
							{/* 步骤编号圆圈 */}
							<div className="relative mx-auto mb-8">
								<div
									className={`w-20 h-20 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center mx-auto shadow-lg`}
								>
									<step.icon className="w-9 h-9 text-white" />
								</div>
								{/* 步骤数字 */}
								<div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center text-sm font-bold text-primary">
									{step.step}
								</div>
							</div>

							{/* 标题 */}
							<h3 className="text-xl font-bold text-foreground mb-3">
								{step.title}
							</h3>

							{/* 描述 */}
							<p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
								{step.description}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}
