import { Github } from 'lucide-react'
import { GITHUB_REPO_URL } from '@/lib/storage'

/**
 * 页脚组件
 * 包含版权信息、社交链接等
 */
export const Footer = () => {
	const currentYear = new Date().getFullYear()

	return (
		<footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row items-center justify-between gap-6">
					{/* 左侧：品牌信息 */}
					<div className="flex flex-col items-center md:items-start gap-2">
						<div className="flex items-center gap-2 text-foreground font-bold text-xl">
							<span className="text-2xl">🎨</span>
							<span>Soul Canvas AI</span>
						</div>
						<p className="text-sm text-muted-foreground">让创意触手可及</p>
					</div>

					{/* 中间：链接 */}
					<div className="flex items-center gap-6 text-sm text-muted-foreground">
						<a
							href={GITHUB_REPO_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 hover:text-foreground transition-colors"
						>
							<Github className="w-4 h-4" />
							<span>GitHub</span>
						</a>
						<span className="hidden sm:inline">·</span>
						<span className="hidden sm:inline">大模型：Google Nano Banana Pro</span>
					</div>

					{/* 右侧：版权 */}
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<span>© {currentYear}</span>
						<span className="flex items-center gap-1">Made by Leo</span>
					</div>
				</div>
			</div>
		</footer>
	)
}
