import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'

/**
 * 用户资料/登录按钮组件
 * @description 根据登录状态显示用户头像或登录按钮
 */
const UserProfile = () => {
	const { user } = useUser()

	return (
		<div className="flex items-center gap-4">
			<SignedIn>
				<div className="flex items-center gap-2">
					<span className="hidden text-sm font-medium text-muted-foreground md:inline-block">
						{user?.fullName || user?.username}
					</span>
					<UserButton
						afterSignOutUrl="/"
						appearance={{
							elements: {
								avatarBox: 'h-8 w-8',
							},
						}}
					/>
				</div>
			</SignedIn>
			<SignedOut>
				<SignInButton mode="modal">
					<Button variant="default" size="sm">
						登录
					</Button>
				</SignInButton>
			</SignedOut>
		</div>
	)
}

export default UserProfile
