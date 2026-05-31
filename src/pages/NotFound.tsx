import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const NotFound = () => {
	// 获取当前尝试访问的路径，用于展示给用户
	const location = useLocation()

	useEffect(() => {
		document.title = '页面未找到 - 神笔马良'
	}, [])

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted">
			<div className="text-center">
				<h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
				<p className="mb-6 text-xl text-muted-foreground">抱歉，您访问的页面不存在</p>
				{/* 显示用户尝试访问的具体路径，帮助用户定位问题 */}
				<p className="mb-6 rounded-lg bg-muted-foreground/10 px-4 py-2 font-mono text-sm text-muted-foreground">
					{location.pathname}
				</p>
				<a
					href="/"
					className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
				>
					返回首页
				</a>
			</div>
		</div>
	)
}

export default NotFound
