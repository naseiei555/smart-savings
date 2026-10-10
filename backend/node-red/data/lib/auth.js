/**
 * Authentication & JWT helper module
 */
const jwt = require('jsonwebtoken');

const GENERIC_AUTH_ERROR = 'การยืนยันตัวตนล้มเหลว กรุณาเข้าสู่ระบบใหม่';

/**
 * Verify Authorization header and return userId
 * @param {string} authHeader - e.g. "Bearer <token>"
 * @param {string} secret - JWT Secret
 * @returns {{ userId: number }}
 */
function verifyAuthHeader(authHeader, secret) {
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Missing or invalid Authorization header format');
    err.code = 'INVALID_HEADER_FORMAT';
    err.clientMessage = GENERIC_AUTH_ERROR;
    throw err;
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    const err = new Error('Empty Bearer token');
    err.code = 'EMPTY_TOKEN';
    err.clientMessage = GENERIC_AUTH_ERROR;
    throw err;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, secret, {
      algorithms: ['HS256']
    });
  } catch (jwtErr) {
    const err = new Error(jwtErr.message || 'JWT verification failed');
    err.code = jwtErr.name || 'JWT_VERIFY_ERROR';
    err.clientMessage = GENERIC_AUTH_ERROR;
    throw err;
  }

  // RFC 7519: sub must be converted and verified as positive integer
  const subNum = Number(decoded.sub);
  if (!Number.isInteger(subNum) || subNum <= 0) {
    const err = new Error(`Invalid subject claim: ${decoded.sub}`);
    err.code = 'INVALID_SUB';
    err.clientMessage = GENERIC_AUTH_ERROR;
    throw err;
  }

  return { userId: subNum };
}

module.exports = {
  verifyAuthHeader,
  GENERIC_AUTH_ERROR
};
