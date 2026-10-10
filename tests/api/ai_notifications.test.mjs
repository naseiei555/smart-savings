import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.BASE_URL || 'http://localhost';

describe('Block B4 API Tests - AI Analysis & Notifications', () => {
  let tokenUserA = '';
  let tokenUserB = '';
  let goalIdUserA = 0;
  let notifIdUserA = 0;

  const userA = {
    name: 'B4 Tester A',
    email: `b4_tester_a_${Date.now()}@example.com`,
    password: 'password123'
  };

  const userB = {
    name: 'B4 Tester B',
    email: `b4_tester_b_${Date.now()}@example.com`,
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

    // 3. Create Goal for User A (near deadline: 5 days left)
    const today = new Date();
    const inFiveDays = new Date(today.getTime() + 5 * 86400000).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    res = await fetch(`${BASE_URL}/api/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenUserA}`
      },
      body: JSON.stringify({
        name: 'Emergency Fund 2026',
        target_amount: 20000,
        initial_amount: 10000,
        start_date: todayStr,
        target_date: inFiveDays
      })
    });
    assert.strictEqual(res.status, 201);
    const goalData = await res.json();
    goalIdUserA = goalData.id;
  });

  describe('1. AI Analysis Endpoints & Fallback', () => {
    it('POST /api/goals/:id/analyze generates analysis with disclaimer and fallback', async () => {
      const res = await fetch(`${BASE_URL}/api/goals/${goalIdUserA}/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.goal_id, goalIdUserA);
      assert.ok(data.status);
      assert.ok(data.risk_level);
      assert.ok(data.summary && data.summary.length > 0);
      assert.ok(data.recommendation && data.recommendation.length > 0);
      assert.strictEqual(typeof data.is_fallback, 'boolean');
      assert.ok(data.disclaimer.includes('ไม่ใช่คำแนะนำทางการเงิน'));
    });

    it('User B CANNOT trigger AI analysis on User A goal (returns 404)', async () => {
      const res = await fetch(`${BASE_URL}/api/goals/${goalIdUserA}/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenUserB}` }
      });
      assert.strictEqual(res.status, 404);
    });
  });

  describe('2. Notifications Endpoints & Reminder Trigger', () => {
    it('POST /api/notifications/trigger-reminders generates in-app reminders', async () => {
      const res = await fetch(`${BASE_URL}/api/notifications/trigger-reminders`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
      assert.ok(data.generated_count >= 1);
    });

    it('GET /api/notifications lists notifications with unread count', async () => {
      const res = await fetch(`${BASE_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data.notifications));
      assert.ok(data.notifications.length >= 1);
      assert.ok(data.unread_count >= 1);
      const firstNotif = data.notifications[0];
      assert.strictEqual(firstNotif.is_read, false);
      notifIdUserA = firstNotif.id;
    });

    it('User B CANNOT mark User A notification as read (returns 404)', async () => {
      const res = await fetch(`${BASE_URL}/api/notifications/${notifIdUserA}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${tokenUserB}` }
      });
      assert.strictEqual(res.status, 404);
    });

    it('PUT /api/notifications/:id/read marks single notification as read', async () => {
      const res = await fetch(`${BASE_URL}/api/notifications/${notifIdUserA}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);
    });

    it('PUT /api/notifications/read-all marks all notifications as read', async () => {
      const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.success, true);

      // Verify unread count is now 0
      const listRes = await fetch(`${BASE_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });
      const listData = await listRes.json();
      assert.strictEqual(listData.unread_count, 0);
    });
  });
});
