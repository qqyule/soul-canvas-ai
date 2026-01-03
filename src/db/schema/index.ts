/**
 * 数据库 Schema 统一导出
 * @description 导出所有表结构、类型和验证 Schema
 */

// ==================== 表结构 ====================

export { users, type User, type NewUser } from './users'
export { artworks, type Artwork, type NewArtwork } from './artworks'
export {
	customStyles,
	type CustomStyle,
	type NewCustomStyle,
} from './custom-styles'
export { favorites, type Favorite, type NewFavorite } from './favorites'
export {
	generationLogs,
	type GenerationLog,
	type NewGenerationLog,
	type GenerationStatus,
	GENERATION_STATUS,
} from './generation-logs'

// ==================== Zod 验证 Schema ====================

export {
	// Users
	insertUserSchema,
	selectUserSchema,
	updateUserSchema,
	type InsertUser,
	type UpdateUser,
	// Artworks
	insertArtworkSchema,
	selectArtworkSchema,
	updateArtworkSchema,
	type InsertArtwork,
	type UpdateArtwork,
	// Custom Styles
	insertCustomStyleSchema,
	selectCustomStyleSchema,
	type InsertCustomStyle,
	// Favorites
	insertFavoriteSchema,
	selectFavoriteSchema,
	type InsertFavorite,
	// Generation Logs
	insertGenerationLogSchema,
	selectGenerationLogSchema,
	type InsertGenerationLog,
} from './validators'
