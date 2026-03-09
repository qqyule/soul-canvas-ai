import type { KieTaskResultResponse, KieTaskState } from '@/types/api-node'

const KIE_SUCCESS_STATES = new Set<KieTaskState>(['success'])
const KIE_FAILURE_STATES = new Set<KieTaskState>(['fail', 'failed'])
const KIE_PENDING_STATES = new Set<KieTaskState>([
	'waiting',
	'queuing',
	'generating',
	'pending',
	'processing',
])

export function isKieTaskSuccess(state: KieTaskState): boolean {
	return KIE_SUCCESS_STATES.has(state)
}

export function isKieTaskFailure(state: KieTaskState): boolean {
	return KIE_FAILURE_STATES.has(state)
}

export function isKieTaskPending(state: KieTaskState): boolean {
	if (KIE_PENDING_STATES.has(state)) {
		return true
	}

	if (!isKieTaskSuccess(state) && !isKieTaskFailure(state)) {
		console.warn(`[kie-task] 遇到未识别的任务状态，按 pending 继续轮询: ${state}`)
		return true
	}

	return false
}

export function extractKieResultUrls(result: KieTaskResultResponse): string[] {
	const { resultJson } = result.data

	if (!resultJson) {
		throw new Error('任务完成但未返回 resultJson')
	}

	let parsed: { resultUrls?: string[] }
	try {
		parsed = JSON.parse(resultJson) as { resultUrls?: string[] }
	} catch (error) {
		throw new Error(
			`任务完成但 resultJson 无法解析: ${error instanceof Error ? error.message : String(error)}`
		)
	}

	if (!parsed.resultUrls || parsed.resultUrls.length === 0) {
		throw new Error('任务完成但未返回结果 URL')
	}

	return parsed.resultUrls
}
