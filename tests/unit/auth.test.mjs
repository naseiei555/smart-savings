import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const jwt = require('jsonwebtoken');
const { verifyAuthHeader, GENERIC_AUTH_ERROR } = require('../../backend/node-red/data/lib/auth.js');

const SECRET = 'test_secret_key_12345';

test('verifyAuthHeader - Valid Token returns integer userId', () => {
  const token = jwt.sign({ sub: '42' }, SECRET, { algorithm: 'HS256' });
  const result = verifyAuthHeader(`Bearer ${token}`, SECRET);
  assert.equal(result.userId, 42);
  assert.equal(typeof result.userId, 'number');
});

test('verifyAuthHeader - Missing header throws INVALID_HEADER_FORMAT', () => {
  assert.throws(
    () => verifyAuthHeader(null, SECRET),
    (err) => err.code === 'INVALID_HEADER_FORMAT' && err.clientMessage === GENERIC_AUTH_ERROR
  );
});

test('verifyAuthHeader - Header without Bearer prefix throws INVALID_HEADER_FORMAT', () => {
  assert.throws(
    () => verifyAuthHeader('Basic 123456', SECRET),
    (err) => err.code === 'INVALID_HEADER_FORMAT' && err.clientMessage === GENERIC_AUTH_ERROR
  );
});

test('verifyAuthHeader - Empty Bearer token throws EMPTY_TOKEN', () => {
  assert.throws(
    () => verifyAuthHeader('Bearer ', SECRET),
    (err) => err.code === 'EMPTY_TOKEN' && err.clientMessage === GENERIC_AUTH_ERROR
  );
});

test('verifyAuthHeader - Expired token throws TokenExpiredError', () => {
  const token = jwt.sign({ sub: '42' }, SECRET, { algorithm: 'HS256', expiresIn: '-1s' });
  assert.throws(
    () => verifyAuthHeader(`Bearer ${token}`, SECRET),
    (err) => err.code === 'TokenExpiredError' && err.clientMessage === GENERIC_AUTH_ERROR
  );
});

test('verifyAuthHeader - Wrong secret throws JsonWebTokenError', () => {
  const token = jwt.sign({ sub: '42' }, 'wrong_secret', { algorithm: 'HS256' });
  assert.throws(
    () => verifyAuthHeader(`Bearer ${token}`, SECRET),
    (err) => err.code === 'JsonWebTokenError' && err.clientMessage === GENERIC_AUTH_ERROR
  );
});

test('verifyAuthHeader - Algorithm none rejected', () => {
  const algNoneToken =
    Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url') +
    '.' +
    Buffer.from(JSON.stringify({ sub: '42' })).toString('base64url') +
    '.';

  assert.throws(
    () => verifyAuthHeader(`Bearer ${algNoneToken}`, SECRET),
    (err) => err.code === 'JsonWebTokenError' && err.clientMessage === GENERIC_AUTH_ERROR
  );
});

test('verifyAuthHeader - Non-numeric sub throws INVALID_SUB', () => {
  const token = jwt.sign({ sub: 'admin_user' }, SECRET, { algorithm: 'HS256' });
  assert.throws(
    () => verifyAuthHeader(`Bearer ${token}`, SECRET),
    (err) => err.code === 'INVALID_SUB' && err.clientMessage === GENERIC_AUTH_ERROR
  );
});

test('verifyAuthHeader - Non-positive integer sub (0, negative, decimal) throws INVALID_SUB', () => {
  for (const badSub of ['0', '-5', '3.14']) {
    const token = jwt.sign({ sub: badSub }, SECRET, { algorithm: 'HS256' });
    assert.throws(
      () => verifyAuthHeader(`Bearer ${token}`, SECRET),
      (err) => err.code === 'INVALID_SUB' && err.clientMessage === GENERIC_AUTH_ERROR
    );
  }
});
