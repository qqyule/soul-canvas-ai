/**
 * 数据库连接入口
 * @description 初始化 Drizzle ORM 与 Neon PostgreSQL 的连接
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

/**
 * 获取数据库连接 URL
 * @throws 如果未配置 DATABASE_URL 环境变量
 */
const getDatabaseUrl = (): string => {
	const url = import.meta.env.VITE_DATABASE_URL
	if (!url) {
		throw new Error('未配置数据库连接，请设置 VITE_DATABASE_URL 环境变量')
	}
	return url
}

/**
 * 创建数据库连接
 * @description 使用懒加载模式，首次访问时才创建连接
 */
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

/**
 * 获取数据库实例
 * @description 单例模式，确保整个应用共享同一个数据库连接
 */
export const getDb = () => {
	if (!_db) {
		const sql = neon(getDatabaseUrl())
		_db = drizzle(sql, { schema })
	}
	return _db
}

/**
 * 数据库实例
 * @description 直接导出的数据库实例，方便使用
 * @warning 仅在确保环境变量已配置时使用
 */
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
	get(_, prop) {
		return (getDb() as Record<string | symbol, unknown>)[prop]
	},
})

// 导出 schema 供外部使用
export { schema }
