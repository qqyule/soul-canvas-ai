import { motion } from 'framer-motion'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'

/**
 * FAQ 数据
 */
const faqs = [
	{
		question: '这个工具免费吗？',
		answer:
			'是的！我们提供慷慨的免费额度。游客每天可生成 10 次，登录用户每天可生成 50 次。如果你给我们的 GitHub 项目加 Star，还能解锁每天 1000 次的超级额度！',
	},
	{
		question: '生成的图片可以商用吗？',
		answer:
			'当然可以！你创作的所有图片归你所有，可以自由使用，包括商业用途。不过请注意，生成内容需要符合我们的使用条款。',
	},
	{
		question: '支持哪些输出格式？',
		answer:
			'目前支持 PNG、JPG 格式导出。故事绘本还支持 PDF 导出和音频下载。我们正在开发更多格式支持，敬请期待！',
	},
	{
		question: '如何获得更多生成次数？',
		answer:
			'有三种方式：1) 注册登录获得每日 50 次；2) 给 GitHub 项目加 Star 获得每日 1000 次；3) 每天 0 点会重置次数，记得回来哦！',
	},
	{
		question: '我的画作会被保存吗？',
		answer:
			'你的草图会临时保存在浏览器本地，方便你下次继续创作。生成的作品会保存在历史记录中。我们不会将你的作品用于其他用途，请放心使用。',
	},
	{
		question: 'AI 生成需要多长时间？',
		answer:
			'通常只需 3-10 秒即可完成生成，具体时间取决于服务器负载和你选择的风格复杂度。批量生成会稍长一些。',
	},
]

/**
 * FAQ 区组件
 * 展示常见问题解答
 */
export const FAQSection = () => {
	return (
		<section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
			{/* 背景装饰 */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

			<div className="max-w-3xl mx-auto relative">
				{/* 区域标题 */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-100px' }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12"
				>
					<span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
						<span>❓</span>
						<span>常见问题</span>
					</span>
					<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
						你可能想问
					</h2>
				</motion.div>

				{/* FAQ 手风琴 */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-50px' }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<Accordion type="single" collapsible className="space-y-4">
						{faqs.map((faq, index) => (
							<AccordionItem
								key={index}
								value={`item-${index}`}
								className="rounded-xl bg-card/50 border border-border/50 px-6 backdrop-blur-sm data-[state=open]:border-primary/30 transition-colors"
							>
								<AccordionTrigger className="text-left font-medium text-foreground hover:text-primary py-5">
									{faq.question}
								</AccordionTrigger>
								<AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
									{faq.answer}
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</motion.div>
			</div>
		</section>
	)
}
