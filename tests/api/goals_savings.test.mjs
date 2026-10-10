import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.BASE_URL || 'http://localhost';

describe('Block B2 API Tests - Goals & Savings', () => {
  let tokenUserA = '';
  let tokenUserB = '';
  let userAId = 0;
  let userBId = 0;
  let testGoalId = 0;
  let otherGoalId = 0;
  let testSavingId = 0;

  const testUserA = {
    name: 'Goal Tester A',
    email: `tester_a_${Date.now()}@example.com`,
    password: 'password123'
  };

  const testUserB = {
    name: 'Goal Tester B',
    email: `tester_b_${Date.now()}@example.com`,
    password: 'password123'
  };

  before(async () => {
    // 1. Register and Login User A
    let res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUserA)
    });
    assert.strictEqual(res.status, 201, 'User A should register successfully');

    res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserA.email, password: testUserA.password })
    });
    assert.strictEqual(res.status, 200, 'User A should login successfully');
    const dataA = await res.json();
    tokenUserA = dataA.token;
    userAId = dataA.user.id;

    // 2. Register and Login User B
    res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUserB)
    });
    assert.strictEqual(res.status, 201, 'User B should register successfully');

    res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testUserB.email, password: testUserB.password })
    });
    assert.strictEqual(res.status, 200, 'User B should login successfully');
    const dataB = await res.json();
    tokenUserB = dataB.token;
    userBId = dataB.user.id;
  });

  describe('1. Goal Validation and CRUD', () => {
    it('rejects POST /api/goals with invalid inputs', async () => {
      // Missing name
      let res = await fetch(`${BASE_URL}/api/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenUserA}`
        },
        body: JSON.stringify({
          name: '',
          target_amount: 10000,
          target_date: '2026-12-31'
        })
      });
      assert.strictEqual(res.status, 400);
      let body = await res.json();
      assert.ok(body.error);

      // Target amount <= 0
      res = await fetch(`${BASE_URL}/api/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenUserA}`
        },
        body: JSON.stringify({
          name: 'Invalid Goal',
          target_amount: 0,
          target_date: '2026-12-31'
        })
      });
      assert.strictEqual(res.status, 400);

      // Past target_date (before today)
      res = await fetch(`${BASE_URL}/api/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenUserA}`
        },
        body: JSON.stringify({
          name: 'Past Goal',
          target_amount: 5000,
          start_date: '2026-10-10',
          target_date: '2020-01-01'
        })
      });
      assert.strictEqual(res.status, 400);
    });

    it('creates a valid goal via POST /api/goals', async () => {
      const res = await fetch(`${BASE_URL}/api/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenUserA}`
        },
        body: JSON.stringify({
          name: 'Buy Laptop',
          target_amount: 30000,
          start_date: '2026-10-10',
          target_date: '2026-12-31',
          initial_amount: 5000
        })
      });

      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.ok(data.id);
      assert.strictEqual(data.name, 'Buy Laptop');
      assert.strictEqual(data.target_amount, 30000);
      assert.strictEqual(data.initial_amount, 5000);
      assert.ok(data.metrics);
      assert.strictEqual(data.metrics.current, 5000);
      assert.strictEqual(data.metrics.remaining, 25000);
      testGoalId = data.id;
    });

    it('lists goals via GET /api/goals with computed metrics', async () => {
      const res = await fetch(`${BASE_URL}/api/goals`, {
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data));
      assert.strictEqual(data.length, 1);
      const g = data[0];
      assert.strictEqual(g.id, testGoalId);
      assert.strictEqual(g.initial_amount, 5000);
      assert.strictEqual(g.target_amount, 30000);
      assert.ok(g.metrics !== undefined);
      assert.strictEqual(g.metrics.current, 5000);
      assert.strictEqual(g.metrics.remaining, 25000);
      assert.ok(g.metrics.daily > 0);
      assert.ok(g.metrics.status);
    });

    it('retrieves single goal via GET /api/goals/:id', async () => {
      const res = await fetch(`${BASE_URL}/api/goals/${testGoalId}`, {
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.id, testGoalId);
      assert.strictEqual(data.name, 'Buy Laptop');
      assert.strictEqual(data.target_amount, 30000);
      assert.strictEqual(data.initial_amount, 5000);
      assert.ok(data.metrics);
    });

    it('updates a goal via PUT /api/goals/:id', async () => {
      const res = await fetch(`${BASE_URL}/api/goals/${testGoalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenUserA}`
        },
        body: JSON.stringify({
          name: 'Buy Gaming Laptop',
          target_amount: 35000,
          initial_amount: 5000,
          start_date: '2026-10-10',
          target_date: '2026-12-31'
        })
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.name, 'Buy Gaming Laptop');
      assert.strictEqual(data.target_amount, 35000);
      assert.strictEqual(data.metrics.remaining, 30000);
    });
  });

  describe('2. Multi-tenant Authorization Enforcement', () => {
    it('creates a goal for User B', async () => {
      const res = await fetch(`${BASE_URL}/api/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenUserB}`
        },
        body: JSON.stringify({
          name: 'User B Vacation',
          target_amount: 15000,
          start_date: '2026-10-10',
          target_date: '2026-11-30'
        })
      });

      assert.strictEqual(res.status, 201);
      const data = await res.json();
      otherGoalId = data.id;
      assert.ok(otherGoalId);
    });

    it('User B CANNOT access User A goal (returns 404)', async () => {
      const res = await fetch(`${BASE_URL}/api/goals/${testGoalId}`, {
        headers: { 'Authorization': `Bearer ${tokenUserB}` }
      });
      assert.strictEqual(res.status, 404);
    });

    it('User B CANNOT update User A goal (returns 404)', async () => {
      const res = await fetch(`${BASE_URL}/api/goals/${testGoalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenUserB}`
        },
        body: JSON.stringify({
          name: 'Hacked Goal Name',
          target_amount: 10000,
          start_date: '2026-10-10',
          target_date: '2026-12-31'
        })
      });
      assert.strictEqual(res.status, 404);
    });

    it('User B CANNOT add saving to User A goal (returns 404)', async () => {
      const res = await fetch(`${BASE_URL}/api/goals/${testGoalId}/savings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenUserB}`
        },
        body: JSON.stringify({
          amount: 500,
          saving_date: '2026-10-10'
        })
      });
      assert.strictEqual(res.status, 404);
    });
  });

  describe('3. Savings Transactions & Current Amount Recalculation', () => {
    it('adds saving deposit via POST /api/goals/:id/savings', async () => {
      const res = await fetch(`${BASE_URL}/api/goals/${testGoalId}/savings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenUserA}`
        },
        body: JSON.stringify({
          amount: 2500,
          saving_date: '2026-10-10',
          note: 'Weekly savings'
        })
      });

      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.ok(data.id);
      assert.strictEqual(Number(data.amount), 2500);
      assert.strictEqual(data.metrics.current, 7500); // 5000 + 2500
      assert.strictEqual(data.metrics.status, 'on_track');
      testSavingId = data.id;
    });

    it('lists savings via GET /api/goals/:id/savings', async () => {
      const res = await fetch(`${BASE_URL}/api/goals/${testGoalId}/savings`, {
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(Array.isArray(data));
      assert.strictEqual(data.length, 1); // 1 added saving transaction
      assert.strictEqual(Number(data[0].amount), 2500);
    });

    it('recalculates goal status to completed when target is met', async () => {
      // Target is 35000, current is 7500. Add 28000.
      const res = await fetch(`${BASE_URL}/api/goals/${testGoalId}/savings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenUserA}`
        },
        body: JSON.stringify({
          amount: 28000,
          saving_date: '2026-10-10',
          note: 'Big bonus'
        })
      });

      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert.strictEqual(data.metrics.current, 35500);
      assert.strictEqual(data.metrics.status, 'completed');
    });

    it('deleting a saving rolls back goal status to active', async () => {
      const res = await fetch(`${BASE_URL}/api/savings/${testSavingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });

      assert.strictEqual(res.status, 204);

      // Verify goal detail status returned to active
      const getRes = await fetch(`${BASE_URL}/api/goals/${testGoalId}`, {
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });
      assert.strictEqual(getRes.status, 200);
      const goalData = await getRes.json();
      // Was 35500, removed 2500 -> 33000 (< 35000)
      assert.strictEqual(goalData.metrics.current, 33000);
      assert.strictEqual(goalData.status, 'active');
    });

    it('User B CANNOT delete User A saving (returns 404)', async () => {
      // Find remaining saving from testGoal
      const listRes = await fetch(`${BASE_URL}/api/goals/${testGoalId}/savings`, {
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });
      const listData = await listRes.json();
      const remainingSaving = listData[0];

      const res = await fetch(`${BASE_URL}/api/savings/${remainingSaving.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenUserB}` }
      });
      assert.strictEqual(res.status, 404);
    });
  });

  describe('4. Dashboard and Analysis Endpoints', () => {
    it('GET /api/dashboard returns aggregated summary and active goals', async () => {
      const res = await fetch(`${BASE_URL}/api/dashboard`, {
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.summary);
      assert.strictEqual(data.summary.total_goals, 1);
      assert.strictEqual(data.summary.total_saved, 33000);
      assert.strictEqual(data.summary.active_goals, 1);
      assert.strictEqual(data.summary.completed_goals, 0);
      assert.ok(Array.isArray(data.goals));
      assert.strictEqual(data.goals.length, 1);
      assert.ok(data.today_saving_total >= 0);
      assert.ok(Array.isArray(data.upcoming_deadlines));
      assert.ok(data.unread_notifications >= 1);
    });

    it('GET /api/goals/:id/analysis returns chart series and metrics', async () => {
      const res = await fetch(`${BASE_URL}/api/goals/${testGoalId}/analysis`, {
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.goal);
      assert.strictEqual(data.goal.id, testGoalId);
      assert.ok(data.metrics);
      assert.ok(data.chart);
      assert.ok(Array.isArray(data.chart.labels));
      assert.ok(Array.isArray(data.chart.planned));
      assert.ok(Array.isArray(data.chart.actual));
    });
  });

  describe('5. Goal Deletion', () => {
    it('deletes goal via DELETE /api/goals/:id and cascades savings', async () => {
      const res = await fetch(`${BASE_URL}/api/goals/${testGoalId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });

      assert.strictEqual(res.status, 204);

      // Verify 404 afterwards
      const getRes = await fetch(`${BASE_URL}/api/goals/${testGoalId}`, {
        headers: { 'Authorization': `Bearer ${tokenUserA}` }
      });
      assert.strictEqual(getRes.status, 404);
    });
  });
});
