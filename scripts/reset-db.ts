import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'

// Load env vars
config({ path: '.env.local' })

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
	console.error('DATABASE_URL not found')
	process.exit(1)
}

const sql = neon(dbUrl)

async function main() {
	console.log('Starting DB reset...')
	try {
		await sql`DROP TABLE IF EXISTS "favorites" CASCADE`
		await sql`DROP TABLE IF EXISTS "artworks" CASCADE`
		await sql`DROP TABLE IF EXISTS "users" CASCADE`
		await sql`DROP TABLE IF EXISTS "custom_styles" CASCADE`
		await sql`DROP TABLE IF EXISTS "generation_logs" CASCADE`
		// Drop migration table too to reset state
		await sql`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE`
		console.log('All tables dropped successfully.')
	} catch (e) {
		console.error('Error dropping tables:', e)
	}
}

main()
