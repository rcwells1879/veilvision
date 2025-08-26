import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export interface Generation {
  id: string
  user_id: string
  original_filename: string
  prompt: string
  result_url?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
  created_at: Date
  updated_at: Date
}

export interface User {
  id: string
  clerk_user_id: string
  email: string
  display_name?: string
  created_at: Date
  updated_at: Date
}

export const db = {
  async createUser(clerkUserId: string, email: string, displayName?: string) {
    const result = await sql`
      INSERT INTO users (clerk_user_id, email, display_name, created_at, updated_at)
      VALUES (${clerkUserId}, ${email}, ${displayName}, NOW(), NOW())
      RETURNING *
    `
    return result[0] as User
  },

  async getUser(clerkUserId: string) {
    const result = await sql`
      SELECT * FROM users WHERE clerk_user_id = ${clerkUserId}
    `
    return result[0] as User | undefined
  },

  async createGeneration(userId: string, originalFilename: string, prompt: string) {
    const result = await sql`
      INSERT INTO generations (user_id, original_filename, prompt, status, created_at, updated_at)
      VALUES (${userId}, ${originalFilename}, ${prompt}, 'pending', NOW(), NOW())
      RETURNING *
    `
    return result[0] as Generation
  },

  async updateGeneration(id: string, updates: Partial<Generation>) {
    const setClause = Object.entries(updates)
      .map(([key, value]) => `${key} = ${value}`)
      .join(', ')

    const result = await sql`
      UPDATE generations 
      SET ${sql(updates)}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] as Generation
  },

  async getUserGenerations(userId: string, limit = 50) {
    const result = await sql`
      SELECT * FROM generations 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result as Generation[]
  },

  async getGeneration(id: string) {
    const result = await sql`
      SELECT * FROM generations WHERE id = ${id}
    `
    return result[0] as Generation | undefined
  }
}