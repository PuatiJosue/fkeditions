export interface UserRow {
  id: string
  name: string | null
  email: string
  role: string
  avatar: string | null
  purchaseCount: number
  commentCount: number
  blocked: boolean
  blockedReason: string | null
  blockedAt: string | null
  deletedAt: string | null
  createdAt: string
}

export type FilterKey = 'all' | 'active' | 'blocked' | 'suspended' | 'admin'
