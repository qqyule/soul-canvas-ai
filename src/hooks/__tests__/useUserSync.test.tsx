// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUserSync } from '../useUserSync'
import { usersRepository } from '@/db/repositories/users'
import { useUser } from '@clerk/clerk-react'

// Mock dependencies
vi.mock('@/db/repositories/users', () => ({
	usersRepository: {
		upsertByEmail: vi.fn(),
	},
}))

vi.mock('@clerk/clerk-react', () => ({
	useUser: vi.fn(),
}))

describe('useUserSync', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should do nothing if Clerk is not loaded', () => {
		vi.mocked(useUser).mockReturnValue({
			isLoaded: false,
			isSignedIn: false,
			user: null,
		} as any)

		renderHook(() => useUserSync())

		expect(usersRepository.upsertByEmail).not.toHaveBeenCalled()
	})

	it('should do nothing if user is not signed in (user is null)', () => {
		vi.mocked(useUser).mockReturnValue({
			isLoaded: true,
			isSignedIn: false,
			user: null,
		} as any)

		renderHook(() => useUserSync())

		expect(usersRepository.upsertByEmail).not.toHaveBeenCalled()
	})

	it('should sync user if signed in and has email', () => {
		const mockUser = {
			id: 'user_123',
			fullName: 'Test User',
			username: 'testuser',
			imageUrl: 'https://example.com/avatar.jpg',
			primaryEmailAddress: {
				emailAddress: 'test@example.com',
			},
		}

		vi.mocked(useUser).mockReturnValue({
			isLoaded: true,
			isSignedIn: true,
			user: mockUser,
		} as any)

		renderHook(() => useUserSync())

		expect(usersRepository.upsertByEmail).toHaveBeenCalledTimes(1)
		expect(usersRepository.upsertByEmail).toHaveBeenCalledWith({
			email: 'test@example.com',
			name: 'Test User',
			avatarUrl: 'https://example.com/avatar.jpg',
			provider: 'clerk',
			providerId: 'user_123',
		})
	})

	it('should handle sync error gracefully', async () => {
		const mockUser = {
			id: 'user_123',
			primaryEmailAddress: { emailAddress: 'test@example.com' },
		}

		vi.mocked(useUser).mockReturnValue({
			isLoaded: true,
			isSignedIn: true,
			user: mockUser,
		} as any)

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.mocked(usersRepository.upsertByEmail).mockRejectedValueOnce(
			new Error('DB Error')
		)

		renderHook(() => useUserSync())

		await waitFor(() => {
			expect(usersRepository.upsertByEmail).toHaveBeenCalled()
		})

		expect(consoleSpy).toHaveBeenCalled()
		consoleSpy.mockRestore()
	})
})
