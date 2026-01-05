/**
 * Drizzle Kit 配置文件
 * @description 用于数据库迁移和 Schema 管理
 */

import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// 加载环境变量（按优先级：.env.local > .env）
config({ path: '.env.local' })
config({ path: '.env' })

// 尝试从多个环境变量来源获取数据库 URL
const databaseUrl = process.env.DATABASE_URL || process.env.VITE_DATABASE_URL

if (!databaseUrl) {
	console.error('❌ 未找到数据库连接 URL')
	console.error('请在 .env.local 中设置 DATABASE_URL 或 VITE_DATABASE_URL')
	process.exit(1)
}

export default defineConfig({
	// Schema 文件位置
	schema: './src/db/schema/*',
	// 迁移文件输出目录
	out: './drizzle',
	// 数据库类型
	dialect: 'postgresql',
	// 数据库连接配置
	dbCredentials: {
		url: databaseUrl,
	},
	// 详细输出
	verbose: true,
	// 严格模式
	strict: true,
})
