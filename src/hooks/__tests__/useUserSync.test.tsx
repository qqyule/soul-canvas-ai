// @vitest-environment jsdom

import { useUser } from '@clerk/clerk-react'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usersRepository } from '@/db/repositories/users'
import { useUserSync } from '../useUserSync'

// Mock dependencies
vi.mock('@/db/repositories/users', () => ({
	usersRepository: {
		upsertByEmail: vi.fn(),
	},
}))

vi.mock('@clerk/clerk-react', () => ({
	useUser: vi.fn(),
}))

vi.mock('@/hooks/use-toast', () => ({
	useToast: vi.fn(() => ({
		toast: vi.fn(),
	})),
}))

type UserMock = {
	id: string
	fullName: string | null
	username: string | null
	imageUrl: string
	primaryEmailAddress: {
		emailAddress: string
	} | null
}

describe('useUserSync', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('should do nothing if Clerk is not loaded', () => {
		vi.mocked(useUser).mockReturnValue({
			isLoaded: false,
			isSignedIn: false,
			user: null,
		} as unknown as ReturnType<typeof useUser>)

		renderHook(() => useUserSync())

		expect(usersRepository.upsertByEmail).not.toHaveBeenCalled()
	})

	it('should do nothing if user is not signed in (user is null)', () => {
		vi.mocked(useUser).mockReturnValue({
			isLoaded: true,
			isSignedIn: false,
			user: null,
		} as unknown as ReturnType<typeof useUser>)

		renderHook(() => useUserSync())

		expect(usersRepository.upsertByEmail).not.toHaveBeenCalled()
	})

	it('should sync user if signed in and has email', () => {
		const mockUser: UserMock = {
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
		} as unknown as ReturnType<typeof useUser>)

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
		const mockUser: UserMock = {
			id: 'user_123',
			fullName: 'Test User',
			username: 'testuser',
			imageUrl: 'https://example.com/avatar.jpg',
			primaryEmailAddress: { emailAddress: 'test@example.com' },
		}

		vi.mocked(useUser).mockReturnValue({
			isLoaded: true,
			isSignedIn: true,
			user: mockUser,
		} as unknown as ReturnType<typeof useUser>)

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
		vi.mocked(usersRepository.upsertByEmail).mockRejectedValueOnce(new Error('DB Error'))

		renderHook(() => useUserSync())

		await waitFor(() => {
			expect(usersRepository.upsertByEmail).toHaveBeenCalled()
		})

		expect(consoleSpy).toHaveBeenCalled()
		consoleSpy.mockRestore()
	})
})
