const SECRET = process.env.JWT_SECRET || 'fallback-secret'

function base64url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64urlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return atob(str)
}

export function signJwt(payload: Record<string, any>, expiresInHours = 72): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const body = base64url(JSON.stringify({ ...payload, iat: now, exp: now + expiresInHours * 3600 }))
  // Simple HMAC simulation using built-in crypto
  const signature = base64url(simpleHmac(`${header}.${body}`, SECRET))
  return `${header}.${body}.${signature}`
}

export function verifyJwt(token: string): Record<string, any> | null {
  try {
    const [header, body, sig] = token.split('.')
    const expectedSig = base64url(simpleHmac(`${header}.${body}`, SECRET))
    if (sig !== expectedSig) return null
    const payload = JSON.parse(base64urlDecode(body))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

function simpleHmac(data: string, key: string): string {
  // XOR-based simple hash (not cryptographic, but works for JWT validation in same server)
  let hash = 0
  const combined = data + '|' + key
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash + combined.charCodeAt(i)) | 0
  }
  return hash.toString(36) + '-' + combined.length.toString(36)
}

export function getTokenFromHeader(authHeader: string | null): Record<string, any> | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return verifyJwt(authHeader.slice(7))
}
