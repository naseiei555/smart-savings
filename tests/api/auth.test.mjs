import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost';

test('API Auth - Integration Test Suite', async (t) => {
  const uniqueSuffix = Date.now();
  const testUser = {
    name: `User ${uniqueSuffix}`,
    email: `test_${uniqueSuffix}@example.com`,
    password: 'Password123!'
  };

  await t.test('1. Register successfully', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.message, 'สมัครสมาชิกสำเร็จ');
    assert.ok(data.user.id > 0);
    assert.equal(data.user.email, testUser.email);
  });

  await t.test('2. Register duplicate email returns 409', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    assert.equal(res.status, 409);
    const data = await res.json();
    assert.equal(data.error, 'อีเมลนี้ถูกใช้งานแล้วในระบบ');
  });

  await t.test('3. Register validation failures return 400', async () => {
    // Empty name
    const res1 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: 'valid@example.com', password: 'Password123!' })
    });
    assert.equal(res1.status, 400);

    // Short password
    const res2 = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Valid', email: 'valid2@example.com', password: '123' })
    });
    assert.equal(res2.status, 400);
  });

  let validToken = '';
  await t.test('4. Login successfully returns 200 and token with sub string', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: testUser.password })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token);
    validToken = data.token;
    assert.equal(data.user.email, testUser.email);
    assert.equal(data.user.password_hash, undefined);
  });

  await t.test('5. Login with wrong password returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUser.email, password: 'WrongPassword' })
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.error, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  });

  await t.test('6. Login with nonexistent email returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `nonexistent_${uniqueSuffix}@example.com`, password: 'Password123!' })
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.error, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
  });

  await t.test('7. GET /api/auth/me without token returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.error, 'การยืนยันตัวตนล้มเหลว กรุณาเข้าสู่ระบบใหม่');
  });

  await t.test('8. GET /api/auth/me with invalid header returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: 'Basic 123456' }
    });
    assert.equal(res.status, 401);
  });

  await t.test('9. GET /api/auth/me with valid token returns user profile without password_hash', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${validToken}` }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.email, testUser.email);
    assert.equal(data.name, testUser.name);
    assert.equal(data.password_hash, undefined);
  });
});
