import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Ce fichier s'exécute AVANT chaque requête correspondant au matcher ci-dessous.
// Il protège les routes privées sans toucher aux pages publiques.
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const pathname = req.nextUrl.pathname

  // Routes nécessitant une simple connexion (n'importe quel utilisateur connecté)
  const requiresAuth =
    pathname.startsWith('/bibliotheque') ||
    pathname.startsWith('/api/download') ||
    pathname.startsWith('/api/checkout') ||
    pathname.startsWith('/compte') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin')

  if (requiresAuth && !token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
    }
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Routes admin : exige le rôle ADMIN
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (token?.role !== 'ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }
      return NextResponse.redirect(new URL('/login?error=admin_required', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/bibliotheque/:path*',
    '/bibliotheque',
    '/compte/:path*',
    '/compte',
    '/api/download/:path*',
    '/api/checkout/:path*',
  ],
}
