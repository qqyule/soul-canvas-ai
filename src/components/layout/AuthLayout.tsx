import { Outlet } from 'react-router-dom'

/**
 * 认证页面布局组件
 * @description 用于登录/注册页面的通用布局，可以添加背景、Logo 等
 */
const AuthLayout = () => {
	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-background">
			<div className="w-full max-w-md space-y-8 px-4 py-8 sm:px-0">
				{/* 可以在这里添加 Logo */}
				<div className="text-center">
					<h2 className="text-2xl font-bold tracking-tight text-foreground">
						Soul Canvas AI
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">释放你的创意灵魂</p>
				</div>

				{/* 子路由内容 (SignIn/SignUp) */}
				<div className="flex justify-center">
					<Outlet />
				</div>
			</div>
		</div>
	)
}

export default AuthLayout
