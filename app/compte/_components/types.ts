export interface UserProfile {
  name: string | null
  email: string
  avatar: string | null
}

export type Msg = { type: 'ok' | 'err'; text: string }
