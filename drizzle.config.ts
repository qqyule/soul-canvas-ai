/**
 * Drizzle Kit 配置文件
 * @description 用于数据库迁移和 Schema 管理
 */

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	// Schema 文件位置
	schema: './src/db/schema/*',
	// 迁移文件输出目录
	out: './drizzle',
	// 数据库类型
	dialect: 'postgresql',
	// 数据库连接配置
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
	// 详细输出
	verbose: true,
	// 严格模式
	strict: true,
})
