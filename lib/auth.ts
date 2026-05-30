import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { rateLimit } from '@/lib/rateLimit'
import { logLogin } from '@/lib/auditLog'
import crypto from 'crypto'

const SESSION_HOURS = 24

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        const ip = (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? 'unknown'
        const ua = (req?.headers?.['user-agent'] as string) ?? ''
        if (!rateLimit(ip, `login:${credentials.email}`, { limit: 5, window: 900 })) return null

        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        await logLogin(user.id, ip, ua, valid)
        if (!valid) return null

        // Refuse login si compte supprimé (soft delete)
        if (user.deletedAt) {
          throw new Error('ACCOUNT_DELETED')
        }

        // Refuse login si compte bloqué (modération)
        if (user.blocked) {
          throw new Error('ACCOUNT_BLOCKED')
        }

        // Vérifie si une session active existe déjà (hors admin)
        if (user.role !== 'ADMIN' && user.currentSessionId && user.currentSessionAt) {
          const ageHours = (Date.now() - new Date(user.currentSessionAt).getTime()) / (1000 * 60 * 60)
          if (ageHours < SESSION_HOURS) {
            throw new Error('ALREADY_CONNECTED')
          }
        }

        // Enregistre la nouvelle session
        const sessionId = crypto.randomUUID()
        await prisma.user.update({
          where: { id: user.id },
          data: { currentSessionId: sessionId, currentSessionAt: new Date() },
        })

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.id) {
        await prisma.user.update({
          where: { id: token.id as string },
          data: { currentSessionId: null, currentSessionAt: null },
        }).catch(() => {})
      }
    },
  },
}
