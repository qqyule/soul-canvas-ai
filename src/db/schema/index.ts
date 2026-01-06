/**
 * 数据库 Schema 统一导出
 * @description 导出所有表结构、类型和验证 Schema
 */

// ==================== 表结构 ====================

export { type Artwork, artworks, type NewArtwork } from './artworks'
export {
	type CustomStyle,
	customStyles,
	type NewCustomStyle,
} from './custom-styles'
export { type Favorite, favorites, type NewFavorite } from './favorites'
export {
	GENERATION_STATUS,
	type GenerationLog,
	type GenerationStatus,
	generationLogs,
	type NewGenerationLog,
} from './generation-logs'
export { type NewUser, type User, users } from './users'

// ==================== Zod 验证 Schema ====================

export {
	type InsertArtwork,
	type InsertCustomStyle,
	type InsertFavorite,
	type InsertGenerationLog,
	type InsertUser,
	// Artworks
	insertArtworkSchema,
	// Custom Styles
	insertCustomStyleSchema,
	// Favorites
	insertFavoriteSchema,
	// Generation Logs
	insertGenerationLogSchema,
	// Users
	insertUserSchema,
	selectArtworkSchema,
	selectCustomStyleSchema,
	selectFavoriteSchema,
	selectGenerationLogSchema,
	selectUserSchema,
	type UpdateArtwork,
	type UpdateUser,
	updateArtworkSchema,
	updateUserSchema,
} from './validators'
