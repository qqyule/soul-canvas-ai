// @vitest-environment jsdom
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import UserProfile from '../UserProfile'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react'
import '@testing-library/jest-dom'

// Mock Clerk components
vi.mock('@clerk/clerk-react', () => ({
	useUser: vi.fn(),
	UserButton: () => <button data-testid="user-button">User Btn</button>,
	SignInButton: ({ children }: any) => (
		<div data-testid="sign-in-btn">{children}</div>
	),
	SignedIn: ({ children }: any) => {
		const { isSignedIn } = useUser()
		return isSignedIn ? <>{children}</> : null
	},
	SignedOut: ({ children }: any) => {
		const { isSignedIn } = useUser()
		return !isSignedIn ? <>{children}</> : null
	},
}))

describe('UserProfile', () => {
	it('renders Login button when signed out', () => {
		vi.mocked(useUser).mockReturnValue({
			isSignedIn: false,
			user: null,
		} as any)

		render(<UserProfile />)

		expect(screen.getByText('登录')).toBeInTheDocument()
		expect(screen.queryByTestId('user-button')).not.toBeInTheDocument()
	})

	it('renders UserButton and Name when signed in', () => {
		vi.mocked(useUser).mockReturnValue({
			isSignedIn: true,
			user: {
				fullName: 'Alice',
				username: 'alice123',
			},
		} as any)

		render(<UserProfile />)

		expect(screen.getByTestId('user-button')).toBeInTheDocument()
		expect(screen.getByText('Alice')).toBeInTheDocument()
	})

	it('renders Username if FullName is missing', () => {
		vi.mocked(useUser).mockReturnValue({
			isSignedIn: true,
			user: {
				fullName: null,
				username: 'bob_artist',
			},
		} as any)

		render(<UserProfile />)

		expect(screen.getByText('bob_artist')).toBeInTheDocument()
	})
})
