// @vitest-environment jsdom

import { useUser } from '@clerk/clerk-react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import UserProfile from '../UserProfile'
import '@testing-library/jest-dom'

// Mock Clerk components
vi.mock('@clerk/clerk-react', () => ({
	useUser: vi.fn(),
	UserButton: () => (
		<button type="button" data-testid="user-button">
			User Btn
		</button>
	),
	SignInButton: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="sign-in-btn">{children}</div>
	),
	SignedIn: ({ children }: { children: React.ReactNode }) => {
		const { isSignedIn } = useUser()
		return isSignedIn ? children : null
	},
	SignedOut: ({ children }: { children: React.ReactNode }) => {
		const { isSignedIn } = useUser()
		return !isSignedIn ? children : null
	},
}))

describe('UserProfile', () => {
	it('renders login button when signed out', () => {
		vi.mocked(useUser).mockReturnValue({
			isLoaded: true,
			isSignedIn: false,
			user: null,
		} as unknown as ReturnType<typeof useUser>)

		render(<UserProfile />)
		expect(screen.getByTestId('sign-in-btn')).toBeInTheDocument()
		expect(screen.getByText('登录')).toBeInTheDocument()
	})

	it('renders user button when signed in', () => {
		vi.mocked(useUser).mockReturnValue({
			isLoaded: true,
			isSignedIn: true,
			user: {
				id: 'user_123',
				fullName: 'Test User',
				primaryEmailAddress: { emailAddress: 'test@example.com' },
			},
		} as unknown as ReturnType<typeof useUser>)

		render(<UserProfile />)
		expect(screen.getByTestId('user-button')).toBeInTheDocument()
	})

	it('renders user name when signed in', () => {
		vi.mocked(useUser).mockReturnValue({
			isLoaded: true,
			isSignedIn: true,
			user: {
				id: 'user_123',
				fullName: 'Test User',
				primaryEmailAddress: { emailAddress: 'test@example.com' },
			},
		} as unknown as ReturnType<typeof useUser>)

		render(<UserProfile />)
		expect(screen.getByText('Test User')).toBeInTheDocument()
	})
})
