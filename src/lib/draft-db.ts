/**
 * IndexedDB 草稿存储模块
 * @description 管理画布草稿的本地持久化存储
 */

import { type IDBPDatabase, openDB } from 'idb'

// ==================== 类型定义 ====================

/**
 * 草稿数据结构
 */
export interface Draft {
	/** 唯一标识符 */
	id: string
	/** ReactSketchCanvas 路径数据（JSON 字符串） */
	canvasData: string
	/** 选中的风格 ID */
	styleId: string
	/** 提示词（可选，未来功能预留） */
	prompt?: string
	/** 缩略图 Blob */
	thumbnailBlob?: Blob
	/** 创建时间戳 */
	createdAt: number
	/** 更新时间戳 */
	updatedAt: number
	/** 云端同步时间戳（可选） */
	syncedAt?: number
	/** 关联的用户 ID（已同步到云端时存在） */
	userId?: string
}

/**
 * 存储的草稿数据（完整结构）
 */
interface StoredDraft extends Draft {}

// ==================== 常量 ====================

/** 数据库名称 */
const DB_NAME = 'shenbimaliang'

/** 数据库版本 */
const DB_VERSION = 2 // 升级版本以添加 drafts store

/** 草稿存储名称 */
const DRAFTS_STORE = 'drafts'

/** 历史记录存储名称（已存在） */
const HISTORY_STORE = 'history'

/** 草稿最大保存数量 */
export const MAX_DRAFTS_SIZE = 10

// ==================== 数据库初始化 ====================

let dbPromise: Promise<IDBPDatabase> | null = null

/**
 * 获取数据库实例
 */
const getDB = (): Promise<IDBPDatabase> => {
	if (!dbPromise) {
		dbPromise = openDB(DB_NAME, DB_VERSION, {
			upgrade(db, oldVersion) {
				// 创建历史记录存储（如果不存在）
				if (!db.objectStoreNames.contains(HISTORY_STORE)) {
					const historyStore = db.createObjectStore(HISTORY_STORE, {
						keyPath: 'id',
					})
					historyStore.createIndex('createdAt', 'createdAt')
				}

				// 创建草稿存储（新增）
				if (oldVersion < 2 && !db.objectStoreNames.contains(DRAFTS_STORE)) {
					const draftsStore = db.createObjectStore(DRAFTS_STORE, {
						keyPath: 'id',
					})
					// 按更新时间索引，用于排序和清理
					draftsStore.createIndex('updatedAt', 'updatedAt')
				}
			},
		})
	}
	return dbPromise
}

// ==================== 草稿操作 ====================

/**
 * 保存草稿（新建或更新）
 * @param draft 草稿数据
 * @returns 保存的草稿
 */
export const saveDraft = async (
	draft: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<Draft> => {
	const db = await getDB()
	const now = Date.now()

	const storedDraft: StoredDraft = {
		id: draft.id || `draft-${now}-${Math.random().toString(36).substr(2, 9)}`,
		canvasData: draft.canvasData,
		styleId: draft.styleId,
		prompt: draft.prompt,
		thumbnailBlob: draft.thumbnailBlob,
		createdAt: draft.id ? (await getDraft(draft.id))?.createdAt || now : now,
		updatedAt: now,
		syncedAt: draft.syncedAt,
		userId: draft.userId,
	}

	// 使用 put 实现 upsert（如果 id 存在则更新，否则新建）
	await db.put(DRAFTS_STORE, storedDraft)

	// 检查数量限制，删除最旧的草稿
	await cleanupOldDrafts()

	return storedDraft
}

/**
 * 获取单个草稿
 * @param id 草稿 ID
 * @returns 草稿数据或 null
 */
export const getDraft = async (id: string): Promise<Draft | null> => {
	const db = await getDB()
	const draft = await db.get(DRAFTS_STORE, id)
	return draft || null
}

/**
 * 获取所有草稿（按更新时间倒序）
 * @returns 草稿列表
 */
export const getAllDrafts = async (): Promise<Draft[]> => {
	const db = await getDB()
	const drafts = await db.getAllFromIndex(DRAFTS_STORE, 'updatedAt')
	// 倒序排列（最新的在前）
	return drafts.reverse()
}

/**
 * 删除草稿
 * @param id 草稿 ID
 */
export const deleteDraft = async (id: string): Promise<void> => {
	const db = await getDB()
	await db.delete(DRAFTS_STORE, id)
}

/**
 * 清空所有草稿
 */
export const clearAllDrafts = async (): Promise<void> => {
	const db = await getDB()
	await db.clear(DRAFTS_STORE)
}

/**
 * 获取草稿数量
 * @returns 草稿数量
 */
export const getDraftsCount = async (): Promise<number> => {
	const db = await getDB()
	return db.count(DRAFTS_STORE)
}

/**
 * 获取最新的草稿
 * @returns 最新的草稿或 null
 */
export const getLatestDraft = async (): Promise<Draft | null> => {
	const drafts = await getAllDrafts()
	return drafts[0] || null
}

/**
 * 清理超过数量限制的旧草稿
 */
const cleanupOldDrafts = async (): Promise<void> => {
	const db = await getDB()
	const count = await db.count(DRAFTS_STORE)

	if (count > MAX_DRAFTS_SIZE) {
		const allDrafts = await db.getAllFromIndex(DRAFTS_STORE, 'updatedAt')
		// 删除最旧的草稿
		const draftsToDelete = allDrafts.slice(0, count - MAX_DRAFTS_SIZE)
		for (const draft of draftsToDelete) {
			await db.delete(DRAFTS_STORE, draft.id)
		}
	}
}
