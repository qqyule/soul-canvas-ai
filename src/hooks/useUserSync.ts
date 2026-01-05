import { useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { usersRepository } from '@/db/repositories/users'
import { useToast } from '@/hooks/use-toast'

/**
 * 用户同步 Hook
 * @description 监听 Clerk 登录状态，并将用户信息通过 Drizzle 同步到 Neon 数据库
 */
export const useUserSync = () => {
	const { user, isLoaded } = useUser()
	const [isSynced, setIsSynced] = useState(false)
	const { toast } = useToast()

	useEffect(() => {
		const syncUser = async () => {
			if (!isLoaded || !user) return

			// 避免重复同步 (简单防抖，实际可能需要更复杂的逻辑)
			// 注意：如果用户更新了资料，Clerk 的 user 对象会变，这里也会重新运行更新 DB，这是预期的
			if (isSynced) return

			try {
				const email = user.primaryEmailAddress?.emailAddress
				if (!email) {
					console.warn('User has no primary email, skipping sync')
					return
				}

				await usersRepository.upsertByEmail({
					id: user.id, // Clerk User ID 作为主键
					email,
					name: user.fullName || user.username || 'User',
					avatarUrl: user.imageUrl,
					provider: 'clerk',
					providerId: user.id,
				})

				setIsSynced(true)
				console.log('User synced to Neon database:', email)
			} catch (error) {
				console.error('Failed to sync user to database:', error)
				toast({
					title: '用户数据同步失败',
					description: '无法将您的账户信息保存至数据库，请尝试刷新页面。',
					variant: 'destructive',
				})
			}
		}

		syncUser()
	}, [user, isLoaded, isSynced, toast])

	return { isSynced }
}
