import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.BASE_URL || 'http://localhost';

describe('Block B5 API Tests - LINE Linking & Daily Scheduler', () => {
  let tokenUserA = '';
  let tokenUserB = '';
  let linkCodeA = '';

  const userA = {
    name: 'LINE Tester A',
    email: `line_tester_a_${Date.now()}@example.com`,
    password: 'password123'
  };

  const userB = {
    name: 'LINE Tester B',
    email: `line_tester_b_${Date.now()}@example.com`,
    password: 'password123'
  };

  before(async () => {
    // 1. Setup User A
    let res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userA)
    });
    assert.strictEqual(res.status, 201);

    res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userA.email, password: userA.password })
    });
    const dataA = await res.json();
    tokenUserA = dataA.token;

    // 2. Setup User B
    res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userB)
    });
    assert.strictEqual(res.status, 201);

    res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userB.email, password: userB.password })
    });
    const dataB = await res.json();
    tokenUserB = dataB.token;

    // 3. Create active goal for User A
    const todayStr = new Date().toISOString().split('T')[0];
    const targetStr = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];
    await fetch(`${BASE_URL}/api/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenUserA}`
      },
      body: JSON.stringify({
        name: 'LINE Notification Goal',
        target_amount: 10000,
        initial_amount: 2000,
        start_date: todayStr,
        target_date: targetStr
      })
    });
  });

  describe('1. LINE Account Linking Flow', () => {
    it('GET /api/line/status returns is_connected false initially', async () => {
      const res = await fetch(`${BASE_URL}/api/line/status`, {
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.is_connected, false);
    });

    it('POST /api/line/link-code generates a 6-digit OTP code', async () => {
      const res = await fetch(`${BASE_URL}/api/line/link-code`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.code);
      assert.match(data.code, /^\d{6}$/);
      assert.ok(data.expires_at);
      linkCodeA = data.code;
    });

    it('Simulate LINE Webhook with linking code to connect account', async () => {
      const webhookPayload = {
        destination: 'U1234567890',
        events: [
          {
            type: 'message',
            message: {
              type: 'text',
              id: 'msg_101',
              text: linkCodeA
            },
            source: {
              type: 'user',
              userId: 'U_TEST_LINE_USER_001'
            }
          }
        ]
      };

      const res = await fetch(`${BASE_URL}/api/line/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
    });

    it('GET /api/line/status reflects connected status after linking', async () => {
      const res = await fetch(`${BASE_URL}/api/line/status`, {
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.is_connected, true);
      assert.ok(data.line_user_id);
    });

    it('POST /api/line/disconnect unlinks account successfully', async () => {
      const res = await fetch(`${BASE_URL}/api/line/disconnect`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);

      // Verify status is false again
      const checkRes = await fetch(`${BASE_URL}/api/line/status`, {
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });
      const checkData = await checkRes.json();
      assert.strictEqual(checkData.is_connected, false);
    });
  });

  describe('2. Daily Scheduler Trigger', () => {
    it('POST /api/scheduler/run-daily processes active goals and dispatches reminders', async () => {
      const res = await fetch(`${BASE_URL}/api/scheduler/run-daily`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.date);
      assert.ok(data.users_processed >= 1);
    });
  });
});
