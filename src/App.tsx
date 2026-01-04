import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import ThreeBackground from '@/components/effects/ThreeBackground'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { useUserSync } from '@/hooks/useUserSync'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import AuthLayout from './components/layout/AuthLayout'
import Login from './pages/auth/Login'
import SignUpPage from './pages/auth/SignUp'

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
			<ThreeBackground />
			<Toaster />
			<Sonner />
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Index />} />

					{/* 认证路由 */}
					<Route path="/auth" element={<AuthLayout />}>
						<Route path="sign-in/*" element={<Login />} />
						<Route path="sign-up/*" element={<SignUpPage />} />
					</Route>

					{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
					<Route path="*" element={<NotFound />} />
				</Routes>
			</BrowserRouter>
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
