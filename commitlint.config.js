export default {
	extends: ['@commitlint/config-conventional'],
	rules: {
		// 允许中文 commit message
		'subject-case': [0],
		'header-max-length': [2, 'always', 100],
	},
}
