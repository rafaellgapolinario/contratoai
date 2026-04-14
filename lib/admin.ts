import { getTokenFromHeader } from './jwt'

const MASTER_EMAIL = 'gardaszconsultoria@gmail.com'
const ADMIN_EMAILS = [MASTER_EMAIL, 'murilodesaferreira@gmail.com']

export function getAdminFromHeader(authHeader: string | null): Record<string, any> | null {
  const payload = getTokenFromHeader(authHeader)
  if (!payload?.email || !ADMIN_EMAILS.includes(payload.email)) return null
  return payload
}

export function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email)
}

export function isMaster(email: string): boolean {
  return email === MASTER_EMAIL
}
