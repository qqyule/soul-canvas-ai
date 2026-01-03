import { SignUp } from '@clerk/clerk-react'

/**
 * 注册页面
 * @description 集成 Clerk 的 SignUp 组件
 */
const SignUpPage = () => {
	return (
		<SignUp
			appearance={{
				elements: {
					rootBox: 'mx-auto',
					card: 'shadow-none border border-border bg-card',
					headerTitle: 'text-foreground',
					headerSubtitle: 'text-muted-foreground',
					socialButtonsBlockButton:
						'text-foreground border-border hover:bg-accent',
					dividerLine: 'bg-border',
					dividerText: 'text-muted-foreground',
					formFieldLabel: 'text-foreground',
					formFieldInput: 'bg-background border-border text-foreground',
					footerActionText: 'text-muted-foreground',
					footerActionLink: 'text-primary hover:text-primary/90',
				},
			}}
			signInUrl="/auth/sign-in"
			path="/auth/sign-up"
			routing="path"
		/>
	)
}

export default SignUpPage
