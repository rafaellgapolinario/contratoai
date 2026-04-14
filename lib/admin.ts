import { getTokenFromHeader } from './jwt'

const ADMIN_EMAIL = 'gardaszconsultoria@gmail.com'

export function getAdminFromHeader(authHeader: string | null): Record<string, any> | null {
  const payload = getTokenFromHeader(authHeader)
  if (!payload?.email || payload.email !== ADMIN_EMAIL) return null
  return payload
}

export function isAdmin(email: string): boolean {
  return email === ADMIN_EMAIL
}
