import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dailyflow_secure_jwt_secret_key_2026_fintech_production';
const DEFAULT_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Hashes a plaintext password using crypto.scrypt with a unique cryptographically secure salt.
 * Formatted as: scrypt:<salt>:<derivedKeyHex>
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a stored scrypt hash using timingSafeEqual to prevent timing attacks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      return false;
    }
    const salt = parts[1];
    const originalKeyHex = parts[2];
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const originalBuffer = Buffer.from(originalKeyHex, 'hex');
    if (derivedKey.length !== originalBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(derivedKey, originalBuffer);
  } catch {
    return false;
  }
}

export interface TokenPayload {
  sub: string; // User UUID
  username: string;
  iat?: number;
  exp?: number;
}

/**
 * Generates an HMAC-SHA256 JWT token with secure signature.
 */
export function generateToken(payload: { sub: string; username: string }, expiresInSeconds = DEFAULT_TOKEN_EXPIRY): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const data = `${b64Header}.${b64Payload}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');

  return `${data}.${signature}`;
}

/**
 * Validates and decodes a JWT token. Returns null if invalid or expired.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [b64Header, b64Payload, signature] = parts;
    const data = `${b64Header}.${b64Payload}`;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
