import { driver } from 'driver.js'
import { useEffect } from 'react'
import 'driver.js/dist/driver.css'

const HAS_SEEN_ONBOARDING_KEY = 'hasSeenOnboarding'

const OnboardingTour = () => {
	useEffect(() => {
		const hasSeenOnboarding = localStorage.getItem(HAS_SEEN_ONBOARDING_KEY)

		if (hasSeenOnboarding) {
			return
		}

		const driverObj = driver({
			showProgress: true,
			doneBtnText: '完成',
			nextBtnText: '下一步',
			prevBtnText: '上一步',
			steps: [
				{
					popover: {
						title: '欢迎来到 Soul Canvas! 👋',
						description:
							'这里是一个将您的草图转化为精美 AI 艺术作品的地方。让我们花一分钟了解基本功能吧！',
					},
				},
				{
					element: '#tour-canvas',
					popover: {
						title: '创意画布',
						description: '在这里尽情挥洒您的创意！即使只是简单的线条，AI 也能理解您的意图。',
						side: 'right',
						align: 'start',
					},
				},
				{
					element: '#tour-prompt',
					popover: {
						title: '创意描述',
						description: '用文字描述您的想法，帮助 AI 更准确地生成您心目中的画面。',
						side: 'bottom',
						align: 'start',
					},
				},
				{
					element: '#tour-style',
					popover: {
						title: '风格选择',
						description: '选择不同的艺术风格，让您的作品呈现多样化的视觉效果。',
						side: 'left',
						align: 'start',
					},
				},
				{
					element: '#tour-history',
					popover: {
						title: '历史记录',
						description: '您生成的所有作品都会保存在这里，随时回顾您的创作历程。',
						side: 'bottom',
						align: 'end',
					},
				},
				{
					element: '#tour-generate',
					popover: {
						title: '开始生成',
						description: '准备好后，点击这里，见证奇迹发生的时刻！✨',
						side: 'top',
						align: 'center',
					},
				},
			],
			onDestroyStarted: () => {
				localStorage.setItem(HAS_SEEN_ONBOARDING_KEY, 'true')
				driverObj.destroy()
			},
		})

		driverObj.drive()

		return () => {
			driverObj.destroy()
		}
	}, [])

	return null
}

export default OnboardingTour
