import { motion } from 'framer-motion'
import { STYLE_PRESETS } from '@/types/canvas'

/**
 * 风格画廊区组件
 * 展示可用的 AI 艺术风格示例
 */
export const StyleGallerySection = () => {
	// 只展示前 8 个风格
	const displayStyles = STYLE_PRESETS.slice(0, 8)

	return (
		<section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
			{/* 渐变背景 */}
			<div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

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
						<span>🎨</span>
						<span>多样风格</span>
					</span>
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
						<span className="text-gradient">20+</span> 种艺术风格
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						从经典写实到前卫抽象，总有一款适合你的创意
					</p>
				</motion.div>

				{/* 风格网格 */}
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
					{displayStyles.map((style, index) => (
						<motion.div
							key={style.id}
							initial={{ opacity: 0, scale: 0.9 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true, margin: '-30px' }}
							transition={{ duration: 0.4, delay: index * 0.05 }}
							className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer"
						>
							{/* 预览图 */}
							<img
								src={style.imageUrl}
								alt={style.name}
								className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
							/>

							{/* 悬浮遮罩 */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

							{/* 风格名称 */}
							<div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
								<h3 className="text-white font-bold text-lg mb-1">
									{style.nameZh}
								</h3>
								<p className="text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
									{style.descriptionZh}
								</p>
							</div>

							{/* 悬浮边框 */}
							<div className="absolute inset-0 border-2 border-transparent group-hover:border-primary rounded-2xl transition-colors" />
						</motion.div>
					))}
				</div>

				{/* 查看更多提示 */}
				<motion.p
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.5 }}
					className="text-center mt-8 text-muted-foreground"
				>
					还有更多风格等你探索...
				</motion.p>
			</div>
		</section>
	)
}
