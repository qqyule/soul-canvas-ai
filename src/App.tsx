import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import ParticleBackground from '@/components/effects/ParticleBackground'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useUserSync } from '@/hooks/useUserSync'

const ThreeBackground = lazy(() => import('@/components/effects/ThreeBackground'))
const AuthLayout = lazy(() => import('./components/layout/AuthLayout'))
const Login = lazy(() => import('./pages/auth/Login'))
const SignUpPage = lazy(() => import('./pages/auth/SignUp'))
const CommunityPage = lazy(() => import('./pages/Community'))
const Index = lazy(() => import('./pages/Index'))
const NotFound = lazy(() => import('./pages/NotFound'))
const StorybookReader = lazy(() => import('./pages/StorybookReader'))

const queryClient = new QueryClient()

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
	throw new Error('Missing Publishable Key')
}

// 内部组件，确保可以使用 Clerk 的 hook
const AppContent = () => {
	// 启用用户同步
	useUserSync()

	return (
		<TooltipProvider>
			<Suspense fallback={null}>
				<ThreeBackground />
			</Suspense>
			<ParticleBackground count={15} />
			<Toaster />
			<Sonner />
			<HashRouter>
				<Suspense fallback={null}>
					<Routes>
						<Route path="/" element={<Index />} />

						{/* 社区画廊 */}
						<Route path="/community" element={<CommunityPage />} />
						<Route path="/community/:artworkId" element={<CommunityPage />} />

						{/* 用户资料 */}
						<Route path="/user/:userId" element={<CommunityPage />} />

						{/* 有声书阅读器 */}
						<Route path="/storybook/:storybookId" element={<StorybookReader />} />

						{/* 认证路由 */}
						<Route path="/auth" element={<AuthLayout />}>
							<Route path="sign-in/*" element={<Login />} />
							<Route path="sign-up/*" element={<SignUpPage />} />
						</Route>

						{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
						<Route path="*" element={<NotFound />} />
					</Routes>
				</Suspense>
			</HashRouter>
		</TooltipProvider>
	)
}

const App = () => (
	<ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
		<QueryClientProvider client={queryClient}>
			<AppContent />
		</QueryClientProvider>
	</ClerkProvider>
)

export default App
