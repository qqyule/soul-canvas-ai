import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

/**
 * 模拟用户评价数据
 */
const testimonials = [
	{
		id: 1,
		name: '小明妈妈',
		avatar: '👩‍👧',
		rating: 5,
		content:
			'孩子随手画的小猫咪，转眼就变成了精美的插画，他开心得不得了！这个工具太神奇了。',
	},
	{
		id: 2,
		name: '设计师阿杰',
		avatar: '👨‍🎨',
		rating: 5,
		content:
			'作为设计师，我经常用它来快速验证创意概念。草图到渲染图只需几秒，大大提升了工作效率。',
	},
	{
		id: 3,
		name: '绘本作者莉莉',
		avatar: '👩‍💼',
		rating: 5,
		content:
			'故事绘本功能简直是给创作者的礼物！自动生成的故事配合 AI 配音，省了我好多工作量。',
	},
	{
		id: 4,
		name: '老师张先生',
		avatar: '👨‍🏫',
		rating: 4,
		content:
			'在美术课上用这个工具，学生们的参与度提高了好多。即使画得不好，AI 也能帮他们实现创意。',
	},
	{
		id: 5,
		name: '创业者小王',
		avatar: '🧑‍💻',
		rating: 5,
		content:
			'用来做产品原型图太方便了，简单勾勒几笔就能看到高保真效果，强烈推荐！',
	},
	{
		id: 6,
		name: '自媒体博主',
		avatar: '📱',
		rating: 5,
		content:
			'封面图不用愁了！随便画个想法，选个风格，几秒就出图，粉丝都说我的封面越来越有特色。',
	},
]

/**
 * 用户评价区组件
 * 展示用户好评增强信任
 */
export const TestimonialsSection = () => {
	return (
		<section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20 relative overflow-hidden">
			{/* 背景装饰 */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent pointer-events-none" />

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
						<span>💬</span>
						<span>用户心声</span>
					</span>
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
						他们都在<span className="text-gradient">这样说</span>
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						来自创作者、设计师、家长的真实反馈
					</p>
				</motion.div>

				{/* 评价卡片网格 */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{testimonials.map((testimonial, index) => (
						<motion.div
							key={testimonial.id}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-30px' }}
							transition={{ duration: 0.4, delay: index * 0.08 }}
							className="group"
						>
							<div className="h-full p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-glow-sm">
								{/* 头部：头像 + 名称 + 评分 */}
								<div className="flex items-center gap-3 mb-4">
									<span className="text-3xl">{testimonial.avatar}</span>
									<div>
										<h4 className="font-semibold text-foreground">
											{testimonial.name}
										</h4>
										<div className="flex items-center gap-0.5">
											{Array.from({ length: 5 }).map((_, i) => (
												<Star
													key={i}
													className={`w-3 h-3 ${
														i < testimonial.rating
															? 'text-yellow-500 fill-yellow-500'
															: 'text-muted-foreground'
													}`}
												/>
											))}
										</div>
									</div>
								</div>

								{/* 评价内容 */}
								<p className="text-muted-foreground leading-relaxed">
									"{testimonial.content}"
								</p>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}
