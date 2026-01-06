import { SignIn } from '@clerk/clerk-react'

/**
 * 登录页面
 * @description 集成 Clerk 的 SignIn 组件
 */
const Login = () => {
	return (
		<SignIn
			appearance={{
				elements: {
					rootBox: 'mx-auto',
					card: 'shadow-none border border-border bg-card',
					headerTitle: 'text-foreground',
					headerSubtitle: 'text-muted-foreground',
					socialButtonsBlockButton: 'text-foreground border-border hover:bg-accent',
					dividerLine: 'bg-border',
					dividerText: 'text-muted-foreground',
					formFieldLabel: 'text-foreground',
					formFieldInput: 'bg-background border-border text-foreground',
					footerActionText: 'text-muted-foreground',
					footerActionLink: 'text-primary hover:text-primary/90',
				},
			}}
			signUpUrl="/auth/sign-up"
			path="/auth/sign-in"
			routing="path"
		/>
	)
}

export default Login
