/**
 * IndexedDB 历史记录存储模块
 * 使用 idb 库封装，提供异步非阻塞的存储操作
 */

import { openDB, type IDBPDatabase } from 'idb'
import type { StylePreset } from '@/types/canvas'

// ==================== 类型定义 ====================

/**
 * 历史记录项
 */
export interface HistoryItem {
	/** 唯一标识符 */
	id: string
	/** 草图缩略图 Blob */
	sketchBlob: Blob
	/** 生成结果图片 Blob */
	resultBlob: Blob
	/** 草图 Object URL（运行时生成，不持久化） */
	sketchUrl?: string
	/** 结果 Object URL（运行时生成，不持久化） */
	resultUrl?: string
	/** 使用的风格 ID */
	styleId: string
	/** 使用的风格名称（中文） */
	styleName: string
	/** 创建时间戳 */
	createdAt: number
}

/**
 * 存储的历史记录项（不含 URL）
 */
interface StoredHistoryItem {
	id: string
	sketchBlob: Blob
	resultBlob: Blob
	styleId: string
	styleName: string
	createdAt: number
}

// ==================== 常量 ====================

/** 数据库名称 */
const DB_NAME = 'shenbimaliang'

/** 数据库版本 */
const DB_VERSION = 1

/** 历史记录存储名称 */
const HISTORY_STORE = 'history'

/** 历史记录最大保存数量 */
export const MAX_HISTORY_SIZE = 50

// ==================== 数据库初始化 ====================

let dbPromise: Promise<IDBPDatabase> | null = null

/**
 * 获取数据库实例
 */
const getDB = (): Promise<IDBPDatabase> => {
	if (!dbPromise) {
		dbPromise = openDB(DB_NAME, DB_VERSION, {
			upgrade(db) {
				// 创建历史记录存储
				if (!db.objectStoreNames.contains(HISTORY_STORE)) {
					const store = db.createObjectStore(HISTORY_STORE, { keyPath: 'id' })
					// 按创建时间索引，用于排序
					store.createIndex('createdAt', 'createdAt')
				}
			},
		})
	}
	return dbPromise
}

// ==================== 工具函数 ====================

/**
 * 将 Data URL 转换为 Blob
 */
export const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
	const response = await fetch(dataUrl)
	return response.blob()
}

/**
 * 将 URL 转换为 Blob（用于远程图片）
 */
export const urlToBlob = async (url: string): Promise<Blob> => {
	const response = await fetch(url)
	return response.blob()
}

/**
 * 为历史记录项创建 Object URLs
 */
const createObjectUrls = (item: StoredHistoryItem): HistoryItem => {
	return {
		...item,
		sketchUrl: URL.createObjectURL(item.sketchBlob),
		resultUrl: URL.createObjectURL(item.resultBlob),
	}
}

/**
 * 释放 Object URLs（防止内存泄漏）
 */
export const revokeObjectUrls = (items: HistoryItem[]): void => {
	items.forEach((item) => {
		if (item.sketchUrl) URL.revokeObjectURL(item.sketchUrl)
		if (item.resultUrl) URL.revokeObjectURL(item.resultUrl)
	})
}

// ==================== 历史记录操作 ====================

/**
 * 获取所有历史记录（按时间倒序）
 */
export const getHistory = async (): Promise<HistoryItem[]> => {
	const db = await getDB()
	const items = await db.getAllFromIndex(HISTORY_STORE, 'createdAt')
	// 倒序排列（最新的在前）并添加 Object URLs
	return items.reverse().map(createObjectUrls)
}

/**
 * 添加历史记录
 */
export const addHistory = async (
	sketchDataUrl: string,
	resultUrl: string,
	style: StylePreset
): Promise<HistoryItem> => {
	const db = await getDB()

	// 转换为 Blob
	const sketchBlob = await dataUrlToBlob(sketchDataUrl)
	const resultBlob = await urlToBlob(resultUrl)

	const storedItem: StoredHistoryItem = {
		id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		sketchBlob,
		resultBlob,
		styleId: style.id,
		styleName: style.nameZh,
		createdAt: Date.now(),
	}

	// 添加新记录
	await db.add(HISTORY_STORE, storedItem)

	// 检查数量限制，删除最旧的记录
	const count = await db.count(HISTORY_STORE)
	if (count > MAX_HISTORY_SIZE) {
		const allItems = await db.getAllFromIndex(HISTORY_STORE, 'createdAt')
		const itemsToDelete = allItems.slice(0, count - MAX_HISTORY_SIZE)
		for (const item of itemsToDelete) {
			await db.delete(HISTORY_STORE, item.id)
		}
	}

	return createObjectUrls(storedItem)
}

/**
 * 删除历史记录
 */
export const deleteHistory = async (id: string): Promise<void> => {
	const db = await getDB()
	await db.delete(HISTORY_STORE, id)
}

/**
 * 清空所有历史记录
 */
export const clearHistory = async (): Promise<void> => {
	const db = await getDB()
	await db.clear(HISTORY_STORE)
}

/**
 * 获取历史记录数量
 */
export const getHistoryCount = async (): Promise<number> => {
	const db = await getDB()
	return db.count(HISTORY_STORE)
}
