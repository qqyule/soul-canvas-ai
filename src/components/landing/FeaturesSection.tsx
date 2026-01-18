import { motion } from 'framer-motion'
import { Brush, Palette, BookOpen, Check } from 'lucide-react'

/**
 * 功能展示配置
 */
const features = [
	{
		number: '01',
		icon: Brush,
		title: '草图转艺术',
		description: '简单几笔涂鸦，AI 理解你的创意并生成专业级画作',
		highlights: ['无需绘画基础', '智能识别草图意图', '秒级生成高清图像'],
		gradient: 'from-cyan-500 to-blue-500',
	},
	{
		number: '02',
		icon: Palette,
		title: '多风格生成',
		description: '20+ 种 AI 艺术风格任选，从写实到抽象应有尽有',
		highlights: ['吉卜力动画风', '赛博朋克科幻', '水彩油画质感'],
		gradient: 'from-purple-500 to-pink-500',
	},
	{
		number: '03',
		icon: BookOpen,
		title: '故事绘本',
		description: '一键生成配音绘本，让创意变成可分享的故事',
		highlights: ['AI 自动生成故事', '专业配音朗读', '支持 45+ 种语言'],
		gradient: 'from-pink-500 to-orange-500',
	},
]

/**
 * 功能展示区组件
 * 展示产品的三大核心功能
 */
export const FeaturesSection = () => {
	return (
		<section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
			{/* 背景装饰 */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

			<div className="max-w-7xl mx-auto relative">
				{/* 区域标题 */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-100px' }}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
						<span className="animate-pulse">✦</span>
						<span>三种创作魔法</span>
					</span>
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
						释放你的<span className="text-gradient">创意潜能</span>
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						从涂鸦到艺术，只需几秒钟
					</p>
				</motion.div>

				{/* 功能卡片网格 */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{features.map((feature, index) => (
						<motion.div
							key={feature.number}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-50px' }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							className="group relative"
						>
							{/* 卡片容器 */}
							<div className="relative h-full p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-glow-sm card-float">
								{/* 编号 */}
								<span
									className={`text-6xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent opacity-20 group-hover:opacity-40 transition-opacity absolute top-4 right-6`}
								>
									{feature.number}
								</span>

								{/* 图标 */}
								<div
									className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}
								>
									<feature.icon className="w-7 h-7 text-white" />
								</div>

								{/* 标题 */}
								<h3 className="text-xl font-bold text-foreground mb-3">
									{feature.title}
								</h3>

								{/* 描述 */}
								<p className="text-muted-foreground mb-6 leading-relaxed">
									{feature.description}
								</p>

								{/* 功能亮点 */}
								<ul className="space-y-2">
									{feature.highlights.map((highlight, i) => (
										<li
											key={i}
											className="flex items-center gap-2 text-sm text-muted-foreground"
										>
											<Check className="w-4 h-4 text-primary flex-shrink-0" />
											<span>{highlight}</span>
										</li>
									))}
								</ul>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}
